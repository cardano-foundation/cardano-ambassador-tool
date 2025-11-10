import { getMemberDatum, getMembershipIntentDatum, getProposalDatum } from '../utils';
import { UTxO } from '@meshsdk/core';

describe('Utils - Datum Parsing', () => {
  describe('getMemberDatum', () => {
    it('should parse valid member datum with all fields', () => {
      // Sample plutusData for a member with complete metadata
      const plutusData = 'd8799f9f581c0000000000000000000000000000000000000000000000000000000058200000000000000000000000000000000000000000000000000000000000000000ffa0001a000f4240d8799fd8799f581c70f1f370ff214b1da4aef679936f0b9c8d521c8c08900b34c6fa9d67ffd87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80ffffff';

      const mockUtxo: UTxO = {
        input: {
          outputIndex: 0,
          txHash: 'test-tx-hash',
        },
        output: {
          address: 'addr_test1234',
          amount: [{ unit: 'lovelace', quantity: '2000000' }],
          plutusData: plutusData,
        },
      };

      // This should not throw an error
      expect(() => getMemberDatum(mockUtxo)).not.toThrow();

      const result = getMemberDatum(mockUtxo);

      // Verify structure
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('completion');
      expect(result).toHaveProperty('fundReceived');
      expect(result).toHaveProperty('metadata');

      // Verify metadata has empty strings for undefined fields (not errors)
      expect(result.metadata).toHaveProperty('walletAddress');
      expect(result.metadata).toHaveProperty('fullName');
      expect(result.metadata).toHaveProperty('displayName');
      expect(result.metadata).toHaveProperty('emailAddress');
    });

    it('should handle datum with minimal metadata gracefully', () => {
      // Plutus data with some undefined/missing fields
      const plutusData = 'd8799f9f581c1234567890abcdef1234567890abcdef1234567890abcdef123456785820abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ffa0001a00000000d8799fd8799f581c70f1f370ff214b1da4aef679936f0b9c8d521c8c08900b34c6fa9d67ffd87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80ffffff';

      const mockUtxo: UTxO = {
        input: {
          outputIndex: 0,
          txHash: 'test-tx-hash',
        },
        output: {
          address: 'addr_test1234',
          amount: [{ unit: 'lovelace', quantity: '2000000' }],
          plutusData: plutusData,
        },
      };

      // Should handle undefined fields without crashing
      expect(() => getMemberDatum(mockUtxo)).not.toThrow();
    });
  });

  describe('getProposalDatum', () => {
    it('should parse valid proposal datum', () => {
      // Sample plutusData for a proposal
      const plutusData = 'd8799f1a000f4240d8799f581c70f1f370ff214b1da4aef679936f0b9c8d521c8c08900b34c6fa9d67ff001a00000064d8799f4d70726f6a6563742d7469746c654c68747470733a2f2f75726c49313030303030303030d8799f581c70f1f370ff214b1da4aef679936f0b9c8d521c8c08900b34c6fa9d67ffd8799f581c70f1f370ff214b1da4aef679936f0b9c8d521c8c08900b34c6fa9d67ff4770656e64696e67ffffff';

      const mockUtxo: UTxO = {
        input: {
          outputIndex: 0,
          txHash: 'test-tx-hash',
        },
        output: {
          address: 'addr_test1234',
          amount: [{ unit: 'lovelace', quantity: '2000000' }],
          plutusData: plutusData,
        },
      };

      expect(() => getProposalDatum(mockUtxo)).not.toThrow();

      const result = getProposalDatum(mockUtxo);

      expect(result).toHaveProperty('fundRequested');
      expect(result).toHaveProperty('receiver');
      expect(result).toHaveProperty('member');
      expect(result).toHaveProperty('metadata');
    });
  });

  describe('extractString edge cases', () => {
    it('should handle undefined fields in member metadata', () => {
      // This is a real-world scenario where some metadata fields might be undefined
      // The extractString function should return empty string instead of crashing
      const plutusData = 'd8799f9f581c0000000000000000000000000000000000000000000000000000000058200000000000000000000000000000000000000000000000000000000000000000ffa0001a000f4240d8799fd8799f581c70f1f370ff214b1da4aef679936f0b9c8d521c8c08900b34c6fa9d67ffd87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80d87a80ffffff';

      const mockUtxo: UTxO = {
        input: {
          outputIndex: 0,
          txHash: 'test-tx-hash',
        },
        output: {
          address: 'addr_test1234',
          amount: [{ unit: 'lovelace', quantity: '2000000' }],
          plutusData: plutusData,
        },
      };

      const result = getMemberDatum(mockUtxo);

      // These should be empty strings, not throw errors
      expect(typeof result.metadata.country).toBe('string');
      expect(typeof result.metadata.city).toBe('string');
      expect(typeof result.metadata.x_handle).toBe('string');
    });
  });
});

// Utility function to help you test with your own plutusData
export function testWithPlutusData(plutusData: string) {
  console.log('Testing with plutusData:', plutusData);

  const mockUtxo: UTxO = {
    input: {
      outputIndex: 0,
      txHash: 'test-tx-hash',
    },
    output: {
      address: 'addr_test1234',
      amount: [{ unit: 'lovelace', quantity: '2000000' }],
      plutusData: plutusData,
    },
  };

  try {
    const result = getMemberDatum(mockUtxo);
    console.log('✅ Successfully parsed member datum:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('❌ Failed to parse member datum:');
    console.error(error);
    throw error;
  }
}
