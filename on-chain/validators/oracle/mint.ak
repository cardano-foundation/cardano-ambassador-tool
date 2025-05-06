use aiken/collection/dict
use aiken/collection/list
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use types.{MintPolarity, RBurn, RMint}

validator oracle(utxo_ref: OutputReference) {
  mint(redeemer: MintPolarity, policy_id: PolicyId, self: Transaction) {
    // It checks that only one minted asset exists and will fail otherwise
    expect [Pair(_asset_name, quantity)] =
      self.mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()
    let Transaction { inputs, .. } = self
    // Check if the specified UTxO reference (utxo_ref) is consumed by any input
    let is_output_consumed =
      list.any(inputs, fn(input) { input.output_reference == utxo_ref })
    when redeemer is {
      RMint -> is_output_consumed? && quantity == 1
      RBurn -> quantity == -1
    }
    // No need to check if output is consumed for burning
  }

  else(_) {
    fail
  }
}
