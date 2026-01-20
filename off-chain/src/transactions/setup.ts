import {
  Layer1Tx,
  counterDatum,
  oracleDatum,
  rMint,
  IProvider,
  OracleDatum,
  CATConstants,
} from "../lib";
import { IWallet, resolveScriptHash, UTxO } from "@meshsdk/core";

export enum ScriptType {
  MembershipIntent = "membershipIntent",
  Member = "member",
  ProposeIntent = "proposeIntent",
  Proposal = "proposal",
  SignOffApproval = "signOffApproval",
  Treasury = "treasury",
}

export class SetupTx extends Layer1Tx {
  constructor(
    public address: string,
    public userWallet: IWallet,
    public provider: IProvider,
    public catConstant: CATConstants
  ) {
    super(userWallet, address, provider, catConstant);
  }

  /**
   * Internal tx at setup
   * @returns
   */
  mintCounterNFT = async (utxo: UTxO) => {
    const scriptCbor = this.catConstant.scripts.counter.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");

    const utxos = await this.wallet.getUtxos();
    const paramUtxo = utxos[0]!;
    console.log(paramUtxo);

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          utxo.input.txHash,
          utxo.input.outputIndex,
          utxo.output.amount,
          utxo.output.address
        )
        .mintPlutusScriptV3()
        .mint("1", policyId, "")
        .mintingScript(scriptCbor)
        .mintRedeemerValue(rMint, "JSON")
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  /**
   *
   * @param utxo
   * @param admins A list of pubKeyHash of the new admins
   * @param adminTenure
   * @param multiSigThreshold
   * @returns
   */
  mintSpendOracleNFT = async (
    utxo: UTxO,
    admins: string[],
    adminTenure: string,
    multiSigThreshold: number
  ) => {
    const scriptCbor = this.catConstant.scripts.oracle.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const oracleAddress = this.catConstant.scripts.oracle.spend.address;

    const utxos = await this.wallet.getUtxos();
    const paramUtxo = utxos[0]!;
    console.log(paramUtxo);

    const newOracleDatum: OracleDatum = oracleDatum(
      admins,
      adminTenure,
      multiSigThreshold,
      this.catConstant.scripts
    );

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          utxo.input.txHash,
          utxo.input.outputIndex,
          utxo.output.amount,
          utxo.output.address
        )
        .mintPlutusScriptV3()
        .mint("1", policyId, "")
        .mintingScript(scriptCbor)
        .mintRedeemerValue(rMint, "JSON")
        .txOut(oracleAddress, [{ unit: policyId, quantity: "1" }])
        .txOutInlineDatumValue(newOracleDatum, "JSON")
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  /**
   * Internal tx at setup
   * @returns
   */
  spendCounterNFT = async (utxo: UTxO) => {
    const scriptCbor = this.catConstant.scripts.counter.mint.cbor;
    const policyId = resolveScriptHash(scriptCbor, "V3");
    const counterAddress = this.catConstant.scripts.counter.spend.address;
    const couterInlineDatum = counterDatum(0);

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .txIn(
          utxo.input.txHash,
          utxo.input.outputIndex,
          utxo.output.amount,
          utxo.output.address
        )

        .txOut(counterAddress, [{ unit: policyId, quantity: "1" }])
        .txOutInlineDatumValue(couterInlineDatum, "JSON")
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  /**
   * Internal tx at setup
   * @returns
   */
  registerAllCerts = async () => {
    const treasuryWithdraw = this.catConstant.scripts.treasury.withdraw.address;

    const txBuilder = await this.newValidationTx();
    try {
      const unsignedTx = await txBuilder
        .registerStakeCertificate(treasuryWithdraw)
        .complete();

      const signedTx = await this.wallet.signTx(unsignedTx, true);
      const txHash = await this.wallet.submitTx(signedTx);

      return txHash;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  /**
   *
   * @param address The address txOutReferenceScript sends to in bech32
   * @param scriptType The type of script transaction to submit
   * @returns
   */
  txOutScript = async (address: string, scriptType: ScriptType) => {
    const txBuilder = await this.newValidationTx();
    try {
      let txHash;
      switch (scriptType) {
        case ScriptType.MembershipIntent: {
          const unsignedTx = await txBuilder
            .txOut(address, [])
            .txOutReferenceScript(
              this.catConstant.scripts.membershipIntent.mint.cbor
            )
            .txOut(address, [])
            .txOutReferenceScript(
              this.catConstant.scripts.membershipIntent.spend.cbor
            )
            .complete();
          const signedTx = await this.wallet.signTx(unsignedTx, true);
          txHash = await this.wallet.submitTx(signedTx);
          break;
        }
        case ScriptType.Member: {
          const unsignedTx = await txBuilder
            .txOut(address, [])
            .txOutReferenceScript(this.catConstant.scripts.member.mint.cbor)
            .txOut(address, [])
            .txOutReferenceScript(this.catConstant.scripts.member.spend.cbor)
            .complete();
          const signedTx = await this.wallet.signTx(unsignedTx, true);
          txHash = await this.wallet.submitTx(signedTx);
          break;
        }
        case ScriptType.ProposeIntent: {
          const unsignedTx = await txBuilder
            .txOut(address, [])
            .txOutReferenceScript(
              this.catConstant.scripts.proposeIntent.mint.cbor
            )
            .txOut(address, [])
            .txOutReferenceScript(
              this.catConstant.scripts.proposeIntent.spend.cbor
            )
            .complete();
          const signedTx = await this.wallet.signTx(unsignedTx, true);
          txHash = await this.wallet.submitTx(signedTx);
          break;
        }
        case ScriptType.Proposal: {
          const unsignedTx = await txBuilder
            .txOut(address, [])
            .txOutReferenceScript(this.catConstant.scripts.proposal.mint.cbor)
            .txOut(address, [])
            .txOutReferenceScript(this.catConstant.scripts.proposal.spend.cbor)
            .complete();
          const signedTx = await this.wallet.signTx(unsignedTx, true);
          txHash = await this.wallet.submitTx(signedTx);
          break;
        }
        case ScriptType.SignOffApproval: {
          const unsignedTx = await txBuilder
            .txOut(address, [])
            .txOutReferenceScript(
              this.catConstant.scripts.signOffApproval.mint.cbor
            )
            .txOut(address, [])
            .txOutReferenceScript(
              this.catConstant.scripts.signOffApproval.spend.cbor
            )
            .complete();
          const signedTx = await this.wallet.signTx(unsignedTx, true);
          txHash = await this.wallet.submitTx(signedTx);
          break;
        }
        case ScriptType.Treasury:
        default: {
          const unsignedTx = await txBuilder
            .txOut(address, [])
            .txOutReferenceScript(this.catConstant.scripts.treasury.spend.cbor)
            .txOut(address, [])
            .txOutReferenceScript(
              this.catConstant.scripts.treasury.withdraw.cbor
            )
            .complete();
          const signedTx = await this.wallet.signTx(unsignedTx, true);
          txHash = await this.wallet.submitTx(signedTx);
          break;
        }
      }
      return { [scriptType]: txHash };
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
}
