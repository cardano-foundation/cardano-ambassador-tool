use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, mint, mock_tx_hash, mock_utxo_ref, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, tx_in,
}
use propose_intent/spend as propose_intent_spend
use tests/utils.{
  mock_input_oracle_datum, mock_new_admins, mock_oracle_address, mock_oracle_nft,
  mock_propose_intent_address, mock_propose_intent_token,
}
use types.{ProcessProposalIntent}

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
    from_lovelace(20000000) |> add(mock_propose_intent_token, "", 1)

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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_propose_intent_address)
    |> mint(is_intent_burnt, -1, mock_propose_intent_token, "")
    |> complete()
}

test s4_spend_success_process_intent() {
  let tx =
    mock_process_intent_tx(
      ProcessIntentTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
      },
    )

  propose_intent_spend.propose_intent.spend(
    mock_oracle_nft,
    None,
    ProcessProposalIntent,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s4_spend_fail_process_intent_with_no_oracle_inputed() fail {
  let tx =
    mock_process_intent_tx(
      ProcessIntentTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
      },
    )

  !propose_intent_spend.propose_intent.spend(
    mock_oracle_nft,
    None,
    ProcessProposalIntent,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s4_spend_fail_process_intent_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_process_intent_tx(
      ProcessIntentTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_intent_burnt: True,
      },
    )

  !propose_intent_spend.propose_intent.spend(
    mock_oracle_nft,
    None,
    ProcessProposalIntent,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s4_spend_fail_process_intent_with_no_intent_burnt() {
  let tx =
    mock_process_intent_tx(
      ProcessIntentTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: False,
      },
    )

  !propose_intent_spend.propose_intent.spend(
    mock_oracle_nft,
    None,
    ProcessProposalIntent,
    mock_utxo_ref(0, 0),
    tx,
  )
}
