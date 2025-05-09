use aiken/collection/pairs.{has_key}
use cardano/address.{Credential, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction, find_input}
use cocktail.{only_minted_token, value_policy_info}
use types.{
  AdminRemoveMember, AdminSignOffProject, MemberDatum, MemberProposeProject,
  MemberSpendRedeemer, OracleDatum,
}
use utils.{get_oracle_nft_datum}

validator member(oracle_nft: PolicyId) {
  spend(
    _d: Option<MemberDatum>,
    redeemer: MemberSpendRedeemer,
    input: OutputReference,
    self: Transaction,
  ) {
    let Transaction { inputs, reference_inputs, mint, withdrawals, .. } = self

    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum {
      member_token,
      propose_intent_token,
      treasury_withdrawal_script_hashes,
      ..
    } = oracle_input_datum

    expect Some(own_input) = find_input(inputs, input)

    when redeemer is {
      AdminRemoveMember -> {
        expect Some((_, asset_name, _)) =
          value_policy_info(own_input.output.value, member_token)
        only_minted_token(mint, member_token, asset_name, -1)?
      }
      MemberProposeProject ->
        only_minted_token(mint, propose_intent_token, "", 1)?
      AdminSignOffProject -> {
        let treasury_withdrawal_credential: Credential =
          Script(treasury_withdrawal_script_hashes)
        let withdrawal_script_check =
          withdrawals
            |> has_key(treasury_withdrawal_credential)
        withdrawal_script_check?
      }
    }
  }

  else(_) {
    fail
  }
}
