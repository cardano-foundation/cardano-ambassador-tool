use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use membership_intent/spend as membership_intent_spend
use mocktail.{
  complete, mint, mock_tx_hash, mock_utxo_ref, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, tx_in,
}
use tests/utils.{
  mock_counter_address, mock_input_oracle_datum, mock_membership_intent_token,
  mock_new_admins, mock_oracle_address, mock_oracle_nft,
}

type ProcessIntentTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_intent_burnt: Bool,
}

fn mock_process_intent_tx(test_case: ProcessIntentTestCase) -> Transaction {
  let ProcessIntentTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_intent_burnt,
  } = test_case

  let input_value =
    from_lovelace(20000000) |> add(mock_membership_intent_token, "", 1)

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
    |> mint(is_intent_burnt, -1, mock_membership_intent_token, "")
    |> complete()
}

test s2_spend_success_process_intent() {
  let tx =
    mock_process_intent_tx(
      ProcessIntentTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
      },
    )

  membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_process_intent_with_no_oracle_inputed() fail {
  let tx =
    mock_process_intent_tx(
      ProcessIntentTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
      },
    )

  !membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_process_intent_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_process_intent_tx(
      ProcessIntentTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_intent_burnt: True,
      },
    )

  !membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_process_intent_with_no_counter_updated() {
  let tx =
    mock_process_intent_tx(
      ProcessIntentTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: False,
      },
    )

  !membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}
