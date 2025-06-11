use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use cocktail.{
  inputs_at_with_policy, output_inline_datum, outputs_at_with,
  policy_only_minted_token, value_length, value_policy_info,
}
use types.{
  ApproveSignOff, MintProposal, OracleDatum, ProposalDatum, ProposalMintRedeemer,
}
use utils.{get_oracle_nft_datum, has_enough_signers}

validator proposal(oracle_nft: PolicyId) {
  mint(redeemer: ProposalMintRedeemer, policy_id: PolicyId, self: Transaction) {
    let Transaction {
      inputs,
      reference_inputs,
      extra_signatories,
      outputs,
      mint,
      ..
    } = self

    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum {
      admins,
      propose_intent_address,
      proposal_address,
      propose_intent_token,
      multi_sig_threshold,
      sign_off_approval_token,
      ..
    } = oracle_input_datum

    when redeemer is {
      MintProposal -> {
        expect [intent_input] =
          inputs_at_with_policy(
            inputs,
            propose_intent_address,
            propose_intent_token,
          )
        expect intent_input_datum: ProposalDatum =
          output_inline_datum(intent_input.output)

        expect Some((_, proposal_asset_name, _)) =
          value_policy_info(intent_input.output.value, propose_intent_token)

        expect [proposal_output] =
          outputs_at_with(
            outputs,
            proposal_address,
            policy_id,
            proposal_asset_name,
          )
        let is_proposal_output_value_clean =
          value_length(proposal_output.value) == 2
        expect proposal_output_datum: ProposalDatum =
          output_inline_datum(proposal_output)
        let is_proposal_output_datum_correct =
          proposal_output_datum == intent_input_datum
        let is_admins_multi_signed =
          has_enough_signers(admins, multi_sig_threshold, extra_signatories)
        is_proposal_output_value_clean? && is_proposal_output_datum_correct? && policy_only_minted_token(
          mint,
          policy_id,
          proposal_asset_name,
          1,
        )? && is_admins_multi_signed?
      }

      ApproveSignOff -> {
        expect [proposal_input] =
          inputs_at_with_policy(inputs, proposal_address, policy_id)
        expect Some((_, asset_name, _)) =
          value_policy_info(proposal_input.output.value, policy_id)
        policy_only_minted_token(mint, policy_id, asset_name, -1)? && policy_only_minted_token(
          mint,
          sign_off_approval_token,
          asset_name,
          1,
        )?
      }
    }
  }

  else(_) {
    fail
  }
}
