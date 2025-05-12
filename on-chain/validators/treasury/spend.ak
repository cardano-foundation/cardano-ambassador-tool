use aiken/collection/pairs.{has_key}
use cardano/address.{Credential, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use types.{OracleDatum}
use utils.{get_oracle_nft_datum}

validator treasury(oracle_nft: PolicyId) {
  spend(_d, _r, _u, self: Transaction) {
    let Transaction { reference_inputs, withdrawals, .. } = self

    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum { treasury_withdrawal_script_hash, .. } = oracle_input_datum
    let treasury_withdrawal_credential: Credential =
      Script(treasury_withdrawal_script_hash)
    let withdrawal_script_check =
      withdrawals
        |> has_key(treasury_withdrawal_credential)
    withdrawal_script_check?
  }

  else(_) {
    fail
  }
}
