use cardano/assets.{PolicyId}
use cardano/transaction.{
  DatumHash, InlineDatum, NoDatum, OutputReference, Transaction, find_input,
}
use cocktail.{
  inputs_with, outputs_at_with_policy, policy_only_minted_token, value_length,
  value_policy_info,
}
use types.{
  MembershipIntentDatum, MembershipIntentSpendRedeemer, OracleDatum,
  ProcessMembershipIntent, UpdateMembershipIntentMetadata,
}
use utils.{get_oracle_nft_datum, output_at_with_value}

validator membership_intent(oracle_nft: PolicyId) {
  spend(
    datum: Option<MembershipIntentDatum>,
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
        let membership_intent_input_data: Data =
          when own_input.output.datum is {
            NoDatum ->
              fail @"Membership Intent input does not contain any datum"
            DatumHash(_) ->
              fail @"Membership Intent input datum must be inlined"
            InlineDatum(data) -> data
          }
        expect old_membership_intent_input_datum: MembershipIntentDatum =
          membership_intent_input_data
        let MembershipIntentDatum { token, .. } =
          old_membership_intent_input_datum

        expect [token_input] = inputs_with(inputs, token.1st, token.2nd)
        let token_owner = token_input.output.address
        expect [_] =
          output_at_with_value(outputs, token_owner, token_input.output.value)
        expect Some(new_membership_intent_input_datum) = datum

        let datum_check = new_membership_intent_input_datum.token == token

        expect [intent_output] =
          outputs_at_with_policy(outputs, own_input.output.address, policy_id)
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
