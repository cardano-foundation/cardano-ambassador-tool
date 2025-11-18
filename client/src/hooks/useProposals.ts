import { useApp } from '@/context';
import { lovelaceToAda, parseMemberDatum, parseProposalDatum } from '@/utils';
import { Proposal } from '@types';
import { useEffect, useMemo, useState } from 'react';

const useProposals = () => {
  const {
    proposals,
    proposalIntents,
    signOfApprovals,
    dbLoading,
    members,
  } = useApp();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);

  /* -----------------------------------------------------
     Sync loading state
  ----------------------------------------------------- */
  useEffect(() => {
    setLoading(dbLoading);
  }, [dbLoading]);

  /* -----------------------------------------------------
     Combined UTXOs
  ----------------------------------------------------- */
  const proposalsUtxos = useMemo(
    () => [...proposalIntents, ...proposals, ...signOfApprovals],
    [proposalIntents, proposals, signOfApprovals],
  );

  /* -----------------------------------------------------
     Completed proposals (from members)
  ----------------------------------------------------- */
  const completedProposals = useMemo(() => {
    return members.flatMap((mbr) => {
      const parsed = parseMemberDatum(mbr.plutusData!);
      if (!parsed) return [];
      return Array.from(parsed.member.completion!, ([proposal, value]) => ({
        ...proposal,
        status: 'paid_out' as Proposal['status'],
        fundsRequested: lovelaceToAda(value),
        txHash: undefined,
        description: 'No description provided',
      }));
    });
  }, [members]);

  /* -----------------------------------------------------
     Parse active proposals
  ----------------------------------------------------- */
  const proposalsData = useMemo(() => {
    return proposalsUtxos
      .map((utxo, idx) => {
        if (!utxo.plutusData) return null;

        try {
          let metadata: any;
          let description = 'No description provided';

          if (utxo.parsedMetadata) {
            try {
              const parsed =
                typeof utxo.parsedMetadata === 'string'
                  ? JSON.parse(utxo.parsedMetadata)
                  : utxo.parsedMetadata;

              metadata = parsed;
              description = parsed.description || 'No description provided';
            } catch {
              const { metadata: datumMetadata } = parseProposalDatum(
                utxo.plutusData,
              )!;
              metadata = datumMetadata;
            }
          } else {
            const { metadata: datumMetadata } = parseProposalDatum(
              utxo.plutusData,
            )!;
            metadata = datumMetadata;
          }

          if (!metadata) return null;

          let status: Proposal['status'] = 'pending';

          if (signOfApprovals.some((p) => p.txHash === utxo.txHash)) {
            status = 'signoff_pending';
          } else if (proposals.some((p) => p.txHash === utxo.txHash)) {
            status = 'approved';
          }

          return {
            id: idx + 1,
            title: metadata.title || 'Untitled Proposal',
            description,
            receiverWalletAddress: metadata.receiverWalletAddress || '',
            submittedByAddress: metadata.submittedByAddress || '',
            fundsRequested: metadata.fundsRequested || '0',
            status,
            txHash: utxo.txHash,
          };
        } catch (e) {
          console.error('Error parsing proposal datum:', e);
          return null;
        }
      })
      .filter(Boolean) as Proposal[];
  }, [proposalsUtxos, proposals, signOfApprovals]);

  /* -----------------------------------------------------
     Merge + set proposals safely
  ----------------------------------------------------- */
  useEffect(() => {
    const merged = [...proposalsData, ...completedProposals].map(
      (p, index) => ({
        ...p,
        id: index + 1,
      }),
    );

    setAllProposals(merged);
  }, [proposalsData, completedProposals]);

  return { allProposals, loading, error };
};

export default useProposals;
