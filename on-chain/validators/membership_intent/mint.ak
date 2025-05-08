use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use cocktail.{
  convert_int_to_bytes, inputs_with, output_inline_datum, outputs_at_with,
  outputs_at_with_policy, value_length,
}
use cocktail/vodka_mints.{only_minted_token, policy_only_minted_token}
use types.{
  ApplyMembership, ApproveMember, CounterDatum, MembershipIntentDatum,
  MembershipIntentMintRedeemer, OracleDatum, RejectMember,
}
use utils.{get_counter_datum, get_oracle_nft_datum, has_enough_signers}

validator membership_intent(oracle_nft: PolicyId) {
  mint(redeemer: MembershipIntentMintRedeemer, _: PolicyId, self: Transaction) {
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
      membership_intent_token,
      memebership_intent_address,
      ..
    } = oracle_input_datum

    when redeemer is {
      ApplyMembership(policy_id, asset_name) -> {
        expect [intent_output] =
          outputs_at_with_policy(
            outputs,
            memebership_intent_address,
            membership_intent_token,
          )
        let is_intent_output_value_clean =
          value_length(intent_output.value) == 2
        expect intent_output_datum: MembershipIntentDatum =
          output_inline_datum(intent_output)
        let correct_intent_output_datum =
          MembershipIntentDatum { token: (policy_id, asset_name) }
        let is_intent_datum_correct =
          intent_output_datum == correct_intent_output_datum

        expect [token_input] = inputs_with(inputs, policy_id, asset_name)
        let token_owner = token_input.output.address
        expect [_] =
          outputs_at_with(outputs, token_owner, policy_id, asset_name)

        is_intent_output_value_clean? && is_intent_datum_correct? && only_minted_token(
          mint,
          membership_intent_token,
          "",
          //todo: naming
          1,
        )?
      }

      ApproveMember -> {
        let counter_input_datum: CounterDatum =
          reference_inputs |> get_counter_datum(counter_nft)
        let CounterDatum { count } = counter_input_datum
        let count_asset_name = convert_int_to_bytes(count)

        policy_only_minted_token(mint, membership_intent_token, "", -1)? && policy_only_minted_token(
          mint,
          member_token,
          count_asset_name,
          1,
        )?
      }
      RejectMember -> {
        let is_admins_multi_signed =
          has_enough_signers(admins, multi_sig_threshold, extra_signatories)
        only_minted_token(mint, membership_intent_token, "", -1)? && is_admins_multi_signed?
      }
    }
  }

  else(_) {
    fail
  }
}
