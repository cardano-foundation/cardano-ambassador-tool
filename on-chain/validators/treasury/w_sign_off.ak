use cardano/assets.{PolicyId, lovelace_of}
use cardano/certificate.{Certificate}
use cardano/transaction.{Transaction}
use cocktail.{
  convert_int_to_bytes, get_all_value_from, get_all_value_to, inputs_at_with,
  inputs_at_with_policy, only_minted_token, output_inline_datum, outputs_at,
  outputs_at_with, value_length, value_policy_info,
}
use types.{MemberDatum, OracleDatum, ProposalDatum}
use utils.{get_oracle_nft_datum, updated_member_datum}

validator treasury(oracle_nft: PolicyId) {
  withdraw(_r, _c, tx: Transaction) {
    let Transaction { inputs, outputs, mint, reference_inputs, .. } = tx
    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum {
      sign_off_approval_address,
      sign_off_approval_token,
      member_token,
      member_address,
      treasury_address,
      ..
    } = oracle_input_datum

    trace @"111"
    expect [approval_input] =
      inputs_at_with_policy(
        inputs,
        sign_off_approval_address,
        sign_off_approval_token,
      )
    expect approval_input_datum: ProposalDatum =
      output_inline_datum(approval_input.output)

    trace @"222"

    let ProposalDatum { fund_requested, receiver, member, .. } =
      approval_input_datum
    expect Some((_, proposal_asset_name, _)) =
      value_policy_info(approval_input.output.value, sign_off_approval_token)

    trace @"333"

    expect [member_input] =
      inputs_at_with(
        inputs,
        member_address,
        member_token,
        convert_int_to_bytes(member),
      )
    expect member_input_datum: MemberDatum =
      output_inline_datum(member_input.output)
    trace @"444"
    expect [member_output] =
      outputs_at_with(
        outputs,
        member_address,
        member_token,
        convert_int_to_bytes(member),
      )

    let is_member_output_value_clean = value_length(member_output.value) == 2
    expect member_output_datum: MemberDatum = output_inline_datum(member_output)
    trace @"555"
    let correct_member_output_datum =
      updated_member_datum(member_input_datum, approval_input_datum)
    let is_member_output_datum_correct =
      member_output_datum == correct_member_output_datum

    expect [fund_output] = outputs_at(outputs, receiver)

    trace @"666"
    let lovelace_from_treasury =
      get_all_value_from(inputs, treasury_address) |> lovelace_of()
    let lovelace_to_treasury =
      get_all_value_to(outputs, treasury_address) |> lovelace_of()

    let is_lovelace_unlocked_from_treasury_correct =
      lovelace_to_treasury + fund_requested == lovelace_from_treasury
    let fund_check = lovelace_of(fund_output.value) <= fund_requested

    is_member_output_value_clean? && is_member_output_datum_correct? && fund_check? && is_lovelace_unlocked_from_treasury_correct? && only_minted_token(
      mint,
      sign_off_approval_token,
      proposal_asset_name,
      -1,
    )?
  }

  publish(_redeemer: Data, _credential: Certificate, _tx: Transaction) {
    True
  }

  else(_) {
    fail @"unsupported purpose"
  }
}
