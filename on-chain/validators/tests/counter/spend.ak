use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use cocktail.{address_payment_key, convert_int_to_bytes}
use counter/spend as counter_spend
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mock_utxo_ref, mocktail_tx,
  ref_tx_in, ref_tx_in_inline_datum, required_signer_hash, tx_in,
  tx_in_inline_datum, tx_out, tx_out_inline_datum,
}
use tests/utils.{
  mock_counter_address, mock_counter_input_datum, mock_counter_nft,
  mock_first_admin, mock_input_oracle_datum, mock_member_token, mock_new_admins,
  mock_oracle_address, mock_oracle_nft, mock_third_admin,
}
use types.{CounterDatum, IncrementCount, StopCounter}

const mock_counter_output_datum = CounterDatum { count: 3 }

type IncrementCountTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_counter_updated: Bool,
  is_member_token_minted: Bool,
  is_counter_output_clean: Bool,
}

fn mock_increment_count_tx(test_case: IncrementCountTestCase) -> Transaction {
  let IncrementCountTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_counter_updated,
    is_member_token_minted,
    is_counter_output_clean,
  } = test_case

  let input_value = from_lovelace(20000000) |> add(mock_counter_nft, "", 1)

  mocktail_tx()
    |> ref_tx_in(
        is_oracle_inputed,
        mock_tx_hash(0),
        0,
        from_asset(mock_oracle_nft, "", 1),
        mock_oracle_address,
      )
    |> ref_tx_in_inline_datum(
        is_oracle_inputed && is_oracle_format_correct,
        mock_input_oracle_datum,
      )
    |> ref_tx_in_inline_datum(
        is_oracle_inputed && !is_oracle_format_correct,
        mock_new_admins,
      )
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_counter_address)
    |> tx_in_inline_datum(True, mock_counter_input_datum)
    |> tx_out(is_counter_output_clean, mock_counter_address, input_value)
    |> tx_out(
        !is_counter_output_clean,
        mock_counter_address,
        input_value |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(is_counter_updated, mock_counter_output_datum)
    |> tx_out_inline_datum(!is_counter_updated, mock_counter_input_datum)
    |> mint(
        is_member_token_minted,
        1,
        mock_member_token,
        convert_int_to_bytes(mock_counter_input_datum.count),
      )
    |> complete()
}

test s1_spend_success_increment_count() {
  let tx =
    mock_increment_count_tx(
      IncrementCountTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_updated: True,
        is_member_token_minted: True,
        is_counter_output_clean: True,
      },
    )

  counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    IncrementCount,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_increment_count_with_no_oracle_inputed() fail {
  let tx =
    mock_increment_count_tx(
      IncrementCountTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_counter_updated: True,
        is_member_token_minted: True,
        is_counter_output_clean: True,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    IncrementCount,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_increment_count_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_increment_count_tx(
      IncrementCountTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_counter_updated: True,
        is_member_token_minted: True,
        is_counter_output_clean: True,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    IncrementCount,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_increment_count_with_no_counter_updated() {
  let tx =
    mock_increment_count_tx(
      IncrementCountTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_updated: False,
        is_member_token_minted: True,
        is_counter_output_clean: True,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    IncrementCount,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_increment_count_with_no_member_minted() {
  let tx =
    mock_increment_count_tx(
      IncrementCountTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_updated: True,
        is_member_token_minted: False,
        is_counter_output_clean: True,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    IncrementCount,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_increment_count_with_no_clean_output() {
  let tx =
    mock_increment_count_tx(
      IncrementCountTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_updated: True,
        is_member_token_minted: True,
        is_counter_output_clean: False,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    IncrementCount,
    mock_utxo_ref(0, 0),
    tx,
  )
}

type StopCounterTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_counter_burnt: Bool,
  is_admins_signed: Bool,
}

fn mock_stop_counter_tx(test_case: StopCounterTestCase) -> Transaction {
  let StopCounterTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_counter_burnt,
    is_admins_signed,
  } = test_case

  let input_value = from_lovelace(20000000) |> add(mock_counter_nft, "", 1)

  mocktail_tx()
    |> ref_tx_in(
        is_oracle_inputed,
        mock_tx_hash(0),
        0,
        from_asset(mock_oracle_nft, "", 1),
        mock_oracle_address,
      )
    |> ref_tx_in_inline_datum(
        is_oracle_inputed && is_oracle_format_correct,
        mock_input_oracle_datum,
      )
    |> ref_tx_in_inline_datum(
        is_oracle_inputed && !is_oracle_format_correct,
        mock_new_admins,
      )
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_counter_address)
    |> tx_in_inline_datum(True, mock_counter_input_datum)
    |> mint(is_counter_burnt, -1, mock_counter_nft, "")
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

test s1_spend_success_stop_counter() {
  let tx =
    mock_stop_counter_tx(
      StopCounterTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_burnt: True,
        is_admins_signed: True,
      },
    )

  counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    StopCounter,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_stop_counter_with_no_oracle_inputed() fail {
  let tx =
    mock_stop_counter_tx(
      StopCounterTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_counter_burnt: True,
        is_admins_signed: True,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    StopCounter,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_stop_counter_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_stop_counter_tx(
      StopCounterTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_counter_burnt: True,
        is_admins_signed: True,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    StopCounter,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_stop_counter_with_no_counter_burnt() {
  let tx =
    mock_stop_counter_tx(
      StopCounterTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_burnt: False,
        is_admins_signed: True,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    StopCounter,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s1_spend_fail_increment_count_with_no_admins_signed() {
  let tx =
    mock_stop_counter_tx(
      StopCounterTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_burnt: True,
        is_admins_signed: False,
      },
    )

  !counter_spend.counter.spend(
    mock_oracle_nft,
    Some(mock_counter_input_datum),
    StopCounter,
    mock_utxo_ref(0, 0),
    tx,
  )
}
