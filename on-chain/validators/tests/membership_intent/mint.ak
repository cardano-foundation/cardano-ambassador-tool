use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use cocktail.{address_payment_key}
use membership_intent/mint as membership_intent_mint
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, required_signer_hash, tx_in, tx_in_inline_datum,
  tx_out, tx_out_inline_datum,
}
use tests/utils.{
  mock_counter_address, mock_counter_count, mock_counter_input_datum,
  mock_counter_nft, mock_first_admin, mock_input_oracle_datum, mock_member_token,
  mock_membership_intent_address, mock_membership_intent_token, mock_metadata,
  mock_new_admins, mock_oracle_address, mock_oracle_nft, mock_third_admin,
  mock_user_address, mock_user_token,
}
use types.{ApplyMembership, ApproveMember, MembershipIntentDatum, RejectMember}

type ApplyMembershipTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_intent_minted: Bool,
  is_token_inputed: Bool,
  is_token_output_correct: Bool,
  is_intent_output_clean: Bool,
  is_intent_output_datum_correct: Bool,
}

fn mock_apply_membership_tx(test_case: ApplyMembershipTestCase) -> Transaction {
  let ApplyMembershipTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_intent_minted,
    is_token_inputed,
    is_token_output_correct,
    is_intent_output_clean,
    is_intent_output_datum_correct,
  } = test_case

  let correct_intent_datum =
    MembershipIntentDatum {
      token: (mock_user_token.1st, mock_user_token.2nd),
      metadata: mock_metadata,
    }
  let incorrect_intent_datum =
    MembershipIntentDatum {
      token: (mock_policy_id(999), "incorrect"),
      metadata: mock_metadata,
    }
  let input_value =
    from_lovelace(20000000) |> add(mock_user_token.1st, mock_user_token.2nd, 1)

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
    |> mint(is_intent_minted, 1, mock_membership_intent_token, "")
    |> tx_in(
        is_token_inputed,
        mock_tx_hash(0),
        0,
        input_value,
        mock_user_address,
      )
    |> tx_out(is_token_output_correct, mock_user_address, input_value)
    |> tx_out(
        is_intent_output_clean,
        mock_membership_intent_address,
        from_lovelace(20000000)
          |> add(mock_membership_intent_token, "", 1),
      )
    |> tx_out(
        !is_intent_output_clean,
        mock_membership_intent_address,
        input_value |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(is_intent_output_datum_correct, correct_intent_datum)
    |> tx_out_inline_datum(
        !is_intent_output_datum_correct,
        incorrect_intent_datum,
      )
    |> complete()
}

test s2_mint_success_apply_membership() {
  let tx =
    mock_apply_membership_tx(
      ApplyMembershipTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApplyMembership(mock_user_token.1st, mock_user_token.2nd, mock_metadata),
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_apply_membership_with_no_oracle_inputed() fail {
  let tx =
    mock_apply_membership_tx(
      ApplyMembershipTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApplyMembership(mock_user_token.1st, mock_user_token.2nd, mock_metadata),
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_apply_membership_with_incorrect_oracle_inputed() fail {
  let tx =
    mock_apply_membership_tx(
      ApplyMembershipTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApplyMembership(mock_user_token.1st, mock_user_token.2nd, mock_metadata),
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_apply_membership_with_no_intent_minted() {
  let tx =
    mock_apply_membership_tx(
      ApplyMembershipTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: False,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApplyMembership(mock_user_token.1st, mock_user_token.2nd, mock_metadata),
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_apply_membership_with_no_token_inputed() fail {
  let tx =
    mock_apply_membership_tx(
      ApplyMembershipTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: False,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApplyMembership(mock_user_token.1st, mock_user_token.2nd, mock_metadata),
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_apply_membership_with_token_ouput_incorrect() fail {
  let tx =
    mock_apply_membership_tx(
      ApplyMembershipTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: False,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApplyMembership(mock_user_token.1st, mock_user_token.2nd, mock_metadata),
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_apply_membership_with_intent_token_output_not_clean() fail {
  let tx =
    mock_apply_membership_tx(
      ApplyMembershipTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: False,
        is_intent_output_datum_correct: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApplyMembership(mock_user_token.1st, mock_user_token.2nd, mock_metadata),
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_apply_membership_with_incorrect_intent_token_output_datum() {
  let tx =
    mock_apply_membership_tx(
      ApplyMembershipTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_minted: True,
        is_token_inputed: True,
        is_token_output_correct: True,
        is_intent_output_clean: True,
        is_intent_output_datum_correct: False,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApplyMembership(mock_user_token.1st, mock_user_token.2nd, mock_metadata),
    mock_membership_intent_token,
    tx,
  )
}

type ApproveMemberTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_counter_inputed: Bool,
  is_intent_burnt: Bool,
  is_member_minted: Bool,
}

fn mock_approve_member_tx(test_case: ApproveMemberTestCase) -> Transaction {
  let ApproveMemberTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_counter_inputed,
    is_intent_burnt,
    is_member_minted,
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
    |> tx_in(
        is_counter_inputed,
        mock_tx_hash(10),
        10,
        from_asset(mock_counter_nft, "", 1),
        mock_counter_address,
      )
    |> tx_in_inline_datum(is_counter_inputed, mock_counter_input_datum)
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_counter_address)
    |> mint(is_intent_burnt, -1, mock_membership_intent_token, "")
    |> mint(is_member_minted, 1, mock_member_token, mock_counter_count)
    |> complete()
}

test s2_mint_success_approve_member() {
  let tx =
    mock_approve_member_tx(
      ApproveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_burnt: True,
        is_member_minted: True,
      },
    )

  membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApproveMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_approve_member_with_no_oracle_inputed() fail {
  let tx =
    mock_approve_member_tx(
      ApproveMemberTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_burnt: True,
        is_member_minted: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApproveMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_approve_member_with_incorrect_oracle_format() fail {
  let tx =
    mock_approve_member_tx(
      ApproveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_counter_inputed: True,
        is_intent_burnt: True,
        is_member_minted: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApproveMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_approve_member_with_no_counter_inputed() fail {
  let tx =
    mock_approve_member_tx(
      ApproveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: False,
        is_intent_burnt: True,
        is_member_minted: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApproveMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_approve_member_with_no_intent_burnt() {
  let tx =
    mock_approve_member_tx(
      ApproveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_burnt: False,
        is_member_minted: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApproveMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_approve_member_with_no_member_minted() {
  let tx =
    mock_approve_member_tx(
      ApproveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_burnt: True,
        is_member_minted: False,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    ApproveMember,
    mock_membership_intent_token,
    tx,
  )
}

type RejectMemberTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_intent_burnt: Bool,
  is_admins_signed: Bool,
}

fn mock_reject_member_tx(test_case: RejectMemberTestCase) -> Transaction {
  let RejectMemberTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_intent_burnt,
    is_admins_signed,
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
    |> tx_in(True, mock_tx_hash(0), 0, input_value, mock_counter_address)
    |> mint(is_intent_burnt, -1, mock_membership_intent_token, "")
    |> required_signer_hash(
        is_admins_signed,
        address_payment_key(mock_first_admin),
      )
    |> required_signer_hash(
        is_admins_signed,
        address_payment_key(mock_third_admin),
      )
    |> complete()
}

test s2_mint_success_reject_member() {
  let tx =
    mock_reject_member_tx(
      RejectMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
        is_admins_signed: True,
      },
    )

  membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    RejectMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_reject_member_with_no_oracle_inputed() fail {
  let tx =
    mock_reject_member_tx(
      RejectMemberTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_intent_burnt: True,
        is_admins_signed: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    RejectMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_reject_member_with_incorrect_oracle_format() fail {
  let tx =
    mock_reject_member_tx(
      RejectMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_intent_burnt: True,
        is_admins_signed: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    RejectMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_reject_member_with_no_intent_burnt() {
  let tx =
    mock_reject_member_tx(
      RejectMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: False,
        is_admins_signed: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    RejectMember,
    mock_membership_intent_token,
    tx,
  )
}

test s2_mint_fail_reject_member_with_no_admins_signed() {
  let tx =
    mock_reject_member_tx(
      RejectMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_intent_burnt: False,
        is_admins_signed: True,
      },
    )

  !membership_intent_mint.membership_intent.mint(
    mock_oracle_nft,
    RejectMember,
    mock_membership_intent_token,
    tx,
  )
}
