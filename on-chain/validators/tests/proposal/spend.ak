use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, mint, mock_tx_hash, mock_utxo_ref, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, tx_in,
}
use proposal/spend as proposal_spend
use tests/utils.{
  mock_input_oracle_datum, mock_new_admins, mock_oracle_address, mock_oracle_nft,
  mock_proposal_address, mock_proposal_token,
}

type ApproveSignOffTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_proposal_burnt: Bool,
}

fn mock_approve_sign_off_tx(test_case: ApproveSignOffTestCase) -> Transaction {
  let ApproveSignOffTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_proposal_burnt,
  } = test_case

  let input_value = from_lovelace(20000000) |> add(mock_proposal_token, "", 1)

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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_proposal_address)
    |> mint(is_proposal_burnt, -1, mock_proposal_token, "")
    |> complete()
}

test s5_spend_success_approve_sign_off() {
  let tx =
    mock_approve_sign_off_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_burnt: True,
      },
    )

  proposal_spend.proposal.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s5_spend_fail_approve_sign_off_with_no_oracle_inputed() fail {
  let tx =
    mock_approve_sign_off_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_proposal_burnt: True,
      },
    )

  !proposal_spend.proposal.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s5_spend_fail_approve_sign_off_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_approve_sign_off_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_proposal_burnt: True,
      },
    )

  !proposal_spend.proposal.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s5_spend_fail_approve_sign_off_with_no_proposal_burnt() {
  let tx =
    mock_approve_sign_off_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_burnt: False,
      },
    )

  !proposal_spend.proposal.spend(
    mock_oracle_nft,
    None,
    None,
    mock_utxo_ref(0, 0),
    tx,
  )
}
