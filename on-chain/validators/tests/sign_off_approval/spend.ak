use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, mint, mock_tx_hash, mock_utxo_ref, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, tx_in,
}
use sign_off_approval/spend as sign_off_approval_spend
use tests/utils.{
  mock_input_oracle_datum, mock_new_admins, mock_oracle_address, mock_oracle_nft,
  mock_sign_off_approval_address, mock_sign_off_approval_token,
}

type ProcessSignOffTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_approval_burnt: Bool,
}

fn mock_process_sign_off_tx(test_case: ProcessSignOffTestCase) -> Transaction {
  let ProcessSignOffTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_approval_burnt,
  } = test_case

  let input_value =
    from_lovelace(20000000) |> add(mock_sign_off_approval_token, "", 1)

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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_sign_off_approval_address)
    |> mint(is_approval_burnt, -1, mock_sign_off_approval_token, "")
    |> complete()
}

test s6_spend_success_process_sign_off() {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_burnt: True,
      },
    )

  sign_off_approval_spend.sign_off_approval.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s6_spend_fail_process_sign_off_with_no_oracle_inputed() fail {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_approval_burnt: True,
      },
    )

  !sign_off_approval_spend.sign_off_approval.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s6_spend_fail_process_sign_off_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_approval_burnt: True,
      },
    )

  !sign_off_approval_spend.sign_off_approval.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s6_spend_fail_process_sign_off_with_no_sign_off_approval_burnt() {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_burnt: False,
      },
    )

  !sign_off_approval_spend.sign_off_approval.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}
