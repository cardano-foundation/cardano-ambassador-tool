use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{PolicyId, quantity_of}
use cardano/transaction.{DatumHash, InlineDatum, Input, NoDatum, Output}
use types.{CounterDatum, OracleDatum}

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

pub fn get_counter_datum(
  reference_inputs: List<Input>,
  counter_nft: PolicyId,
) -> CounterDatum {
  expect Some(counter_input) =
    reference_inputs
      |> list.find(
          fn(ref_input: Input) {
            quantity_of(ref_input.output.value, counter_nft, "") == 1
          },
        )

  let counter_input_data: Data =
    when counter_input.output.datum is {
      NoDatum -> fail @"Counter input does not contain any datum"
      DatumHash(_) -> fail @"Counter input datum must be inlined"
      InlineDatum(data) -> data
    }
  expect counter_input_datum: CounterDatum = counter_input_data
  counter_input_datum
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
// todo: check membership
