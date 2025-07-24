use aiken/collection/pairs.{has_key}
use cardano/address.{Credential, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction, find_input}
use cocktail.{
  inputs_with, only_minted_token, output_inline_datum, outputs_at_with,
  value_length, value_policy_info,
}
use types.{
  AdminRemoveMember, AdminSignOffProject, MemberDatum, MemberSpendRedeemer,
  MemberUpdateMetadata, OracleDatum,
}
use utils.{get_oracle_nft_datum}

validator member(oracle_nft: PolicyId) {
  spend(
    datum_opt: Option<MemberDatum>,
    redeemer: MemberSpendRedeemer,
    input: OutputReference,
    self: Transaction,
  ) {
    let Transaction { inputs, reference_inputs, mint, withdrawals, outputs, .. } =
      self

    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum { member_token, treasury_withdrawal_script_hash, .. } =
      oracle_input_datum

    expect Some(own_input) = find_input(inputs, input)

    when redeemer is {
      AdminRemoveMember -> {
        expect Some((_, asset_name, _)) =
          value_policy_info(own_input.output.value, member_token)
        only_minted_token(mint, member_token, asset_name, -1)?
      }
      AdminSignOffProject -> {
        let treasury_withdrawal_credential: Credential =
          Script(treasury_withdrawal_script_hash)
        let withdrawal_script_check =
          withdrawals
            |> has_key(treasury_withdrawal_credential)
        withdrawal_script_check?
      }
      MemberUpdateMetadata -> {
        expect Some(old_member_input_datum) = datum_opt

        let MemberDatum { token, completion, fund_recevied, .. } =
          old_member_input_datum

        expect [token_input] = inputs_with(inputs, token.1st, token.2nd)
        let token_owner = token_input.output.address
        expect [_] = outputs_at_with(outputs, token_owner, token.1st, token.2nd)

        expect Some((policy_id, asset_name, _)) =
          value_policy_info(own_input.output.value, member_token)

        expect [member_output] =
          outputs_at_with(
            outputs,
            own_input.output.address,
            policy_id,
            asset_name,
          )
        expect new_membership_intent_input_datum: MemberDatum =
          output_inline_datum(member_output)

        let datum_check =
          new_membership_intent_input_datum.token == token && new_membership_intent_input_datum.completion == completion && new_membership_intent_input_datum.fund_recevied == fund_recevied
        let is_member_output_value_clean =
          value_length(member_output.value) == 2
        datum_check? && is_member_output_value_clean?
      }
    }
  }

  else(_) {
    fail
  }
}
