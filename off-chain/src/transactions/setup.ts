import {
  Layer1Tx,
  counterDatum,
  oracleDatum,
  rMint,
  IProvider,
  OracleDatum,
  CATConstants,
} from "../../../off-chain/src/lib";
import { IWallet, resolveScriptHash, UTxO } from "@meshsdk/core";

export class SetupTx extends Layer1Tx {
  constructor(
    public address: string,
    public userWallet: IWallet,
    public provider: IProvider,
    public catConstant: CATConstants
  ) {
    super(userWallet, address, provider, catConstant);
  }

  /**
   * Internal tx at setup
   * @returns
   */
  mintCounterNFT = async (utxo: UTxO) => {
    const scriptCbor = this.catConstant.scripts.counter.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");

    const utxos = await this.wallet.getUtxos();
    const paramUtxo = utxos[0]!;
    console.log(paramUtxo);

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          utxo.input.txHash,
          utxo.input.outputIndex,
          utxo.output.amount,
          utxo.output.address
        )
        .mintPlutusScriptV3()
        .mint("1", policyId, "")
        .mintingScript(scriptCbor)
        .mintRedeemerValue(rMint, "JSON")
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   *
   * @param utxo
   * @param admins A list of pubKeyHash of the new admins
   * @param adminTenure
   * @param multiSigThreshold
   * @returns
   */
  mintSpendOracleNFT = async (
    utxo: UTxO,
    admins: string[],
    adminTenure: string,
    multiSigThreshold: number
  ) => {
    const scriptCbor = this.catConstant.scripts.oracle.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const oracleAddress = this.catConstant.scripts.oracle.spend.address;

    const utxos = await this.wallet.getUtxos();
    const paramUtxo = utxos[0]!;
    console.log(paramUtxo);

    const newOracleDatum: OracleDatum = oracleDatum(
      admins,
      adminTenure,
      multiSigThreshold,
      this.catConstant.scripts
    );

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          utxo.input.txHash,
          utxo.input.outputIndex,
          utxo.output.amount,
          utxo.output.address
        )
        .mintPlutusScriptV3()
        .mint("1", policyId, "")
        .mintingScript(scriptCbor)
        .mintRedeemerValue(rMint, "JSON")
        .txOut(oracleAddress, [{ unit: policyId, quantity: "1" }])
        .txOutInlineDatumValue(newOracleDatum, "JSON")
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Internal tx at setup
   * @returns
   */
  spendCounterNFT = async (utxo: UTxO) => {
    const scriptCbor = this.catConstant.scripts.counter.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const counterAddress = this.catConstant.scripts.counter.spend.address;
    const couterInlineDatum = counterDatum(0);

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          utxo.input.txHash,
          utxo.input.outputIndex,
          utxo.output.amount,
          utxo.output.address
        )

        .txOut(counterAddress, [{ unit: policyId, quantity: "1" }])
        .txOutInlineDatumValue(couterInlineDatum, "JSON")
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Internal tx at setup
   * @returns
   */
  registerAllCerts = async () => {
    const treasuryWithdraw = this.catConstant.scripts.treasury.withdraw.address;

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .registerStakeCertificate(treasuryWithdraw)
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
    }
  };

  /**
   *
   * @param address The address txOutReferenceScript sends to in bech32
   * @returns
   */
  txOutScript = async (address: string) => {
    const txBuilder = await this.newValidationTx();
    try {
      // const unsignedMembershipIntentTx = await txBuilder
      //   .txOut(address, [])
      //   .txOutReferenceScript(
      //     this.catConstant.scripts.membershipIntent.mint.cbor
      //   )
      //   .txOut(address, [])
      //   .txOutReferenceScript(
      //     this.catConstant.scripts.membershipIntent.spend.cbor
      //   )
      //   .complete();

      // const signedMembershipIntentTx = await this.wallet.signTx(
      //   unsignedMembershipIntentTx,
      //   true
      // );
      // const membershipIntentTxHash = await this.wallet.submitTx(
      //   signedMembershipIntentTx
      // );

      // const unsignedMemberTx = await txBuilder
      //   .txOut(address, [])
      //   .txOutReferenceScript(this.catConstant.scripts.member.mint.cbor)
      //   .txOut(address, [])
      //   .txOutReferenceScript(this.catConstant.scripts.member.spend.cbor)
      //   .complete();

      // const signedMemberTx = await this.wallet.signTx(unsignedMemberTx, true);
      // const memberTxHash = await this.wallet.submitTx(signedMemberTx);

      // const unsignedProposeIntentTx = await txBuilder
      //   .txOut(address, [])
      //   .txOutReferenceScript(this.catConstant.scripts.proposeIntent.mint.cbor)
      //   .txOut(address, [])
      //   .txOutReferenceScript(this.catConstant.scripts.proposeIntent.spend.cbor)
      //   .complete();

      // const signedProposeIntentTx = await this.wallet.signTx(
      //   unsignedProposeIntentTx,
      //   true
      // );
      // const proposeIntentTxHash = await this.wallet.submitTx(
      //   signedProposeIntentTx
      // );

      // const unsignedProposalTx = await txBuilder
      //   .txOut(address, [])
      //   .txOutReferenceScript(this.catConstant.scripts.proposal.mint.cbor)
      //   .txOut(address, [])
      //   .txOutReferenceScript(this.catConstant.scripts.proposal.spend.cbor)
      //   .complete();

      // const signedProposalTx = await this.wallet.signTx(
      //   unsignedProposalTx,
      //   true
      // );
      // const proposalTxHash = await this.wallet.submitTx(signedProposalTx);

      // const unsignedSignOffApprovalTx = await txBuilder
      //   .txOut(address, [])
      //   .txOutReferenceScript(
      //     this.catConstant.scripts.signOffApproval.mint.cbor
      //   )
      //   .txOut(address, [])
      //   .txOutReferenceScript(
      //     this.catConstant.scripts.signOffApproval.spend.cbor
      //   )
      //   .complete();

      // const signedSignOffApprovalTx = await this.wallet.signTx(
      //   unsignedSignOffApprovalTx,
      //   true
      // );
      // const signOffApprovalTxHash = await this.wallet.submitTx(
      //   signedSignOffApprovalTx
      // );

      const unsignedTreasuryTx = await txBuilder
        .txOut(address, [])
        .txOutReferenceScript(this.catConstant.scripts.treasury.spend.cbor)
        .txOut(address, [])
        .txOutReferenceScript(this.catConstant.scripts.treasury.withdraw.cbor)
        .complete();

      const signedTreasuryTx = await this.wallet.signTx(
        unsignedTreasuryTx,
        true
      );
      const treasuryTxHash = await this.wallet.submitTx(signedTreasuryTx);

      return {
        // membershipIntent: membershipIntentTxHash,
        // member: memberTxHash,
        // proposeIntent: proposeIntentTxHash,
        // proposal: proposalTxHash,
        // signOffApproval: signOffApprovalTxHash,
        // treasury: treasuryTxHash,
      };
    } catch (e) {
      console.error(e);
    }
  };
}
