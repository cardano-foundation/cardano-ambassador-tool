use aiken/cbor
use aiken/crypto.{blake2b_256}
use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, required_signer_hash, tx_in, tx_in_inline_datum,
  tx_out, tx_out_inline_datum,
}
use propose_intent/mint as propose_intent_mint
use tests/utils.{
  mock_counter_count, mock_first_admin, mock_fund_requested,
  mock_input_oracle_datum, mock_member, mock_member_address, mock_member_datum,
  mock_member_token, mock_metadata, mock_new_admins, mock_oracle_address,
  mock_oracle_nft, mock_proposal_token, mock_propose_intent_address,
  mock_propose_intent_token, mock_receiver, mock_third_admin, mock_user_address,
  mock_user_token,
}
use types.{ApproveProposal, ProposalDatum, ProposeProject, RejectProposal}

type ProposeProjectTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_intent_minted: Bool,
  is_token_inputed: Bool,
  is_token_output_correct: Bool,
  is_member_inputed: Bool,
  is_member_output_correct: Bool,
  is_intent_output_clean: Bool,
  is_intent_output_datum_correct: Bool,
}

fn mock_propose_project_tx(test_case: ProposeProjectTestCase) -> Transaction {
  let ProposeProjectTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_intent_minted,
    is_token_inputed,
    is_token_output_correct,
    is_member_inputed,
    is_member_output_correct,
    is_intent_output_clean,
    is_intent_output_datum_correct,
  } = test_case

  let correct_intent_token_datum =
    ProposalDatum {
      fund_requested: mock_fund_requested,
      receiver: mock_receiver,
      member: mock_member,
      metadata: mock_metadata,
    }
  let incorrect_intent_token_datum =
    ProposalDatum {
      fund_requested: 10,
      receiver: mock_receiver,
      member: mock_member,
      metadata: mock_metadata,
    }

  let input_value =
    from_lovelace(20000000) |> add(mock_user_token.1st, mock_user_token.2nd, 1)
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
    |> mint(
        is_intent_minted,
        1,
        mock_propose_intent_token,
        cbor.serialise(mock_metadata) |> blake2b_256(),
      )
    |> tx_in(is_token_inputed, mock_tx_hash(0), 0, input_value, mock_user_address)
    |> tx_in(
        is_member_inputed,
        mock_tx_hash(1),
        1,
        member_input_value,
        mock_member_address,
      )
    |> tx_in_inline_datum(is_member_inputed, mock_member_datum)
    |> tx_out(is_token_output_correct, mock_user_address, input_value)
    |> tx_out(is_member_output_correct, mock_member_address, member_input_value)
    |> tx_out(
        !is_member_output_correct,
        mock_member_address,
        member_input_value |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out(
        is_intent_output_clean,
        mock_propose_intent_address,
        from_lovelace(20000000)
          |> add(mock_propose_intent_token, "", 1),
      )
    |> tx_out(
        !is_intent_output_clean,
        mock_propose_intent_address,
        from_lovelace(20000000)
          |> add(mock_propose_intent_token, "", 1)
          |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(
        is_intent_output_datum_correct,
        correct_intent_token_datum,
      )
    |> tx_out_inline_datum(
        !is_intent_output_datum_correct,
        incorrect_intent_token_datum,
      )
    |> complete()
}

test s4_mint_success_propose_project() {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_inputed: True,
        is_member_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(
      mock_fund_requested,
      mock_receiver,
      mock_member,
      mock_metadata,
    ),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_no_oracle_inputed() fail {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_inputed: True,
        is_member_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_inputed: True,
        is_member_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_no_intent_minted() {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: False,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_inputed: True,
        is_member_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_no_token_inputed() fail {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: False,
        is_token_output_correct: True,
        is_member_inputed: True,
        is_member_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_token_ouput_incorrect() fail {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: False,
        is_member_inputed: True,
        is_member_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_no_member_inputed() fail {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_inputed: False,
        is_member_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_member_output_incorrect() {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_inputed: True,
        is_member_output_correct: False,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_intent_token_output_not_clean() {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_inputed: True,
        is_member_output_correct: True,
        is_intent_output_clean: False,
        is_intent_output_datum_correct: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_propose_project_with_incorrect_intent_token_output_datum() {
  let tx =
    mock_propose_project_tx(
      ProposeProjectTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_member_inputed: True,
        is_member_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: False,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ProposeProject(mock_fund_requested, mock_receiver, 0, mock_metadata),
    mock_propose_intent_token,
    tx,
  )
}

type ApproveProposalTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_intent_burnt: Bool,
  is_proposal_minted: Bool,
}

fn mock_approve_proposal_tx(test_case: ApproveProposalTestCase) -> Transaction {
  let ApproveProposalTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_intent_burnt,
    is_proposal_minted,
  } = test_case

  let input_value =
    from_lovelace(20000000)
      |> add(
          mock_propose_intent_token,
          cbor.serialise(mock_metadata) |> blake2b_256(),
          1,
        )

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
    |> mint(
        is_intent_burnt,
        -1,
        mock_propose_intent_token,
        cbor.serialise(mock_metadata) |> blake2b_256(),
      )
    |> mint(
        is_proposal_minted,
        1,
        mock_proposal_token,
        cbor.serialise(mock_metadata) |> blake2b_256(),
      )
    |> complete()
}

test s4_mint_success_approve_proposal() {
  let tx =
    mock_approve_proposal_tx(
      ApproveProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
        is_proposal_minted: True,
      },
    )

  propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ApproveProposal,
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_approve_proposal_with_no_oracle_inputed() fail {
  let tx =
    mock_approve_proposal_tx(
      ApproveProposalTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
        is_proposal_minted: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ApproveProposal,
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_approve_proposal_with_incorrect_oracle_format() fail {
  let tx =
    mock_approve_proposal_tx(
      ApproveProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_intent_burnt: True,
        is_proposal_minted: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ApproveProposal,
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_approve_proposal_with_no_intent_burnt() {
  let tx =
    mock_approve_proposal_tx(
      ApproveProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: False,
        is_proposal_minted: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ApproveProposal,
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_approve_proposal_with_no_member_minted() {
  let tx =
    mock_approve_proposal_tx(
      ApproveProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
        is_proposal_minted: False,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    ApproveProposal,
    mock_propose_intent_token,
    tx,
  )
}

type RejectProposalTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_intent_burnt: Bool,
  is_admins_signed: Bool,
}

fn mock_reject_proposal_tx(test_case: RejectProposalTestCase) -> Transaction {
  let RejectProposalTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_intent_burnt,
    is_admins_signed,
  } = test_case

  let input_value =
    from_lovelace(20000000)
      |> add(
          mock_propose_intent_token,
          cbor.serialise(mock_metadata) |> blake2b_256(),
          1,
        )

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
    |> mint(
        is_intent_burnt,
        -1,
        mock_propose_intent_token,
        cbor.serialise(mock_metadata) |> blake2b_256(),
      )
    |> required_signer_hash(is_admins_signed, mock_first_admin)
    |> required_signer_hash(is_admins_signed, mock_third_admin)
    |> complete()
}

test s4_mint_success_reject_proposal() {
  let tx =
    mock_reject_proposal_tx(
      RejectProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
        is_admins_signed: True,
      },
    )

  propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    RejectProposal,
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_reject_proposal_with_no_oracle_inputed() fail {
  let tx =
    mock_reject_proposal_tx(
      RejectProposalTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
        is_admins_signed: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    RejectProposal,
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_reject_proposal_with_incorrect_oracle_format() fail {
  let tx =
    mock_reject_proposal_tx(
      RejectProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_intent_burnt: True,
        is_admins_signed: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    RejectProposal,
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_reject_proposal_with_no_intent_burnt() {
  let tx =
    mock_reject_proposal_tx(
      RejectProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: False,
        is_admins_signed: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    RejectProposal,
    mock_propose_intent_token,
    tx,
  )
}

test s4_mint_fail_reject_proposal_with_no_admins_signed() {
  let tx =
    mock_reject_proposal_tx(
      RejectProposalTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: False,
        is_admins_signed: True,
      },
    )

  !propose_intent_mint.propose_intent.mint(
    mock_oracle_nft,
    RejectProposal,
    mock_propose_intent_token,
    tx,
  )
}
