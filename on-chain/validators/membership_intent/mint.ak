use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use cocktail.{
  inputs_with, only_minted_token, output_inline_datum, outputs_at_with_policy,
  policy_only_minted_token, value_length,
}
use types.{
  ApplyMembership, ApproveMember, MembershipIntentDatum,
  MembershipIntentMintRedeemer, OracleDatum, RejectMember,
}
use utils.{
  get_counter_count, get_oracle_nft_datum, has_enough_signers,
  output_at_with_value,
}

validator membership_intent(oracle_nft: PolicyId) {
  mint(
    redeemer: MembershipIntentMintRedeemer,
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
      counter_nft,
      member_token,
      counter_address,
      memebership_intent_address,
      ..
    } = oracle_input_datum

    when redeemer is {
      ApplyMembership(user_token_policy_id, asset_name, metadata) -> {
        expect [intent_output] =
          outputs_at_with_policy(outputs, memebership_intent_address, policy_id)
        let is_intent_output_value_clean =
          value_length(intent_output.value) == 2
        expect intent_output_datum: MembershipIntentDatum =
          output_inline_datum(intent_output)
        let correct_intent_output_datum =
          MembershipIntentDatum {
            token: (user_token_policy_id, asset_name),
            metadata,
          }
        let is_intent_datum_correct =
          intent_output_datum == correct_intent_output_datum

        expect [token_input] =
          inputs_with(inputs, user_token_policy_id, asset_name)
        let token_owner = token_input.output.address
        expect [_] =
          output_at_with_value(outputs, token_owner, token_input.output.value)

        is_intent_output_value_clean? && is_intent_datum_correct? && only_minted_token(
          mint,
          policy_id,
          "",
          1,
        )?
      }

      ApproveMember -> {
        let count_asset_name =
          get_counter_count(inputs, counter_nft, counter_address)

        policy_only_minted_token(mint, policy_id, "", -1)? && policy_only_minted_token(
          mint,
          member_token,
          count_asset_name,
          1,
        )?
      }
      RejectMember -> {
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
