use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, required_signer_hash, tx_in, tx_in_inline_datum,
  tx_out, tx_out_inline_datum,
}
use proposal/mint as proposal_mint
use tests/utils.{
  mock_first_admin, mock_input_oracle_datum, mock_member, mock_metadata,
  mock_new_admins, mock_oracle_address, mock_oracle_nft, mock_proposal_address,
  mock_proposal_datum, mock_proposal_token, mock_propose_intent_address,
  mock_propose_intent_token, mock_receiver, mock_sign_off_approval_token,
  mock_third_admin,
}
use types.{ApproveSignOff, MintProposal, ProposalDatum}

type MintProposalTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_intent_inputed: Bool,
  is_proposal_minted: Bool,
  is_proposal_output_clean: Bool,
  is_proposal_output_datum_correct: Bool,
  is_admins_signed: Bool,
}

fn mock_add_proposal_tx(test_case: MintProposalTestCase) -> Transaction {
  let MintProposalTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_intent_inputed,
    is_proposal_minted,
    is_proposal_output_clean,
    is_proposal_output_datum_correct,
    is_admins_signed,
  } = test_case

  let correct_proposal_datum = mock_proposal_datum
  let incorrect_proposal_datum =
    ProposalDatum {
      fund_requested: 10,
      receiver: mock_receiver,
      member: mock_member,
      metadata: mock_metadata,
    }
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
    |> tx_in(
        is_intent_inputed,
        mock_tx_hash(11),
        11,
        input_value,
        mock_propose_intent_address,
      )
    |> tx_in_inline_datum(is_intent_inputed, mock_proposal_datum)
    |> mint(is_proposal_minted, 1, mock_proposal_token, "")
    |> tx_out(
        is_proposal_output_clean,
        mock_proposal_address,
        from_lovelace(20000000)
          |> add(mock_proposal_token, "", 1),
      )
    |> tx_out(
        !is_proposal_output_clean,
        mock_proposal_address,
        from_lovelace(20000000)
          |> add(mock_proposal_token, "", 1)
          |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(
        is_proposal_output_datum_correct,
        correct_proposal_datum,
      )
    |> tx_out_inline_datum(
        !is_proposal_output_datum_correct,
        incorrect_proposal_datum,
      )
    |> required_signer_hash(is_admins_signed, mock_first_admin)
    |> required_signer_hash(is_admins_signed, mock_third_admin)
    |> complete()
}

test s5_mint_success_add_proposal() {
  let tx =
    mock_add_proposal_tx(
      MintProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_inputed: True,
        is_proposal_minted: True,
        is_proposal_output_clean: True,
        is_proposal_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  proposal_mint.proposal.mint(
    mock_oracle_nft,
    MintProposal,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_add_proposal_with_no_oracle_inputed() fail {
  let tx =
    mock_add_proposal_tx(
      MintProposalTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_intent_inputed: True,
        is_proposal_minted: True,
        is_proposal_output_clean: True,
        is_proposal_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    MintProposal,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_add_proposal_with_incorrect_oracle_format() fail {
  let tx =
    mock_add_proposal_tx(
      MintProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_intent_inputed: True,
        is_proposal_minted: True,
        is_proposal_output_clean: True,
        is_proposal_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    MintProposal,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_add_proposal_with_no_intent_inputed() fail {
  let tx =
    mock_add_proposal_tx(
      MintProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_inputed: False,
        is_proposal_minted: True,
        is_proposal_output_clean: True,
        is_proposal_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    MintProposal,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_add_proposal_with_no_proposal_minted() {
  let tx =
    mock_add_proposal_tx(
      MintProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_inputed: True,
        is_proposal_minted: False,
        is_proposal_output_clean: True,
        is_proposal_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    MintProposal,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_add_proposal_with_proposal_output_not_clean() {
  let tx =
    mock_add_proposal_tx(
      MintProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_inputed: True,
        is_proposal_minted: True,
        is_proposal_output_clean: False,
        is_proposal_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    MintProposal,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_add_proposal_with_proposal_output_incorrect_datum() {
  let tx =
    mock_add_proposal_tx(
      MintProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_inputed: True,
        is_proposal_minted: True,
        is_proposal_output_clean: True,
        is_proposal_output_datum_correct: False,
        is_admins_signed: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    MintProposal,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_add_proposal_with_no_admins_signed() {
  let tx =
    mock_add_proposal_tx(
      MintProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_inputed: True,
        is_proposal_minted: True,
        is_proposal_output_clean: True,
        is_proposal_output_datum_correct: True,
        is_admins_signed: False,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    MintProposal,
    mock_proposal_token,
    tx,
  )
}

type ApproveSignOffTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_proposal_burnt: Bool,
  is_sign_off_approveal_minted: Bool,
}

fn mock_remove_proposal_tx(test_case: ApproveSignOffTestCase) -> Transaction {
  let ApproveSignOffTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_proposal_burnt,
    is_sign_off_approveal_minted,
  } = test_case

  let input_value =
    from_lovelace(20000000)
      |> add(mock_proposal_token, "", 1)

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
    |> mint(is_sign_off_approveal_minted, 1, mock_sign_off_approval_token, "")
    |> complete()
}

test s5_mint_success_remove_proposal() {
  let tx =
    mock_remove_proposal_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_burnt: True,
        is_sign_off_approveal_minted: True,
      },
    )

  proposal_mint.proposal.mint(
    mock_oracle_nft,
    ApproveSignOff,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_remove_proposal_with_no_oracle_inputed() fail {
  let tx =
    mock_remove_proposal_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_proposal_burnt: True,
        is_sign_off_approveal_minted: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    ApproveSignOff,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_remove_proposal_with_incorrect_oracle_format() fail {
  let tx =
    mock_remove_proposal_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_proposal_burnt: True,
        is_sign_off_approveal_minted: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    ApproveSignOff,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_remove_proposal_with_no_proposal_burnt() {
  let tx =
    mock_remove_proposal_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_burnt: False,
        is_sign_off_approveal_minted: True,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    ApproveSignOff,
    mock_proposal_token,
    tx,
  )
}

test s5_mint_fail_remove_proposal_with_no_sign_off_approval_minted() {
  let tx =
    mock_remove_proposal_tx(
      ApproveSignOffTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_proposal_burnt: True,
        is_sign_off_approveal_minted: False,
      },
    )

  !proposal_mint.proposal.mint(
    mock_oracle_nft,
    ApproveSignOff,
    mock_proposal_token,
    tx,
  )
}
