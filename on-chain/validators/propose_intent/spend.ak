use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction, find_input}
use cocktail.{
  address_payment_key, key_signed, outputs_at_with_policy,
  policy_only_minted_token, value_length, value_policy_info,
}
use types.{
  OracleDatum, ProcessProposalIntent, ProposalDatum, ProposalIntentSpendRedeemer,
  UpdateProposalIntentMetadata,
}
use utils.{get_oracle_nft_datum}

validator propose_intent(oracle_nft: PolicyId) {
  spend(
    datum_opt: Option<ProposalDatum>,
    redeemer: ProposalIntentSpendRedeemer,
    utxo: OutputReference,
    self: Transaction,
  ) {
    let Transaction {
      inputs,
      reference_inputs,
      mint,
      outputs,
      extra_signatories,
      ..
    } = self

    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum { propose_intent_token, .. } = oracle_input_datum
    expect Some(own_input) = find_input(inputs, utxo)

    expect Some((policy_id, asset_name, _)) =
      value_policy_info(own_input.output.value, propose_intent_token)

    when redeemer is {
      ProcessProposalIntent ->
        policy_only_minted_token(mint, policy_id, asset_name, -1)
      UpdateProposalIntentMetadata -> {
        expect Some(old_proposal_intent_input_datum) = datum_opt

        let ProposalDatum { receiver, .. } = old_proposal_intent_input_datum

        let is_receiver_key_signed =
          key_signed(extra_signatories, address_payment_key(receiver))
        expect [intent_output] =
          outputs_at_with_policy(outputs, own_input.output.address, policy_id)

        let is_intent_output_value_clean =
          value_length(intent_output.value) == 2
        is_intent_output_value_clean? && is_receiver_key_signed?
      }
    }
  }

  else(_) {
    fail
  }
}
