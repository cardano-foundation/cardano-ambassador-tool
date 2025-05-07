use cardano/transaction.{OutputReference, Transaction, find_input}
use cocktail.{
  output_inline_datum, outputs_at_with_policy, value_length, value_tokens,
}
use types.{
  OracleDatum, OracleSpendRedeemer, RotateAdmin, StopOracle, UpdateThreshold,
}
use utils.{has_all_signers, has_enough_signers}

validator oracle {
  spend(
    datum_opt: Option<OracleDatum>,
    redeemer: OracleSpendRedeemer,
    input: OutputReference,
    self: Transaction,
  ) {
    let Transaction { outputs, inputs, extra_signatories, .. } = self
    expect Some(own_input) = find_input(inputs, input)
    expect [(oracle_nft_policy, _, _)] = value_tokens(own_input.output.value)
    let own_address = own_input.output.address
    expect Some(datum) = datum_opt
    let OracleDatum { admins, multi_sig_threshold, .. } = datum
    let is_admins_multi_signed =
      has_enough_signers(admins, multi_sig_threshold, extra_signatories)
    when
      (
        redeemer,
        outputs_at_with_policy(outputs, own_address, oracle_nft_policy),
      )
    is {
      (RotateAdmin(new_admins, new_admin_tenure), [only_output]) -> {
        let is_new_admins_signed =
          has_all_signers(new_admins, extra_signatories)

        let is_output_value_clean = value_length(only_output.value) == 2

        expect only_output_datum: OracleDatum = output_inline_datum(only_output)
        let updated_output_datum =
          OracleDatum {
            ..datum,
            admins: new_admins,
            admin_tenure: new_admin_tenure,
          }
        let is_output_datum_updated = only_output_datum == updated_output_datum
        is_new_admins_signed? && is_output_value_clean? && is_output_datum_updated?
      }
      (UpdateThreshold(new_threshold), [only_output]) -> {
        let is_output_value_clean = value_length(only_output.value) == 2

        expect only_output_datum: OracleDatum = output_inline_datum(only_output)
        let updated_output_datum =
          OracleDatum { ..datum, multi_sig_threshold: new_threshold }
        let is_output_datum_updated = only_output_datum == updated_output_datum
        is_output_value_clean? && is_output_datum_updated?
      }
      (StopOracle, [only_output]) -> {
        let is_output_value_clean = value_length(only_output.value) == 2
        expect only_output_datum: OracleDatum = output_inline_datum(only_output)
        let updated_output_datum = OracleDatum { ..datum, admins: [] }
        let is_output_datum_updated = only_output_datum == updated_output_datum
        is_output_value_clean? && is_output_datum_updated?
      }

      _ -> False
    } && is_admins_multi_signed?
  }

  else(_) {
    fail
  }
}
