use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use member/spend as member_spend
use mocktail.{
  complete, mint, mock_tx_hash, mock_utxo_ref, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, script_withdrawal, tx_in,
}
use tests/utils.{
  mock_counter_count, mock_input_oracle_datum, mock_member_address,
  mock_member_token, mock_new_admins, mock_oracle_address, mock_oracle_nft,
  mock_propose_intent_token, mock_treasury_withdrawal_script_hash,
}
use types.{AdminRemoveMember, AdminSignOffProject, MemberProposeProject}

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

type ProposeProjectTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_propose_intent_minted: Bool,
}

fn mock_propose_project_tx(test_case: ProposeProjectTestCase) -> Transaction {
  let ProposeProjectTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_propose_intent_minted,
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
    |> mint(is_propose_intent_minted, 1, mock_propose_intent_token, "")
    |> complete()
}

test s3_spend_success_propose_project() {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_propose_intent_minted: True,
      },
    )

  member_spend.member.spend(
    mock_oracle_nft,
    None,
    MemberProposeProject,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_propose_project_with_no_oracle_inputed() fail {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_propose_intent_minted: True,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    MemberProposeProject,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_propose_project_with_incorrect_oracle_format() fail {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_propose_intent_minted: True,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    MemberProposeProject,
    mock_utxo_ref(0, 0),
    tx,
  )
}

test s3_spend_fail_propose_project_with_no_propose_intent_minted() {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_propose_intent_minted: False,
      },
    )

  !member_spend.member.spend(
    mock_oracle_nft,
    None,
    MemberProposeProject,
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
