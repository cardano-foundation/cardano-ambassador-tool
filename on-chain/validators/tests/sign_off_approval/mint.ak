use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, required_signer_hash, script_withdrawal, tx_in,
  tx_in_inline_datum, tx_out, tx_out_inline_datum,
}
use sign_off_approval/mint as sign_off_approval_mint
use tests/utils.{
  mock_first_admin, mock_input_oracle_datum, mock_member, mock_metadata,
  mock_new_admins, mock_oracle_address, mock_oracle_nft, mock_proposal_address,
  mock_proposal_datum, mock_proposal_token, mock_receiver,
  mock_sign_off_approval_address, mock_sign_off_approval_token, mock_third_admin,
  mock_treasury_withdrawal_script_hash,
}
use types.{MintSignOffApproval, ProcessSignOff, ProposalDatum}

type MintSignOffApprovalTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_proposal_inputed: Bool,
  is_approval_minted: Bool,
  is_approval_output_clean: Bool,
  is_approval_output_datum_correct: Bool,
  is_admins_signed: Bool,
}

fn mock_add_approval_tx(test_case: MintSignOffApprovalTestCase) -> Transaction {
  let MintSignOffApprovalTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_proposal_inputed,
    is_approval_minted,
    is_approval_output_clean,
    is_approval_output_datum_correct,
    is_admins_signed,
  } = test_case

  let correct_approval_datum = mock_proposal_datum
  let incorrect_approval_datum =
    ProposalDatum {
      fund_requested: 10,
      receiver: mock_receiver,
      member: mock_member,
      metadata: mock_metadata,
    }
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
    |> tx_in(
        is_proposal_inputed,
        mock_tx_hash(11),
        11,
        input_value,
        mock_proposal_address,
      )
    |> tx_in_inline_datum(is_proposal_inputed, mock_proposal_datum)
    |> mint(is_approval_minted, 1, mock_sign_off_approval_token, "")
    |> tx_out(
        is_approval_output_clean,
        mock_sign_off_approval_address,
        from_lovelace(20000000)
          |> add(mock_sign_off_approval_token, "", 1),
      )
    |> tx_out(
        !is_approval_output_clean,
        mock_sign_off_approval_address,
        from_lovelace(20000000)
          |> add(mock_sign_off_approval_token, "", 1)
          |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(
        is_approval_output_datum_correct,
        correct_approval_datum,
      )
    |> tx_out_inline_datum(
        !is_approval_output_datum_correct,
        incorrect_approval_datum,
      )
    |> required_signer_hash(is_admins_signed, mock_first_admin)
    |> required_signer_hash(is_admins_signed, mock_third_admin)
    |> complete()
}

test s6_mint_success_add_approval() {
  let tx =
    mock_add_approval_tx(
      MintSignOffApprovalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_inputed: True,
        is_approval_minted: True,
        is_approval_output_clean: True,
        is_approval_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    MintSignOffApproval,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_add_approval_with_no_oracle_inputed() fail {
  let tx =
    mock_add_approval_tx(
      MintSignOffApprovalTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_proposal_inputed: True,
        is_approval_minted: True,
        is_approval_output_clean: True,
        is_approval_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    MintSignOffApproval,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_add_approval_with_incorrect_oracle_format() fail {
  let tx =
    mock_add_approval_tx(
      MintSignOffApprovalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_proposal_inputed: True,
        is_approval_minted: True,
        is_approval_output_clean: True,
        is_approval_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    MintSignOffApproval,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_add_approval_with_no_proposal_inputed() fail {
  let tx =
    mock_add_approval_tx(
      MintSignOffApprovalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_inputed: False,
        is_approval_minted: True,
        is_approval_output_clean: True,
        is_approval_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    MintSignOffApproval,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_add_approval_with_no_approval_minted() {
  let tx =
    mock_add_approval_tx(
      MintSignOffApprovalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_inputed: True,
        is_approval_minted: False,
        is_approval_output_clean: True,
        is_approval_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    MintSignOffApproval,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_add_approval_with_approval_output_not_clean() {
  let tx =
    mock_add_approval_tx(
      MintSignOffApprovalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_inputed: True,
        is_approval_minted: True,
        is_approval_output_clean: False,
        is_approval_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    MintSignOffApproval,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_add_approval_with_approval_output_incorrect_datum() {
  let tx =
    mock_add_approval_tx(
      MintSignOffApprovalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_inputed: True,
        is_approval_minted: True,
        is_approval_output_clean: True,
        is_approval_output_datum_correct: False,
        is_admins_signed: True,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    MintSignOffApproval,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_add_approval_with_no_admins_signed() {
  let tx =
    mock_add_approval_tx(
      MintSignOffApprovalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_inputed: True,
        is_approval_minted: True,
        is_approval_output_clean: True,
        is_approval_output_datum_correct: True,
        is_admins_signed: False,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    MintSignOffApproval,
    mock_sign_off_approval_token,
    tx,
  )
}

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

  let input_value =
    from_lovelace(20000000)
      |> add(mock_sign_off_approval_token, "", 1)

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
    |> script_withdrawal(
        is_treasury_withdrawal_cred_attached,
        mock_treasury_withdrawal_script_hash,
        2_000_000,
      )
    |> complete()
}

test s6_mint_success_sign_off_project() {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    ProcessSignOff,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_sign_off_project_with_no_oracle_inputed() fail {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    ProcessSignOff,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_sign_off_project_with_incorrect_oracle_format() fail {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_treasury_withdrawal_cred_attached: True,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    ProcessSignOff,
    mock_sign_off_approval_token,
    tx,
  )
}

test s6_mint_fail_sign_off_project_with_no_treasury_withdrawal_attached() {
  let tx =
    mock_process_sign_off_tx(
      ProcessSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_treasury_withdrawal_cred_attached: False,
      },
    )

  !sign_off_approval_mint.sign_off_approval.mint(
    mock_oracle_nft,
    ProcessSignOff,
    mock_sign_off_approval_token,
    tx,
  )
}
