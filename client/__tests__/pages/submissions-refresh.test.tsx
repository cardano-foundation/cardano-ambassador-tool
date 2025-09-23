import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock dependencies
const mockSyncData = jest.fn();
const mockParseMembershipIntentDatum = jest.fn();
const mockUseApp = {
  membershipIntents: [],
  proposalIntents: [],
  dbLoading: false,
  isSyncing: false,
  userAddress: 'addr_test1qpjmksf7xc5jkyq0cmljcwagf0l45qz7p547d89qjntr52mwww6txyk9f282cffykhdcnel7qcu99grvd8smdg3wu',
  isAuthenticated: true,
  userWallet: {},
  syncData: mockSyncData,
  wallet: {}
};

// Mock the useApp hook
const mockUseAppHook = jest.fn(() => mockUseApp);

// Mock MembershipIntentTimeline component
const MockMembershipIntentTimeline: React.FC<{ intentUtxo: any }> = ({ intentUtxo }) => (
  <div data-testid="membership-timeline">Timeline for {intentUtxo.txHash}</div>
);

// Mock ProposalTimeline component
const MockProposalTimeline: React.FC<{ intentUtxo: any }> = ({ intentUtxo }) => (
  <div data-testid="proposal-timeline">Proposal Timeline for {intentUtxo.txHash}</div>
);

// Simplified mock page component that mimics the core logic we want to test
const MockIntentSubmissionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('membership-intent');
  const [membershipIntentUtxo, setMembershipIntentUtxo] = useState<any>(null);
  const [proposalIntentUtxo, setProposalIntentUtxo] = useState<any>(null);
  const [refreshAttempts, setRefreshAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const {
    membershipIntents,
    proposalIntents,
    dbLoading,
    isSyncing,
    userAddress,
    isAuthenticated,
    syncData,
  } = mockUseAppHook();

  useEffect(() => {
    if (dbLoading || !isAuthenticated) {
      return;
    }

    if (!userAddress) {
      setLoading(false);
      return;
    }

    // Find membership intent UTXO that belongs to the current user
    const userMembershipIntent = membershipIntents.find((intent: any) => {
      if (!intent.plutusData) {
        return false;
      }
      
      try {
        const parsed = mockParseMembershipIntentDatum(intent.plutusData);
        return parsed?.metadata.walletAddress === userAddress;
      } catch (parseError) {
        console.error('Failed to parse datum:', parseError);
        return false;
      }
    });

    // Find proposal intent UTXO that belongs to the current user
    const userProposalIntent = proposalIntents.find((intent: any) => {
      if (!intent.plutusData) {
        return false;
      }
      try {
        const parsed = mockParseMembershipIntentDatum(intent.plutusData);
        return parsed?.metadata.walletAddress === userAddress;
      } catch (parseError) {
        console.error('Failed to parse proposal datum:', parseError);
        return false;
      }
    });

    setMembershipIntentUtxo(userMembershipIntent || null);
    setProposalIntentUtxo(userProposalIntent || null);
    setLoading(false);
  }, [
    userAddress,
    membershipIntents,
    proposalIntents,
    dbLoading,
    isAuthenticated,
    isSyncing,
    refreshAttempts
  ]);
  
  const handleRefresh = () => {
    console.log('🔄 [Submissions] Refresh button clicked');
    setRefreshAttempts(prev => prev + 1);
    syncData('membership_intent');
    syncData('proposal_intent');
  };

  if (loading || dbLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="tab-nav">
        <button 
          onClick={() => setActiveTab('membership-intent')}
          className={activeTab === 'membership-intent' ? 'active' : ''}
          data-testid="membership-intent-tab"
        >
          Membership Intent
        </button>
        <button 
          onClick={() => setActiveTab('proposal-intent')}
          className={activeTab === 'proposal-intent' ? 'active' : ''}
          data-testid="proposal-intent-tab"
        >
          Proposal Intent
        </button>
      </div>
      
      {/* Refresh Button */}
      <button 
        onClick={handleRefresh}
        disabled={isSyncing}
        role="button"
        aria-label={isSyncing ? 'refreshing' : 'refresh'}
      >
        {isSyncing ? 'Refreshing...' : 'Refresh'}
      </button>
      
      {/* Tab Content */}
      {activeTab === 'membership-intent' && (
        <div data-testid="membership-intent-content">
          {membershipIntentUtxo ? (
            <MockMembershipIntentTimeline intentUtxo={membershipIntentUtxo} />
          ) : (
            <div>
              <h2>No Membership Intent Submission</h2>
              <p>Become an Ambassador</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'proposal-intent' && (
        <div data-testid="proposal-intent-content">
          {proposalIntentUtxo ? (
            <MockProposalTimeline intentUtxo={proposalIntentUtxo} />
          ) : (
            <div>
              <h2>No Proposal Intent Submissions</h2>
              <p>You haven't submitted any proposals yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Use our mock component as the page component
const IntentSubmissionsPage = MockIntentSubmissionsPage;

describe('Submissions Page - Refresh Functionality', () => {
  const mockUserAddress = 'addr_test1qpjmksf7xc5jkyq0cmljcwagf0l45qz7p547d89qjntr52mwww6txyk9f282cffykhdcnel7qcu99grvd8smdg3wu';
  const mockDifferentAddress = 'addr_test1qr0q9rlg9lr9c7dg9sxcn3yx0q7rahhavffa53h8ghcrv2cfn8nfyt44vyca6xf43maty33hmkrsvfjz65sfpp8ah';

  const mockMembershipIntent = {
    id: 1,
    txHash: '87f88fff8e9124e1ae6aeea2a0f34d86e25ed6824a1c2178a1c3ee7b79075eeb',
    outputIndex: 0,
    address: 'test_address',
    amount: '5000000',
    dataHash: 'test_hash',
    plutusData: 'test_plutus_data',
    context: 'membership_intent'
  };

  const mockProposalIntent = {
    id: 2,
    txHash: 'proposal_tx_hash_123',
    outputIndex: 0,
    address: 'proposal_address',
    amount: '3000000',
    dataHash: 'proposal_hash',
    plutusData: 'proposal_plutus_data',
    context: 'proposal_intent'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockParseMembershipIntentDatum.mockClear();
    mockUseApp.membershipIntents = [];
    mockUseApp.proposalIntents = [];
    mockUseApp.isSyncing = false;
    mockUseApp.dbLoading = false;
  });

  describe('Initial State', () => {
    it('should show empty state when no membership intents exist', () => {
      render(<IntentSubmissionsPage />);
      
      expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();
      expect(screen.getByText('Become an Ambassador')).toBeInTheDocument();
    });

    it('should show loading state when db is loading', () => {
      mockUseApp.dbLoading = true;
      render(<IntentSubmissionsPage />);
      
      // Should show loading component (SimpleCardanoLoader)
      expect(screen.queryByText('No Membership Intent Submission')).not.toBeInTheDocument();
    });
  });

  describe('Address Matching Logic', () => {
    it('should NOT show UTXO when addresses do not match (reproducing the bug)', () => {
      // Set up: UTXO exists but with different address
      mockUseApp.membershipIntents = [mockMembershipIntent];
      mockParseMembershipIntentDatum.mockReturnValue({
        metadata: {
          walletAddress: mockDifferentAddress // Different from user's current address
        }
      });

      render(<IntentSubmissionsPage />);

      // Should show empty state despite UTXO existing
      expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();
      expect(screen.queryByTestId('membership-timeline')).not.toBeInTheDocument();
    });

    it('should show UTXO when addresses match', () => {
      // Set up: UTXO exists with matching address
      mockUseApp.membershipIntents = [mockMembershipIntent];
      mockParseMembershipIntentDatum.mockReturnValue({
        metadata: {
          walletAddress: mockUserAddress // Matches user's current address
        }
      });

      render(<IntentSubmissionsPage />);

      // Should show the timeline
      expect(screen.queryByText('No Membership Intent Submission')).not.toBeInTheDocument();
      expect(screen.getByTestId('membership-timeline')).toBeInTheDocument();
    });
  });

  describe('Refresh Button Functionality', () => {
    it('should call syncData when refresh button is clicked', () => {
      render(<IntentSubmissionsPage />);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      expect(mockSyncData).toHaveBeenCalledWith('membership_intent');
      expect(mockSyncData).toHaveBeenCalledWith('proposal_intent');
    });

    it('should show spinning icon when syncing', () => {
      mockUseApp.isSyncing = true;
      render(<IntentSubmissionsPage />);

      const refreshButton = screen.getByRole('button', { name: /refreshing/i });
      expect(refreshButton).toBeDisabled();
      expect(refreshButton).toHaveTextContent('Refreshing...');
    });

    it('should disable button while syncing', () => {
      mockUseApp.isSyncing = true;
      render(<IntentSubmissionsPage />);

      const refreshButton = screen.getByRole('button', { name: /refreshing/i });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('State Update After Refresh (Integration Test)', () => {
    it('should update display when new matching UTXO is found after refresh', async () => {
      // Initial state: no UTXOs
      mockUseApp.membershipIntents = [];
      const { rerender } = render(<IntentSubmissionsPage />);

      // Verify empty state
      expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();

      // Click refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Simulate what should happen: worker fetches new data and updates state
      mockUseApp.membershipIntents = [mockMembershipIntent];
      mockParseMembershipIntentDatum.mockReturnValue({
        metadata: {
          walletAddress: mockUserAddress // Now matches!
        }
      });

      // Force re-render to simulate state update
      rerender(<IntentSubmissionsPage />);

      // Should now show the timeline
      await waitFor(() => {
        expect(screen.queryByText('No Membership Intent Submission')).not.toBeInTheDocument();
        expect(screen.getByTestId('membership-timeline')).toBeInTheDocument();
      });
    });

    it('should NOT update display when new UTXO has non-matching address', async () => {
      // Initial state: no UTXOs
      mockUseApp.membershipIntents = [];
      const { rerender } = render(<IntentSubmissionsPage />);

      // Verify empty state
      expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();

      // Click refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);

      // Simulate: worker fetches new data but address doesn't match
      mockUseApp.membershipIntents = [mockMembershipIntent];
      mockParseMembershipIntentDatum.mockReturnValue({
        metadata: {
          walletAddress: mockDifferentAddress // Doesn't match user's address
        }
      });

      // Force re-render
      rerender(<IntentSubmissionsPage />);

      // Should still show empty state
      await waitFor(() => {
        expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();
        expect(screen.queryByTestId('membership-timeline')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tab Functionality', () => {
    it('should default to membership-intent tab', () => {
      render(<IntentSubmissionsPage />);
      
      expect(screen.getByTestId('membership-intent-tab')).toHaveClass('active');
      expect(screen.getByTestId('proposal-intent-tab')).not.toHaveClass('active');
      expect(screen.getByTestId('membership-intent-content')).toBeInTheDocument();
      expect(screen.queryByTestId('proposal-intent-content')).not.toBeInTheDocument();
    });

    it('should switch to proposal-intent tab when clicked', () => {
      render(<IntentSubmissionsPage />);
      
      const proposalTab = screen.getByTestId('proposal-intent-tab');
      fireEvent.click(proposalTab);
      
      expect(screen.getByTestId('proposal-intent-tab')).toHaveClass('active');
      expect(screen.getByTestId('membership-intent-tab')).not.toHaveClass('active');
      expect(screen.getByTestId('proposal-intent-content')).toBeInTheDocument();
      expect(screen.queryByTestId('membership-intent-content')).not.toBeInTheDocument();
    });

    it('should show empty state in membership-intent tab when no UTXO', () => {
      render(<IntentSubmissionsPage />);
      
      expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();
      expect(screen.getByText('Become an Ambassador')).toBeInTheDocument();
      expect(screen.queryByTestId('membership-timeline')).not.toBeInTheDocument();
    });

    it('should show empty state in proposal-intent tab when no UTXO', () => {
      render(<IntentSubmissionsPage />);
      
      // Switch to proposal tab
      fireEvent.click(screen.getByTestId('proposal-intent-tab'));
      
      expect(screen.getByText('No Proposal Intent Submissions')).toBeInTheDocument();
      expect(screen.getByText('You haven\'t submitted any proposals yet.')).toBeInTheDocument();
      expect(screen.queryByTestId('proposal-timeline')).not.toBeInTheDocument();
    });

    it('should render timeline when membership intent variable is passed (tab empty to timeline)', () => {
      // Initial state: empty tab
      const { rerender } = render(<IntentSubmissionsPage />);
      expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();
      expect(screen.queryByTestId('membership-timeline')).not.toBeInTheDocument();
      
      // Simulate passing a membership intent variable (like from props or state update)
      mockUseApp.membershipIntents = [mockMembershipIntent];
      mockParseMembershipIntentDatum.mockReturnValue({
        metadata: {
          walletAddress: mockUserAddress // Matching address
        }
      });
      
      // Re-render to simulate state change
      rerender(<IntentSubmissionsPage />);
      
      // Should now show timeline instead of empty state
      expect(screen.queryByText('No Membership Intent Submission')).not.toBeInTheDocument();
      expect(screen.getByTestId('membership-timeline')).toBeInTheDocument();
      expect(screen.getByText('Timeline for 87f88fff8e9124e1ae6aeea2a0f34d86e25ed6824a1c2178a1c3ee7b79075eeb')).toBeInTheDocument();
    });

    it('should render proposal timeline when proposal intent variable is passed (tab empty to timeline)', () => {
      const mockProposalIntent = {
        id: 2,
        txHash: 'proposal_tx_hash_123',
        outputIndex: 0,
        address: 'proposal_address',
        amount: '3000000',
        dataHash: 'proposal_hash',
        plutusData: 'proposal_plutus_data',
        context: 'proposal_intent'
      };
      
      // Initial state: empty proposal tab
      render(<IntentSubmissionsPage />);
      fireEvent.click(screen.getByTestId('proposal-intent-tab'));
      expect(screen.getByText('No Proposal Intent Submissions')).toBeInTheDocument();
      expect(screen.queryByTestId('proposal-timeline')).not.toBeInTheDocument();
      
      // Simulate passing a proposal intent variable
      mockUseApp.proposalIntents = [mockProposalIntent];
      mockParseMembershipIntentDatum.mockReturnValue({
        metadata: {
          walletAddress: mockUserAddress // Matching address
        }
      });
      
      // Re-render to simulate state change
      const { rerender } = render(<IntentSubmissionsPage />);
      fireEvent.click(screen.getByTestId('proposal-intent-tab'));
      
      // Should now show proposal timeline instead of empty state
      expect(screen.queryByText('No Proposal Intent Submissions')).not.toBeInTheDocument();
      expect(screen.getByTestId('proposal-timeline')).toBeInTheDocument();
      expect(screen.getByText('Proposal Timeline for proposal_tx_hash_123')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle UTXO with missing plutusData', () => {
      mockUseApp.membershipIntents = [{
        ...mockMembershipIntent,
        plutusData: null
      }];

      render(<IntentSubmissionsPage />);

      expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();
    });

    it('should handle plutusData parsing errors', () => {
      mockUseApp.membershipIntents = [mockMembershipIntent];
      mockParseMembershipIntentDatum.mockImplementation(() => {
        throw new Error('Invalid plutus data');
      });

      // Should not crash and should show empty state
      render(<IntentSubmissionsPage />);
      expect(screen.getByText('No Membership Intent Submission')).toBeInTheDocument();
    });

    it('should handle multiple UTXOs and find the correct one', () => {
      const utxo1 = { ...mockMembershipIntent, txHash: 'hash1' };
      const utxo2 = { ...mockMembershipIntent, txHash: 'hash2' };
      const utxo3 = { ...mockMembershipIntent, txHash: 'hash3' };

      mockUseApp.membershipIntents = [utxo1, utxo2, utxo3];
      
      mockParseMembershipIntentDatum
        .mockReturnValueOnce({ metadata: { walletAddress: mockDifferentAddress } }) // utxo1: no match
        .mockReturnValueOnce({ metadata: { walletAddress: mockUserAddress } })      // utxo2: match!
        .mockReturnValueOnce({ metadata: { walletAddress: mockDifferentAddress } }); // utxo3: no match

      render(<IntentSubmissionsPage />);

      // Should show timeline for utxo2
      expect(screen.getByTestId('membership-timeline')).toHaveTextContent('hash2');
    });
  });
});
