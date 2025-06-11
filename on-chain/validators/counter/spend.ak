use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction, find_input}
use cocktail.{
  convert_int_to_bytes, only_minted_token, output_inline_datum,
  outputs_at_with_policy, policy_only_minted_token, value_length,
}
use types.{
  CounterDatum, CounterSpendRedeemer, IncrementCount, OracleDatum, StopCounter,
}
use utils.{get_oracle_nft_datum, has_enough_signers}

validator counter(oracle_nft: PolicyId) {
  spend(
    datum_opt: Option<CounterDatum>,
    redeemer: CounterSpendRedeemer,
    input: OutputReference,
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
      ..
    } = oracle_input_datum

    expect Some(own_input) = find_input(inputs, input)
    let own_address = own_input.output.address

    expect Some(own_datum) = datum_opt

    when
      (redeemer, outputs_at_with_policy(outputs, own_address, counter_nft))
    is {
      (IncrementCount, [only_output]) -> {
        let CounterDatum { count } = own_datum

        let is_output_value_clean = value_length(only_output.value) == 2
        expect only_output_datum: CounterDatum =
          output_inline_datum(only_output)
        let updated_output_datum = CounterDatum { count: count + 1 }
        let is_counter_updated = only_output_datum == updated_output_datum
        let asset_name = convert_int_to_bytes(count)
        is_output_value_clean? && is_counter_updated? && policy_only_minted_token(
          mint,
          member_token,
          asset_name,
          1,
        )?
      }
      (StopCounter, _) -> {
        let is_admins_multi_signed =
          has_enough_signers(admins, multi_sig_threshold, extra_signatories)
        only_minted_token(mint, counter_nft, "", -1)? && is_admins_multi_signed?
      }
      _ -> False
    }
  }

  else(_) {
    fail
  }
}
