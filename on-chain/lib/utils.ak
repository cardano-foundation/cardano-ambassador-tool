use aiken/collection/list.{concat, length}
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}
use cardano/assets.{AssetName, PolicyId, quantity_of}
use cardano/transaction.{DatumHash, InlineDatum, Input, NoDatum, Output}
use cocktail.{
  convert_int_to_bytes, inputs_at_with, output_inline_datum, outputs_at,
}
use types.{
  CounterDatum, MemberDatum, MembershipIntentDatum, OracleDatum, ProposalDatum,
}

pub fn get_oracle_nft_datum(
  reference_inputs: List<Input>,
  oracle_nft: PolicyId,
) -> OracleDatum {
  expect Some(oracle_input) =
    reference_inputs
      |> list.find(
          fn(ref_input: Input) {
            quantity_of(ref_input.output.value, oracle_nft, "") == 1
          },
        )

  let oracle_input_data: Data =
    when oracle_input.output.datum is {
      NoDatum -> fail @"Oracle input does not contain any datum"
      DatumHash(_) -> fail @"Oracle input datum must be inlined"
      InlineDatum(data) -> data
    }
  expect oracle_input_datum: OracleDatum = oracle_input_data
  oracle_input_datum
}

pub fn get_counter_count(
  inputs: List<Input>,
  counter_nft: PolicyId,
  counter_address: Address,
) -> AssetName {
  expect [counter_input] =
    inputs_at_with(inputs, counter_address, counter_nft, "")
  expect counter_input_datum: CounterDatum =
    output_inline_datum(counter_input.output)
  let CounterDatum { count } = counter_input_datum
  let count_asset_name = convert_int_to_bytes(count)
  count_asset_name
}

pub fn get_membership_intent_datum(
  inputs: List<Input>,
  membership_intent_token: PolicyId,
) -> MembershipIntentDatum {
  expect Some(membership_intent_input) =
    inputs
      |> list.find(
          fn(input: Input) {
            quantity_of(input.output.value, membership_intent_token, "") == 1
          },
        )

  let membership_intent_input_data: Data =
    when membership_intent_input.output.datum is {
      NoDatum -> fail @"Counter input does not contain any datum"
      DatumHash(_) -> fail @"Counter input datum must be inlined"
      InlineDatum(data) -> data
    }
  expect membership_intent_input_datum: MembershipIntentDatum =
    membership_intent_input_data
  membership_intent_input_datum
}

pub fn has_all_signers(
  all_signers: List<VerificationKeyHash>,
  actual_signers: List<VerificationKeyHash>,
) -> Bool {
  when all_signers is {
    [] -> True
    [head, ..tail] ->
      if !list.has(actual_signers, head) {
        False
      } else {
        has_all_signers(tail, actual_signers)
      }
  }
}

pub fn has_enough_signers(
  all_signers: List<VerificationKeyHash>,
  threshold: Int,
  actual_signers: List<VerificationKeyHash>,
) -> Bool {
  when all_signers is {
    [] -> False
    [head, ..tail] ->
      if list.has(actual_signers, head) {
        if threshold > 1 {
          has_enough_signers(tail, threshold - 1, actual_signers)
        } else {
          True
        }
      } else {
        has_enough_signers(tail, threshold, actual_signers)
      }
  }
}

pub fn updated_member_datum(
  member_datum: MemberDatum,
  proposal_datum: ProposalDatum,
) -> MemberDatum {
  let MemberDatum { completion, fund_recevied, .. } = member_datum
  let ProposalDatum { fund_requested, metadata, .. } = proposal_datum
  let new_fund_received = fund_recevied + fund_requested
  let new_completion = completion |> concat([Pair(metadata, fund_requested)])
  let updated_datum: MemberDatum =
    MemberDatum {
      ..member_datum,
      completion: new_completion,
      fund_recevied: new_fund_received,
    }

  updated_datum
}

pub fn check_treasury_change_address(
  outputs: List<Output>,
  treasury_address: Address,
) -> Bool {
  when length(outputs) is {
    2 -> True
    3 -> {
      expect [_] = outputs_at(outputs, treasury_address)
      True
    }
    _ -> False
  }
}
