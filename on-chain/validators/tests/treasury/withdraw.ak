use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, tx_in, tx_in_inline_datum, tx_out, tx_out_inline_datum,
}
use tests/utils.{
  mock_counter_count, mock_fund_requested, mock_input_oracle_datum,
  mock_member_address, mock_member_datum, mock_member_token, mock_new_admins,
  mock_oracle_address, mock_oracle_nft, mock_proposal_datum, mock_receiver,
  mock_sign_off_approval_address, mock_sign_off_approval_token,
  mock_treasury_address, mock_user_address, mock_user_token,
}
use treasury/w_sign_off as treasury_withdraw
use types.{MemberDatum}

type ProcessSignOffTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_approval_inputed: Bool,
  is_approval_burnt: Bool,
  is_member_inputed: Bool,
  is_member_output_clean: Bool,
  is_member_output_datum_correct: Bool,
  is_fund_output_correct: Bool,
  is_change_output_correct: Bool,
}

fn mock_add_approval_tx(test_case: ProcessSignOffTestCase) -> Transaction {
  let ProcessSignOffTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_approval_inputed,
    is_approval_burnt,
    is_member_inputed,
    is_member_output_clean,
    is_member_output_datum_correct,
    is_fund_output_correct,
    is_change_output_correct,
  } = test_case

  let input_metadata: Data = "abc project"
  let correct_member_datum =
    MemberDatum {
      token: (mock_user_token.1st, mock_user_token.2nd),
      completion: [Pair(input_metadata, 1000)],
      fund_recevied: 1000,
    }
  let incorrect_member_datum = mock_member_datum
  let approval_input_value =
    from_lovelace(20000000) |> add(mock_sign_off_approval_token, "", 1)
  let member_input_value =
    from_lovelace(20000000) |> add(mock_member_token, mock_counter_count, 1)
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
    |> tx_in(
        is_approval_inputed,
        mock_tx_hash(11),
        11,
        approval_input_value,
        mock_sign_off_approval_address,
      )
    |> tx_in_inline_datum(is_approval_inputed, mock_proposal_datum)
    |> mint(is_approval_burnt, -1, mock_sign_off_approval_token, "")
    |> tx_in(
        is_member_inputed,
        mock_tx_hash(12),
        12,
        member_input_value,
        mock_member_address,
      )
    |> tx_in_inline_datum(is_member_inputed, mock_member_datum)
    |> tx_in(
        True,
        mock_tx_hash(13),
        13,
        from_lovelace(20000000),
        mock_treasury_address,
      )
    |> tx_in(
        True,
        mock_tx_hash(14),
        13,
        from_lovelace(20000000),
        mock_treasury_address,
      )
    |> tx_out(is_member_output_clean, mock_member_address, member_input_value)
    |> tx_out(
        !is_member_output_clean,
        mock_member_address,
        member_input_value
          |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(is_member_output_datum_correct, correct_member_datum)
    |> tx_out_inline_datum(!is_member_output_datum_correct, incorrect_member_datum)
    |> tx_out(
        is_fund_output_correct,
        mock_receiver,
        from_lovelace(mock_fund_requested),
      )
    |> tx_out(!is_fund_output_correct, mock_receiver, from_lovelace(999999))
    |> tx_out(
        is_change_output_correct,
        mock_treasury_address,
        from_lovelace(20000000 + 20000000 - mock_fund_requested),
      )
    |> tx_out(
        !is_change_output_correct,
        mock_treasury_address,
        from_lovelace(20000000),
      )
    |> tx_out(!is_change_output_correct, mock_user_address, from_lovelace(999999))
    |> complete()
}

test s7_withdraw_success_process_sign_off() {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_inputed: True,
        is_approval_burnt: True,
        is_member_inputed: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_fund_output_correct: True,
        is_change_output_correct: True,
      },
    )

  treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_no_oracle_inputed() fail {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_approval_inputed: True,
        is_approval_burnt: True,
        is_member_inputed: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_fund_output_correct: True,
        is_change_output_correct: True,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_incorrect_oracle_format() fail {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_approval_inputed: True,
        is_approval_burnt: True,
        is_member_inputed: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_fund_output_correct: True,
        is_change_output_correct: True,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_no_approval_inputed() fail {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_inputed: False,
        is_approval_burnt: True,
        is_member_inputed: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_fund_output_correct: True,
        is_change_output_correct: True,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_no_approval_burnt() {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_inputed: True,
        is_approval_burnt: False,
        is_member_inputed: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_fund_output_correct: True,
        is_change_output_correct: True,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_no_member_inputed() fail {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_inputed: True,
        is_approval_burnt: True,
        is_member_inputed: False,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_fund_output_correct: True,
        is_change_output_correct: True,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_member_output_not_clean() {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_inputed: True,
        is_approval_burnt: True,
        is_member_inputed: True,
        is_member_output_clean: False,
        is_member_output_datum_correct: True,
        is_fund_output_correct: True,
        is_change_output_correct: True,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_incorrect_member_output_datum() {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_inputed: True,
        is_approval_burnt: True,
        is_member_inputed: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: False,
        is_fund_output_correct: True,
        is_change_output_correct: True,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_incorrect_fund_output() {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_inputed: True,
        is_approval_burnt: True,
        is_member_inputed: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_fund_output_correct: False,
        is_change_output_correct: True,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}

test s7_withdraw_fail_process_sign_off_with_incorrect_change_output() {
  let tx =
    mock_add_approval_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_approval_inputed: True,
        is_approval_burnt: True,
        is_member_inputed: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_fund_output_correct: True,
        is_change_output_correct: False,
      },
    )

  !treasury_withdraw.treasury.withdraw(mock_oracle_nft, None, None, tx)
}
