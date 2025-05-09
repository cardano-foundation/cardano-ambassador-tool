use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction, find_input}
use cocktail.{policy_only_minted_token, value_policy_info}
use types.{MembershipIntentDatum, OracleDatum}
use utils.{get_oracle_nft_datum}

validator membership_intent(oracle_nft: PolicyId) {
  spend(
    _datum: Option<MembershipIntentDatum>,
    _,
    utxo: OutputReference,
    self: Transaction,
  ) {
    let Transaction { inputs, reference_inputs, mint, .. } = self

    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum { membership_intent_token, .. } = oracle_input_datum
    expect Some(own_input) = find_input(inputs, utxo)

    expect Some((policy_id, asset_name, _)) =
      value_policy_info(own_input.output.value, membership_intent_token)
    policy_only_minted_token(mint, policy_id, asset_name, -1)
  }

  else(_) {
    fail
  }
}
