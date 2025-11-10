/**
 * Quick test example - just replace the plutusData and run!
 *
 * Usage: npx tsx test-example.ts
 */

import { testMemberDatum } from "./src/lib/test-utils";

// Replace this with your actual plutusData from the blockchain
const YOUR_PLUTUS_DATA =
  "d8799f9f581cc76c35088ac826c8a0e6947c8ff78d8d4495789bc729419b3a3343054b3232326667647373535353ffa000d8799fd8799fd8799f581cab44f916e940ef5233582b9e901359c806374a644b2a5a404171d589ffd8799fd8799fd8799f581c8dabad4a2faaa2c13312f16f0feb3af58b47025b717ac059f555648bffffffff4d57796e7465722047726168616d54526174696f6e652076656c6974207175697320715672697a656b7572406d61696c696e61746f722e636f6d53457374206572726f7220736564206561206578424b45474d6f6d62617361ffff";

// Just call the function!
try {
  // For testing Member datum:
  testMemberDatum(YOUR_PLUTUS_DATA);

  // For testing Proposal datum:
  // testProposalDatum(YOUR_PLUTUS_DATA);

  // For testing Membership Intent datum:
  // testMembershipIntentDatum(YOUR_PLUTUS_DATA);
} catch (error) {
  console.error("Failed:", error);
}
