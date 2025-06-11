use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use cocktail.{
  inputs_at_with, inputs_at_with_policy, only_minted_token, output_inline_datum,
  outputs_at_with, policy_only_minted_token, value_length, value_policy_info,
}
use types.{
  AddMember, MemberDatum, MemberMintRedeemer, MembershipIntentDatum, OracleDatum,
  RemoveMember,
}
use utils.{
  get_counter_count, get_oracle_nft_datum, has_all_signers, has_enough_signers,
}

validator member(oracle_nft: PolicyId) {
  mint(redeemer: MemberMintRedeemer, policy_id: PolicyId, self: Transaction) {
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
      counter_address,
      counter_nft,
      membership_intent_token,
      memebership_intent_address,
      member_address,
      multi_sig_threshold,
      ..
    } = oracle_input_datum

    when redeemer is {
      AddMember -> {
        expect [intent_input] =
          inputs_at_with(
            inputs,
            memebership_intent_address,
            membership_intent_token,
            "",
          )
        expect intent_input_datum: MembershipIntentDatum =
          output_inline_datum(intent_input.output)

        let count_asset_name =
          get_counter_count(inputs, counter_nft, counter_address)

        expect [member_output] =
          outputs_at_with(outputs, member_address, policy_id, count_asset_name)
        let is_member_output_value_clean =
          value_length(member_output.value) == 2
        expect member_output_datum: MemberDatum =
          output_inline_datum(member_output)

        let new_member_output_datum =
          MemberDatum {
            token: intent_input_datum.token,
            completion: [],
            fund_recevied: 0,
            metadata: intent_input_datum.metadata,
          }
        let is_member_output_datum_correct =
          member_output_datum == new_member_output_datum
        let is_admins_multi_signed =
          has_enough_signers(admins, multi_sig_threshold, extra_signatories)
        is_member_output_value_clean? && is_member_output_datum_correct? && policy_only_minted_token(
          mint,
          policy_id,
          count_asset_name,
          1,
        )? && is_admins_multi_signed?
      }

      RemoveMember -> {
        expect [member_input] =
          inputs_at_with_policy(inputs, member_address, policy_id)
        expect Some((_, asset_name, _)) =
          value_policy_info(member_input.output.value, policy_id)
        let is_admins_all_signed = has_all_signers(admins, extra_signatories)
        only_minted_token(mint, policy_id, asset_name, -1)? && is_admins_all_signed?
      }
    }
  }

  else(_) {
    fail
  }
}
