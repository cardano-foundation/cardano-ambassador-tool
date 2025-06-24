use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use member/spend as member_spend
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mock_utxo_ref, mocktail_tx,
  ref_tx_in, ref_tx_in_inline_datum, script_withdrawal, tx_in,
  tx_in_inline_datum, tx_out, tx_out_inline_datum,
}
use tests/utils.{
  mock_counter_count, mock_input_oracle_datum, mock_member_address,
  mock_member_datum, mock_member_token, mock_new_admins, mock_oracle_address,
  mock_oracle_nft, mock_treasury_withdrawal_script_hash, mock_user_address,
  mock_user_token,
}
use types.{
  AdminRemoveMember, AdminSignOffProject, MemberDatum, MemberUpdateMetadata,
}

type RemoveMemberTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_member_burnt: Bool,
}

fn mock_remove_member_tx(test_case: RemoveMemberTestCase) -> Transaction {
  let RemoveMemberTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_member_burnt,
  } = test_case

  let input_value =
    from_lovelace(20000000)
      |> add(mock_member_token, mock_counter_count, 1)

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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_member_address)
    |> mint(is_member_burnt, -1, mock_member_token, mock_counter_count)
    |> complete()
}

test s3_spend_success_remove_member() {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_member_burnt: True,
      },
    )

  member_spend.member.spend(
    mock_oracle_nft,
    None,
    AdminRemoveMember,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_remove_member_with_no_oracle_inputed() fail {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_member_burnt: True,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    AdminRemoveMember,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_remove_member_with_incorrect_oracle_format() fail {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_member_burnt: True,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    AdminRemoveMember,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_remove_member_with_no_member_burnt() {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_member_burnt: False,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    AdminRemoveMember,
    mock_utxo_ref(0, 0),
    tx,
  )
}

type SignOffProjectTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_treasury_withdrawal_cred_attached: Bool,
}

fn mock_sign_off_project_tx(test_case: SignOffProjectTestCase) -> Transaction {
  let SignOffProjectTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_treasury_withdrawal_cred_attached,
  } = test_case

  let input_value =
    from_lovelace(20000000)
      |> add(mock_member_token, mock_counter_count, 1)

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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_member_address)
    |> script_withdrawal(
        is_treasury_withdrawal_cred_attached,
        mock_treasury_withdrawal_script_hash,
        2_000_000,
      )
    |> complete()
}

test s3_spend_success_sign_off_project() {
  let tx =
    mock_sign_off_project_tx(
      SignOffProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  member_spend.member.spend(
    mock_oracle_nft,
    None,
    AdminSignOffProject,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_sign_off_project_with_no_oracle_inputed() fail {
  let tx =
    mock_sign_off_project_tx(
      SignOffProjectTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    AdminSignOffProject,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_sign_off_project_with_incorrect_oracle_format() fail {
  let tx =
    mock_sign_off_project_tx(
      SignOffProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    AdminSignOffProject,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_sign_off_project_with_no_treasury_withdrawal_attached() {
  let tx =
    mock_sign_off_project_tx(
      SignOffProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: False,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    AdminSignOffProject,
    mock_utxo_ref(0, 0),
    tx,
  )
}

type UpdateMetadataTestCase {
  is_oracle_inputed: Bool,
  is_token_inputed: Bool,
  is_token_output_correct: Bool,
  is_member_output_clean: Bool,
  is_member_output_datum_correct: Bool,
}

fn mock_update_metadata_tx(test_case: UpdateMetadataTestCase) -> Transaction {
  let UpdateMetadataTestCase {
    is_oracle_inputed,
    is_token_inputed,
    is_token_output_correct,
    is_member_output_clean,
    is_member_output_datum_correct,
  } = test_case

  let input_member_datum = mock_member_datum
  let correct_member_datum =
    MemberDatum {
      token: (mock_user_token.1st, mock_user_token.2nd),
      completion: [],
      fund_recevied: 0,
      metadata: "aaa project",
    }
  let incorrect_member_datum =
    MemberDatum {
      token: (mock_policy_id(999), "incorrect"),
      completion: [],
      fund_recevied: 10,
      metadata: "aaa project",
    }
  let input_value =
    from_lovelace(20000000) |> add(mock_member_token, mock_counter_count, 1)
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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_member_address)
    |> tx_in_inline_datum(True, input_member_datum)
    |> tx_out(
        True && is_member_output_clean,
        mock_member_address,
        from_lovelace(20000000)
          |> add(mock_member_token, mock_counter_count, 1),
      )
    |> tx_out(
        True && !is_member_output_clean,
        mock_member_address,
        from_lovelace(20000000)
          |> add(mock_member_token, mock_counter_count, 1)
          |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(is_member_output_datum_correct, correct_member_datum)
    |> tx_out_inline_datum(!is_member_output_datum_correct, incorrect_member_datum)
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

test s3_spend_success_update_metadata() {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
      },
    )

  member_spend.member.spend(
    mock_oracle_nft,
    Some(mock_member_datum),
    MemberUpdateMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_update_metadata_with_no_oracle_inputed() fail {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: False,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
      },
    )

  member_spend.member.spend(
    mock_oracle_nft,
    Some(mock_member_datum),
    MemberUpdateMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_update_metadata_with_no_token_inputed() fail {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: False,
        is_token_output_correct: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
      },
    )

  member_spend.member.spend(
    mock_oracle_nft,
    Some(mock_member_datum),
    MemberUpdateMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_update_metadata_with_incorrect_output_token() fail {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: True,
        is_token_output_correct: False,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
      },
    )

  member_spend.member.spend(
    mock_oracle_nft,
    Some(mock_member_datum),
    MemberUpdateMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_update_metadata_with_member_output_not_clean() {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_output_clean: False,
        is_member_output_datum_correct: True,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    Some(mock_member_datum),
    MemberUpdateMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_update_metadata_with_incorrect_member_output_datum() {
  let tx =
    mock_update_metadata_tx(
      UpdateMetadataTestCase {
        is_oracle_inputed: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: False,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    Some(mock_member_datum),
    MemberUpdateMetadata,
    mock_utxo_ref(0, 0),
    tx,
  )
}
