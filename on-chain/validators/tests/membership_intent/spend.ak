use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use membership_intent/spend as membership_intent_spend
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mock_utxo_ref, mocktail_tx,
  ref_tx_in, ref_tx_in_inline_datum, tx_in, tx_in_inline_datum, tx_out,
  tx_out_inline_datum,
}
use tests/utils.{
  mock_input_oracle_datum, mock_membership_intent_address,
  mock_membership_intent_token, mock_metadata, mock_new_admins,
  mock_oracle_address, mock_oracle_nft, mock_user_address, mock_user_token,
}
use types.{
  MembershipIntentDatum, ProcessMembershipIntent, UpdateMembershipIntentMetadata,
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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_membership_intent_address)
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
    ProcessMembershipIntent,
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
    ProcessMembershipIntent,
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
    ProcessMembershipIntent,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_process_intent_with_no_intent_burnt() {
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
    ProcessMembershipIntent,
    mock_utxo_ref(0, 0),
    tx,
  )
}

type UpdateMetadataTestCase {
  is_oracle_inputed: Bool,
  is_token_inputed: Bool,
  is_token_output_correct: Bool,
  is_intent_output_clean: Bool,
  is_intent_output_datum_correct: Bool,
}

fn mock_update_metadata_tx(test_case: UpdateMetadataTestCase) -> Transaction {
  let UpdateMetadataTestCase {
    is_oracle_inputed,
    is_token_inputed,
    is_token_output_correct,
    is_intent_output_clean,
    is_intent_output_datum_correct,
  } = test_case

  let input_intent_datum =
    MembershipIntentDatum {
      token: (mock_user_token.1st, mock_user_token.2nd),
      metadata: mock_metadata,
    }

  let correct_intent_datum =
    MembershipIntentDatum {
      token: (mock_user_token.1st, mock_user_token.2nd),
      metadata: "aaa project",
    }
  let incorrect_intent_datum =
    MembershipIntentDatum {
      token: (mock_policy_id(999), "incorrect"),
      metadata: mock_metadata,
    }
  let input_value =
    from_lovelace(20000000) |> add(mock_membership_intent_token, "", 1)
  let user_input_value =
    from_lovelace(20000000) |> add(mock_user_token.1st, mock_user_token.2nd, 1)
  mocktail_tx()
    |> ref_tx_in(
        is_oracle_inputed,
        mock_tx_hash(0),
        0,
        from_asset(mock_oracle_nft, "", 1),
        mock_oracle_address,
      )
    |> ref_tx_in_inline_datum(is_oracle_inputed, mock_input_oracle_datum)
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_membership_intent_address)
    |> tx_in_inline_datum(True, input_intent_datum)
    |> tx_out(
        True && is_intent_output_clean,
        mock_membership_intent_address,
        from_lovelace(20000000)
          |> add(mock_membership_intent_token, "", 1),
      )
    |> tx_out(
        True && !is_intent_output_clean,
        mock_membership_intent_address,
        from_lovelace(20000000)
          |> add(mock_membership_intent_token, "", 1)
          |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(is_intent_output_datum_correct, correct_intent_datum)
    |> tx_out_inline_datum(!is_intent_output_datum_correct, incorrect_intent_datum)
    |> tx_in(
        is_token_inputed,
        mock_tx_hash(1),
        1,
        user_input_value,
        mock_user_address,
      )
    |> tx_out(is_token_output_correct, mock_user_address, user_input_value)
    |> complete()
}

test s2_spend_success_update_metadata() {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    Some(
      MembershipIntentDatum {
        token: (mock_user_token.1st, mock_user_token.2nd),
        metadata: mock_metadata,
      },
    ),
    UpdateMembershipIntentMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_update_metadata_with_no_oracle_inputed() fail {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: False,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    Some(
      MembershipIntentDatum {
        token: (mock_user_token.1st, mock_user_token.2nd),
        metadata: mock_metadata,
      },
    ),
    UpdateMembershipIntentMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_update_metadata_with_no_token_inputed() fail {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: False,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    Some(
      MembershipIntentDatum {
        token: (mock_user_token.1st, mock_user_token.2nd),
        metadata: mock_metadata,
      },
    ),
    UpdateMembershipIntentMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_update_metadata_with_incorrect_output_token() fail {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: True,
        is_token_output_correct: False,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    Some(
      MembershipIntentDatum {
        token: (mock_user_token.1st, mock_user_token.2nd),
        metadata: mock_metadata,
      },
    ),
    UpdateMembershipIntentMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_update_metadata_with_intent_output_not_clean() {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: False,
        is_intent_output_datum_correct: True,
      },
    )

  !membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    Some(
      MembershipIntentDatum {
        token: (mock_user_token.1st, mock_user_token.2nd),
        metadata: mock_metadata,
      },
    ),
    UpdateMembershipIntentMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s2_spend_fail_update_metadata_with_incorrect_intent_output_datum() {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: False,
      },
    )

  !membership_intent_spend.membership_intent.spend(
    mock_oracle_nft,
    Some(
      MembershipIntentDatum {
        token: (mock_user_token.1st, mock_user_token.2nd),
        metadata: mock_metadata,
      },
    ),
    UpdateMembershipIntentMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}
