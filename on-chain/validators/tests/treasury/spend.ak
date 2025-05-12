use cardano/assets.{from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, mock_tx_hash, mock_utxo_ref, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, script_withdrawal, tx_in,
}
use tests/utils.{
  mock_input_oracle_datum, mock_new_admins, mock_oracle_address, mock_oracle_nft,
  mock_treasury_address, mock_treasury_withdrawal_script_hash,
}
use treasury/spend as treasury_spend

type ProcessSignOffTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_treasury_withdrawal_cred_attached: Bool,
}

fn mock_process_sign_off_tx(test_case: ProcessSignOffTestCase) -> Transaction {
  let ProcessSignOffTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_treasury_withdrawal_cred_attached,
  } = test_case

  let input_value = from_lovelace(20000000)

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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_treasury_address)
    |> script_withdrawal(
        is_treasury_withdrawal_cred_attached,
        mock_treasury_withdrawal_script_hash,
        2_000_000,
      )
    |> complete()
}

test s7_spend_success_process_sign_off() {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  treasury_spend.treasury.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s7_spend_fail_process_sign_off_with_no_oracle_inputed() fail {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  !treasury_spend.treasury.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s7_spend_fail_process_sign_off_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  !treasury_spend.treasury.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s7_spend_fail_process_sign_off_with_no_treasury_withdrawal_attached() {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: False,
      },
    )

  !treasury_spend.treasury.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}
