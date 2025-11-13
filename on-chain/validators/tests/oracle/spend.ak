use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use cocktail.{address_payment_key}
use mocktail.{
  complete, mock_policy_id, mock_pub_key_address, mock_tx_hash, mock_utxo_ref,
  mocktail_tx, required_signer_hash, tx_in, tx_in_inline_datum, tx_out,
  tx_out_inline_datum,
}
use oracle/spend as oracle_spend
use tests/utils.{
  mock_first_admin, mock_input_oracle_datum, mock_new_admin_tenure,
  mock_new_admins, mock_new_first_admin, mock_new_multisig_threshold,
  mock_new_second_admin, mock_new_third_admin, mock_oracle_address,
  mock_oracle_nft, mock_second_admin, mock_third_admin,
}
use types.{OracleDatum, RotateAdmin, StopOracle, UpdateThreshold}

type RotateTestCase {
  is_old_admins_signed: Bool,
  is_oracle_output_clean: Bool,
  is_new_admins_signed: Bool,
  is_output_datum_updated: Bool,
}

const mock_rotate_redeemer =
  RotateAdmin {
    new_admins: mock_new_admins,
    new_admin_tenure: mock_new_admin_tenure,
  }

const mock_update_threshold_redeemer =
  UpdateThreshold { new_threshold: mock_new_multisig_threshold }

const mock_rotate_output_oracle_datum =
  OracleDatum {
    ..mock_input_oracle_datum,
    admins: mock_new_admins,
    admin_tenure: mock_new_admin_tenure,
  }

fn mock_rotate_tx(test_case: RotateTestCase) -> Transaction {
  let RotateTestCase {
    is_old_admins_signed,
    is_oracle_output_clean,
    is_new_admins_signed,
    is_output_datum_updated,
  } = test_case

  let input_value = from_asset(mock_oracle_nft, "", 1) |> add("", "", 2_000_000)

  mocktail_tx()
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_oracle_address)
    |> tx_in_inline_datum(True, mock_input_oracle_datum)
    |> tx_out(is_oracle_output_clean, mock_oracle_address, input_value)
    |> tx_out(
        !is_oracle_output_clean,
        mock_oracle_address,
        input_value |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(
        is_output_datum_updated,
        mock_rotate_output_oracle_datum,
      )
    |> tx_out_inline_datum(!is_output_datum_updated, mock_input_oracle_datum)
    |> required_signer_hash(
        is_old_admins_signed,
        address_payment_key(mock_first_admin),
      )
    |> required_signer_hash(
        is_old_admins_signed,
        address_payment_key(mock_second_admin),
      )
    |> required_signer_hash(
        is_new_admins_signed,
        address_payment_key(mock_new_first_admin),
      )
    |> required_signer_hash(
        is_new_admins_signed,
        address_payment_key(mock_new_second_admin),
      )
    |> required_signer_hash(
        is_new_admins_signed,
        address_payment_key(mock_new_third_admin),
      )
    |> complete()
}

test s0_spend_success_rotate() {
  let datum = mock_input_oracle_datum
  let redeemer = mock_rotate_redeemer
  let tx =
    mock_rotate_tx(
      RotateTestCase {
        is_old_admins_signed: True,
        is_oracle_output_clean: True,
        is_new_admins_signed: True,
        is_output_datum_updated: True,
      },
    )

  oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

test s0_spend_fail_rotate_with_no_old_amins_signed() {
  let datum = mock_input_oracle_datum
  let redeemer = mock_rotate_redeemer
  let tx =
    mock_rotate_tx(
      RotateTestCase {
        is_old_admins_signed: False,
        is_oracle_output_clean: True,
        is_new_admins_signed: True,
        is_output_datum_updated: True,
      },
    )

  !oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

test s0_spend_fail_rotate_with_unclean_output() {
  let datum = mock_input_oracle_datum
  let redeemer = mock_rotate_redeemer
  let tx =
    mock_rotate_tx(
      RotateTestCase {
        is_old_admins_signed: True,
        is_oracle_output_clean: False,
        is_new_admins_signed: True,
        is_output_datum_updated: True,
      },
    )

  !oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

test s0_spend_fail_rotate_with_no_new_admins_signed() {
  let datum = mock_input_oracle_datum
  let redeemer = mock_rotate_redeemer
  let tx =
    mock_rotate_tx(
      RotateTestCase {
        is_old_admins_signed: True,
        is_oracle_output_clean: True,
        is_new_admins_signed: False,
        is_output_datum_updated: True,
      },
    )

  !oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

test s0_spend_fail_rotate_with_incorrect_new_datum() {
  let datum = mock_input_oracle_datum
  let redeemer = mock_rotate_redeemer
  let tx =
    mock_rotate_tx(
      RotateTestCase {
        is_old_admins_signed: True,
        is_oracle_output_clean: True,
        is_new_admins_signed: True,
        is_output_datum_updated: False,
      },
    )

  !oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

type UpdateThresholdTestCase {
  is_admins_signed: Bool,
  is_oracle_output_clean: Bool,
  is_datum_correct: Bool,
}

fn mock_update_threshold_tx(test_case: UpdateThresholdTestCase) -> Transaction {
  let UpdateThresholdTestCase {
    is_admins_signed,
    is_oracle_output_clean,
    is_datum_correct,
  } = test_case

  let input_value = from_lovelace(20000000) |> add(mock_oracle_nft, "", 1)

  mocktail_tx()
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_oracle_address)
    |> tx_in_inline_datum(True, mock_input_oracle_datum)
    |> tx_out(is_oracle_output_clean, mock_oracle_address, input_value)
    |> tx_out(
        !is_oracle_output_clean,
        mock_oracle_address,
        input_value |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(
        is_datum_correct,
        OracleDatum {
          ..mock_input_oracle_datum,
          multi_sig_threshold: mock_new_multisig_threshold,
        },
      )
    |> tx_out_inline_datum(
        !is_datum_correct,
        OracleDatum { ..mock_input_oracle_datum, multi_sig_threshold: 0 },
      )
    |> required_signer_hash(
        is_admins_signed,
        address_payment_key(mock_first_admin),
      )
    |> required_signer_hash(
        is_admins_signed,
        address_payment_key(mock_third_admin),
      )
    |> complete()
}

test s0_spend_success_update_threshold() {
  let datum = mock_input_oracle_datum
  let redeemer = mock_update_threshold_redeemer
  let tx =
    mock_update_threshold_tx(
      UpdateThresholdTestCase {
        is_admins_signed: True,
        is_oracle_output_clean: True,
        is_datum_correct: True,
      },
    )

  oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

test s0_spend_fail_update_threshold_with_no_admins_signed() fail {
  let datum = mock_input_oracle_datum
  let redeemer = mock_update_threshold_redeemer

  let tx =
    mock_update_threshold_tx(
      UpdateThresholdTestCase {
        is_admins_signed: False,
        is_oracle_output_clean: True,
        is_datum_correct: True,
      },
    )

  oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

test s0_spend_fail_update_threshold_with_oracle_nft_not_burnt() fail {
  let datum = mock_input_oracle_datum
  let redeemer = mock_update_threshold_redeemer

  let tx =
    mock_update_threshold_tx(
      UpdateThresholdTestCase {
        is_admins_signed: True,
        is_oracle_output_clean: True,
        is_datum_correct: False,
      },
    )

  oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

type StopOracleTestCase {
  is_admins_signed: Bool,
  is_oracle_output_clean: Bool,
  is_datum_correct: Bool,
}

fn mock_stop_oracle_tx(test_case: StopOracleTestCase) -> Transaction {
  let StopOracleTestCase {
    is_admins_signed,
    is_oracle_output_clean,
    is_datum_correct,
  } = test_case

  let input_value = from_lovelace(20000000) |> add(mock_oracle_nft, "", 1)

  mocktail_tx()
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_oracle_address)
    |> tx_in_inline_datum(True, mock_input_oracle_datum)
    |> tx_out(is_oracle_output_clean, mock_oracle_address, input_value)
    |> tx_out(
        !is_oracle_output_clean,
        mock_oracle_address,
        input_value |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(
        is_datum_correct,
        OracleDatum { ..mock_input_oracle_datum, admins: [] },
      )
    |> tx_out_inline_datum(
        !is_datum_correct,
        OracleDatum {
          ..mock_input_oracle_datum,
          admins: [mock_pub_key_address(0, None)],
        },
      )
    |> required_signer_hash(
        is_admins_signed,
        address_payment_key(mock_first_admin),
      )
    |> required_signer_hash(
        is_admins_signed,
        address_payment_key(mock_third_admin),
      )
    |> complete()
}

test s0_spend_success_stop() {
  let datum = mock_input_oracle_datum
  let redeemer = StopOracle
  let tx =
    mock_stop_oracle_tx(
      StopOracleTestCase {
        is_admins_signed: True,
        is_oracle_output_clean: True,
        is_datum_correct: True,
      },
    )

  oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

test s0_spend_fail_stop_with_no_admins_signed() fail {
  let datum = mock_input_oracle_datum
  let redeemer = StopOracle

  let tx =
    mock_stop_oracle_tx(
      StopOracleTestCase {
        is_admins_signed: False,
        is_oracle_output_clean: True,
        is_datum_correct: True,
      },
    )

  oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}

test s0_spend_fail_stop_with_oracle_nft_not_burnt() fail {
  let datum = mock_input_oracle_datum
  let redeemer = StopOracle

  let tx =
    mock_stop_oracle_tx(
      StopOracleTestCase {
        is_admins_signed: True,
        is_oracle_output_clean: True,
        is_datum_correct: False,
      },
    )

  oracle_spend.oracle.spend(Some(datum), redeemer, mock_utxo_ref(0, 0), tx)
}
