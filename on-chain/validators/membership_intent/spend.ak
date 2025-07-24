use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction, find_input}
use cocktail.{
  inputs_with, output_inline_datum, outputs_at_with, outputs_at_with_policy,
  policy_only_minted_token, value_length, value_policy_info,
}
use types.{
  MembershipIntentDatum, MembershipIntentSpendRedeemer, OracleDatum,
  ProcessMembershipIntent, UpdateMembershipIntentMetadata,
}
use utils.{get_oracle_nft_datum}

validator membership_intent(oracle_nft: PolicyId) {
  spend(
    datum_opt: Option<MembershipIntentDatum>,
    redeemer: MembershipIntentSpendRedeemer,
    utxo: OutputReference,
    self: Transaction,
  ) {
    let Transaction { inputs, reference_inputs, mint, outputs, .. } = self

    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum { membership_intent_token, .. } = oracle_input_datum
    expect Some(own_input) = find_input(inputs, utxo)
    expect Some((policy_id, asset_name, _)) =
      value_policy_info(own_input.output.value, membership_intent_token)
    when redeemer is {
      ProcessMembershipIntent ->
        policy_only_minted_token(mint, policy_id, asset_name, -1)
      UpdateMembershipIntentMetadata -> {
        expect Some(old_membership_intent_input_datum) = datum_opt

        let MembershipIntentDatum { token, .. } =
          old_membership_intent_input_datum

        expect [token_input] = inputs_with(inputs, token.1st, token.2nd)
        let token_owner = token_input.output.address
        expect [_] = outputs_at_with(outputs, token_owner, token.1st, token.2nd)

        expect [intent_output] =
          outputs_at_with_policy(outputs, own_input.output.address, policy_id)

        expect new_membership_intent_input_datum: MembershipIntentDatum =
          output_inline_datum(intent_output)
        let datum_check = new_membership_intent_input_datum.token == token

        let is_intent_output_value_clean =
          value_length(intent_output.value) == 2
        datum_check? && is_intent_output_value_clean?
      }
    }
  }

  else(_) {
    fail
  }
}
