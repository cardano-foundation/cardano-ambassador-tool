use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use cocktail.{
  inputs_at_with_policy, inputs_with, output_inline_datum, outputs_at_with,
  outputs_at_with_policy, value_length,
}
use cocktail/vodka_mints.{only_minted_token, policy_only_minted_token}
use types.{
  ApproveProposal, MemberDatum, OracleDatum, ProposalDatum,
  ProposeIntentMintRedeemer, ProposeProject, RejectProposal,
}
use utils.{get_oracle_nft_datum, has_enough_signers}

validator propose_intent(oracle_nft: PolicyId) {
  mint(
    redeemer: ProposeIntentMintRedeemer,
    policy_id: PolicyId,
    self: Transaction,
  ) {
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
      multi_sig_threshold,
      member_token,
      member_address,
      proposal_token,
      propose_intent_address,
      ..
    } = oracle_input_datum

    when redeemer is {
      ProposeProject(fund_requested, receiver, metadata) -> {
        expect [member_input] =
          inputs_at_with_policy(inputs, member_address, member_token)
        expect member_input_datum: MemberDatum =
          output_inline_datum(member_input.output)
        let MemberDatum { token, .. } = member_input_datum

        expect [member_output] =
          outputs_at_with_policy(outputs, member_address, member_token)
        let is_member_output_value_clean =
          value_length(member_output.value) == 2

        //todo: check member datum
        expect [token_input] = inputs_with(inputs, token.1st, token.2nd)
        let token_owner = token_input.output.address
        expect [_] = outputs_at_with(outputs, token_owner, token.1st, token.2nd)

        expect [intent_output] =
          outputs_at_with_policy(outputs, propose_intent_address, policy_id)
        let is_intent_output_value_clean =
          value_length(intent_output.value) == 2
        expect intent_output_datum: ProposalDatum =
          output_inline_datum(intent_output)
        let correct_intent_output_datum =
          ProposalDatum { fund_requested, receiver, metadata }
        let is_intent_datum_correct =
          intent_output_datum == correct_intent_output_datum

        is_member_output_value_clean? && is_intent_output_value_clean? && is_intent_datum_correct? && only_minted_token(
          mint,
          policy_id,
          "",
          //todo: naming
          1,
        )?
      }

      ApproveProposal ->
        policy_only_minted_token(mint, policy_id, "", -1)? && policy_only_minted_token(
          mint,
          proposal_token,
          "",
          1,
        )?
      RejectProposal -> {
        let is_admins_multi_signed =
          has_enough_signers(admins, multi_sig_threshold, extra_signatories)
        only_minted_token(mint, policy_id, "", -1)? && is_admins_multi_signed?
      }
    }
  }

  else(_) {
    fail
  }
}
