use cardano/assets.{add, from_asset, from_lovelace}
use cardano/transaction.{Transaction}
use member/mint as member_mint
use mocktail.{
  complete, mint, mock_policy_id, mock_tx_hash, mocktail_tx, ref_tx_in,
  ref_tx_in_inline_datum, required_signer_hash, tx_in, tx_in_inline_datum,
  tx_out, tx_out_inline_datum,
}
use tests/utils.{
  mock_counter_address, mock_counter_count, mock_counter_input_datum,
  mock_counter_nft, mock_first_admin, mock_input_oracle_datum,
  mock_member_address, mock_member_token, mock_membership_intent_address,
  mock_membership_intent_token, mock_new_admins, mock_oracle_address,
  mock_oracle_nft, mock_second_admin, mock_third_admin, mock_user_address,
  mock_user_token,
}
use types.{AddMember, MemberDatum, MembershipIntentDatum, RemoveMember}

type AddMemberTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_counter_inputed: Bool,
  is_intent_inputed: Bool,
  is_member_minted: Bool,
  is_member_output_clean: Bool,
  is_member_output_datum_correct: Bool,
  is_admins_signed: Bool,
}

fn mock_add_member_tx(test_case: AddMemberTestCase) -> Transaction {
  let AddMemberTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_counter_inputed,
    is_intent_inputed,
    is_member_minted,
    is_member_output_clean,
    is_member_output_datum_correct,
    is_admins_signed,
  } = test_case

  let correct_member_datum =
    MemberDatum {
      token: (mock_user_token.1st, mock_user_token.2nd),
      completion: [],
      fund_recevied: 0,
    }
  let incorrect_member_datum =
    MemberDatum {
      token: (mock_user_token.1st, mock_user_token.2nd),
      completion: [],
      fund_recevied: 999,
    }
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
    |> tx_in(
        is_intent_inputed,
        mock_tx_hash(11),
        11,
        input_value,
        mock_membership_intent_address,
      )
    |> tx_in_inline_datum(
        is_intent_inputed,
        MembershipIntentDatum {
          token: (mock_user_token.1st, mock_user_token.2nd),
        },
      )
    |> mint(is_member_minted, 1, mock_member_token, mock_counter_count)
    |> tx_out(True, mock_user_address, input_value)
    |> tx_out(
        is_member_output_clean,
        mock_member_address,
        from_lovelace(20000000)
          |> add(mock_member_token, mock_counter_count, 1),
      )
    |> tx_out(
        !is_member_output_clean,
        mock_member_address,
        from_lovelace(20000000)
          |> add(mock_member_token, mock_counter_count, 1)
          |> add(mock_policy_id(999), "", 1),
      )
    |> tx_out_inline_datum(is_member_output_datum_correct, correct_member_datum)
    |> tx_out_inline_datum(!is_member_output_datum_correct, incorrect_member_datum)
    |> required_signer_hash(is_admins_signed, mock_first_admin)
    |> required_signer_hash(is_admins_signed, mock_third_admin)
    |> complete()
}

test s3_mint_success_add_member() {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_inputed: True,
        is_member_minted: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

test s3_mint_fail_add_member_with_no_oracle_inputed() fail {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_inputed: True,
        is_member_minted: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

test s3_mint_fail_add_member_with_incorrect_oracle_format() fail {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_counter_inputed: True,
        is_intent_inputed: True,
        is_member_minted: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

test s3_mint_fail_add_member_with_no_counter_inputed() fail {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: False,
        is_intent_inputed: True,
        is_member_minted: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

test s3_mint_fail_add_member_with_no_intent_inputed() fail {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_inputed: False,
        is_member_minted: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

test s3_mint_fail_add_member_with_no_member_minted() {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_inputed: True,
        is_member_minted: False,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

test s3_mint_fail_add_member_with_member_output_not_clean() {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_inputed: True,
        is_member_minted: True,
        is_member_output_clean: False,
        is_member_output_datum_correct: True,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

test s3_mint_fail_add_member_with_member_output_incorrect_datum() {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_inputed: True,
        is_member_minted: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: False,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

test s3_mint_fail_add_member_with_no_admins_signed() {
  let tx =
    mock_add_member_tx(
      AddMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_counter_inputed: True,
        is_intent_inputed: True,
        is_member_minted: True,
        is_member_output_clean: True,
        is_member_output_datum_correct: True,
        is_admins_signed: False,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, AddMember, mock_member_token, tx)
}

type RemoveMemberTestCase {
  is_oracle_inputed: Bool,
  is_oracle_format_correct: Bool,
  is_member_burnt: Bool,
  is_admins_signed: Bool,
}

fn mock_remove_member_tx(test_case: RemoveMemberTestCase) -> Transaction {
  let RemoveMemberTestCase {
    is_oracle_inputed,
    is_oracle_format_correct,
    is_member_burnt,
    is_admins_signed,
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
    |> required_signer_hash(is_admins_signed, mock_first_admin)
    |> required_signer_hash(is_admins_signed, mock_second_admin)
    |> required_signer_hash(is_admins_signed, mock_third_admin)
    |> complete()
}

test s3_mint_success_remove_member() {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_member_burnt: True,
        is_admins_signed: True,
      },
    )

  member_mint.member.mint(mock_oracle_nft, RemoveMember, mock_member_token, tx)
}

test s3_mint_fail_remove_member_with_no_oracle_inputed() fail {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: False,
        is_oracle_format_correct: True,
        is_member_burnt: True,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, RemoveMember, mock_member_token, tx)
}

test s3_mint_fail_remove_member_with_incorrect_oracle_format() fail {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: False,
        is_member_burnt: True,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, RemoveMember, mock_member_token, tx)
}

test s3_mint_fail_remove_member_with_no_member_burnt() {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_member_burnt: False,
        is_admins_signed: True,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, RemoveMember, mock_member_token, tx)
}

test s3_mint_fail_remove_member_with_no_admins_signed() {
  let tx =
    mock_remove_member_tx(
      RemoveMemberTestCase {
        is_oracle_inputed: True,
        is_oracle_format_correct: True,
        is_member_burnt: True,
        is_admins_signed: False,
      },
    )

  !member_mint.member.mint(mock_oracle_nft, RemoveMember, mock_member_token, tx)
}
