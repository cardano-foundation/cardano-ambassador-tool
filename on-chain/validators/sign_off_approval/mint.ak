use aiken/collection/pairs.{has_key}
use cardano/address.{Credential, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use cocktail.{
  inputs_at_with_policy, output_inline_datum, outputs_at_with,
  policy_only_minted_token, value_length, value_policy_info,
}
use types.{
  MintSignOffApproval, OracleDatum, ProcessSignOff, ProposalDatum,
  SignOffApprovalMintRedeemer,
}
use utils.{get_oracle_nft_datum, has_enough_signers}

validator sign_off_approval(oracle_nft: PolicyId) {
  mint(
    redeemer: SignOffApprovalMintRedeemer,
    policy_id: PolicyId,
    self: Transaction,
  ) {
    let Transaction {
      inputs,
      reference_inputs,
      extra_signatories,
      outputs,
      mint,
      withdrawals,
      ..
    } = self

    let oracle_input_datum: OracleDatum =
      reference_inputs |> get_oracle_nft_datum(oracle_nft)
    let OracleDatum {
      admins,
      proposal_address,
      proposal_token,
      multi_sig_threshold,
      sign_off_approval_address,
      treasury_withdrawal_script_hash,
      ..
    } = oracle_input_datum

    when redeemer is {
      MintSignOffApproval -> {
        expect [proposal_input] =
          inputs_at_with_policy(inputs, proposal_address, proposal_token)
        expect proposal_input_datum: ProposalDatum =
          output_inline_datum(proposal_input.output)

        expect Some((_, proposal_asset_name, _)) =
          value_policy_info(proposal_input.output.value, proposal_token)

        expect [approval_output] =
          outputs_at_with(
            outputs,
            sign_off_approval_address,
            policy_id,
            proposal_asset_name,
          )
        let is_approval_output_value_clean =
          value_length(approval_output.value) == 2
        expect approval_output_datum: ProposalDatum =
          output_inline_datum(approval_output)
        let is_approval_output_datum_correct =
          approval_output_datum == proposal_input_datum
        let is_admins_multi_signed =
          has_enough_signers(admins, multi_sig_threshold, extra_signatories)
        is_approval_output_value_clean? && is_approval_output_datum_correct? && policy_only_minted_token(
          mint,
          policy_id,
          proposal_asset_name,
          1,
        )? && is_admins_multi_signed?
      }

      ProcessSignOff -> {
        let treasury_withdrawal_credential: Credential =
          Script(treasury_withdrawal_script_hash)
        let treasury_withdrawal_script_check =
          withdrawals
            |> has_key(treasury_withdrawal_credential)
        treasury_withdrawal_script_check?
      }
    }
  }

  else(_) {
    fail
  }
}
