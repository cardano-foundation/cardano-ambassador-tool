use aiken/collection/list
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
// todo: check membership
