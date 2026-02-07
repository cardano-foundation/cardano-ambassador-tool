# 🔐 Admin Guide

This guide is for administrators managing the Cardano Ambassador program.

## Quick Overview

As an admin, you have access to:

- 👥 **Membership Applications** - Review and approve/reject new member applications
- 📝 **Proposal Applications** - Review and approve/reject funding proposals
- 💰 **Treasury Sign-offs** - Multi-signature approval for treasury transactions
- ⚙️ **System Configuration** - Manage minimum required signers

## ⚙️ System Configuration {#system-configuration}

### Minimum Required Signers

The minimum required signers setting determines how many admin signatures are needed to approve decisions.

**How to Set:**

1. Navigate to the admin settings (configured via oracle/smart contract)
2. Set the `minSigners` value
3. This affects all future approval processes

**Important:** 
- Must be ≤ total number of admins
- Higher values = more security, but slower approval process
- Lower values = faster approvals, but less decentralization

> ⚠️ **Note:** Changes to minimum signers only affect new submissions, not pending ones.

## 👥 Managing Membership Applications {#managing-membership-applications}

### Viewing Applications

Navigate to `Manage` → `Membership Applications`

You'll see:
- **Pending Applications** - Awaiting admin decision
- **Approved Applications** - Fully signed and approved
- **Rejected Applications** - Declined by admins

### Reviewing an Application

**Step 1: View Application Details**

Click on any pending application to see:
- Applicant information (name, email, bio, etc.)
- NFT token being used
- Submission timestamp
- Current signature status

**Step 2: Make or Second a Decision**

**If you're the first admin to review:**
- Click `Approve` or `Reject` to make the initial decision
- Sign the transaction in your wallet

**If another admin has already made a decision:**
- You can only **second** their decision (approve or reject)
- You cannot make a different decision
- Sign to add your signature to the existing decision

**Step 3: Multi-Signature Process**

- The first signature sets the decision (approve or reject)
- Subsequent signatures second that decision
- Once minimum signatures are reached, the decision is finalized
- The applicant is notified of the outcome

### Signature Progress Tracking

For each application, you can see:
- ✅ **Admins who have signed**
- ⏳ **Admins who haven't signed yet**
- 📊 **Progress bar** showing X of Y signatures
- 🎯 **Current decision** (Approve or Reject)

> ⚠️ **Important:** The first signer determines whether the application is approved or rejected. All subsequent signers can only second that decision.

## 📝 Managing Proposal Applications {#managing-proposal-applications}

### Viewing Proposals

Navigate to `Manage` → `Proposal Applications`

Similar to membership applications, you'll see:
- Pending proposals awaiting review
- Approved proposals (fully signed)
- Rejected proposals

### Reviewing a Proposal

**Step 1: View Proposal Details**

Click on a pending proposal to see:
- **Title & Description** - What the proposal is about
- **Funding Amount** - ADA requested (in lovelace)
- **Receiver Address** - Where funds will be sent
- **Proposer Information** - Who submitted it
- **Submission Date** - When it was created

**Step 2: Evaluate the Proposal**

Consider:
- Is the proposal aligned with program goals?
- Is the funding amount reasonable?
- Does the proposer have a good track record?
- Is the receiver address valid?

**Step 3: Make or Second a Decision**

**If you're the first admin to review:**
- Click `Approve` or `Reject` to make the initial decision
- Sign the transaction in your wallet

**If another admin has already made a decision:**
- You can only **second** their decision (approve or reject)
- You cannot make a different decision
- Sign to add your signature to the existing decision

> 💡 **Note:** The first signer sets the decision. All subsequent signers second that decision until minimum signatures are reached.

### Editing Restrictions

> ⚠️ **Important:** Once the first admin signs, the proposal cannot be edited by the proposer. This ensures integrity of the approval process.

## 💰 Treasury Sign-offs {#treasury-sign-offs}

### Understanding the Two-Step Treasury Process

When a proposal is approved, releasing funds from the treasury requires **two separate steps**:

1. **Initial Approval Sign-off** - A multi-signature process where admins approve the proposal for treasury withdrawal.
2. **Final Withdrawal Sign-off** - A single execution step where one admin triggers the actual fund release.

This process ensures that withdrawals are fully authorized by the required number of admins before funds can be moved.

---

### Step 1: Initial Approval Sign-off (Multi-Sig)

**Where:** Individual approved proposal page

**When:** After a proposal receives the minimum required approval signatures to be accepted.

**How to Access:**

1. Navigate to `Manage` → `Proposal Applications`
2. Click on an **approved** proposal
3. Scroll to the "Treasury Withdrawal Approval" section

**What to Do:**

- Review the proposal details one final time
- Verify the funding amount and receiver address
- Click `Sign for Treasury Withdrawal`
- Confirm the transaction in your wallet

**Purpose:** This step gathers the necessary admin signatures to authorize the withdrawal.

> 📝 **Note:** This requires the **minimum number of admin signatures** (defined in system config).

---

### Step 2: Final Withdrawal Sign-off (Single Execution)

**Where:** Treasury Sign-offs page

**When:** After the Initial Approval Sign-off has received the minimum required signatures.

**How to Access:**

1. Navigate to `Manage` → `Treasury Sign-offs`
2. Select a proposal that is "Ready for Withdrawal"

**What You'll See:**

- Proposal title and description
- Amount to be released (in ADA)
- Receiver address
- Verification that initial approval signatures are complete

**What to Do:**

1. **Review Carefully:**
   - Verify the receiver address is correct
   - Confirm the amount is correct

2. **Execute the Withdrawal:**
   - Click `Execute Final Signoff`
   - Review transaction details in your wallet
   - Confirm and sign

**Transaction Finalization:**
- This is a **single-signature transaction**.
- Once executed by any admin, the transaction is submitted to the blockchain.
- Funds are released to the receiver address.
- The proposal status is updated to "Completed".

---

### Summary: Complete Treasury Flow

1. ✅ **Proposal Approved** → Minimum admin signatures reached for the proposal itself.
2. 🔐 **Initial Sign-off** → Admins provide multi-sig approval for withdrawal (on proposal page).
3. 💰 **Final Step** → One admin executes the fund release (on treasury sign-offs page).
4. ✨ **Funds Released** → Transaction submitted instantly.

> ⚠️ **Important:** Ensure the Initial Sign-off has all required signatures before attempting the Final Withdrawal.

## 🔍 Admin Dashboard Features

### Filtering & Search

- **Filter by Status:** Pending, Approved, Rejected
- **Search:** Find applications/proposals by name, title, or address
- **Sort:** By date, status, or signature progress

### Bulk Actions

Currently not supported, but planned for future releases.

## 📊 Signature Tracking

### Understanding Signature Progress

For each decision (membership or proposal):

- **Required Signatures:** Minimum needed (set in system config)
- **Current Signatures:** How many admins have signed
- **Progress Bar:** Visual representation
- **Admin List:** Shows who has/hasn't signed

### Signature States

- ✅ **Signed** - Admin has approved/rejected
- ⏳ **Pending** - Admin hasn't signed yet
- 🔒 **Finalized** - Minimum signatures reached, decision is final

## ⚠️ Important Admin Guidelines

### Security Best Practices

- 🔐 **Never share your wallet seed phrase**
- 🔍 **Always verify transaction details before signing**
- ⏱️ **Review applications promptly to avoid delays**
- 💬 **Communicate with other admins for complex decisions**

### Decision Making

- ✅ **Be consistent** - Apply the same standards to all applications
- 🤝 **Collaborate** - Discuss complex cases with other admins
- ⚖️ **Be fair** - Evaluate based on merit, not personal bias

### Common Pitfalls

- ❌ **Don't sign without reviewing** - Always read the full application/proposal
- ❌ **Don't rush decisions** - Take time to evaluate properly
- ❌ **Don't ignore signature requests** - Delays affect the entire program
- ❌ **Don't approve invalid addresses** - Verify receiver addresses are correct

## 🆘 Troubleshooting

### "Transaction Failed"

**Possible causes:**
- Insufficient ADA in wallet for fees
- Network congestion
- Wallet connection lost

**Solution:**
- Ensure you have at least 5 ADA for fees
- Try again in a few minutes
- Reconnect your wallet

### "Signature Not Recorded"

**Possible causes:**
- Transaction not confirmed on-chain yet
- Browser cache issue

**Solution:**
- Wait 1-2 minutes and refresh the page
- Check transaction on Cardano explorer
- Clear browser cache if issue persists

### "Cannot See Pending Applications"

**Possible causes:**
- Not connected with admin wallet
- Admin status not synced

**Solution:**
- Ensure you're using the correct admin wallet
- Refresh the page
- Contact system administrator if issue persists

## 📞 Admin Support

For technical issues or questions:
- Contact the development team
- Check the GitHub repository for known issues
- Participate in admin discussions

---

**Remember:** As an admin, you play a crucial role in maintaining the integrity and quality of the Cardano Ambassador program. Your careful review and timely decisions help the community thrive! 🚀
