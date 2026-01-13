// e2e/storage.spec.ts
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST before any other imports
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading .env from:', envPath);
const result = config({ path: envPath });

if (result.error) {
  console.log('Failed to load .env.local, trying .env...');
  config({ path: resolve(process.cwd(), '.env') });
}

import { storageService } from '@/services/storageService';

(async () => {
  console.log('Starting E2E Storage Tests...\n')
  
  
  const testFilename = 'e2e-test-' + Date.now();
  const testSubfolder = 'e2e-tests';
  
  interface TestData {
    context: string;
    decision: string;
    signedTx: string;
    timestamp: string;
  }
  
  const testData: TestData = {
    context: 'E2ETestContext',
    decision: 'approve',
    signedTx: 'test-tx-hash-' + Date.now(),
    timestamp: new Date().toISOString(),
  };

  let testsPassed = 0;
  let testsFailed = 0;

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    try {
      await testFn();
      console.log(`${name} passed\n`);
      testsPassed++;
    } catch (error) {
      console.error(`${name} failed:`, error);
      testsFailed++;
    }
  };

  try {
    // Test 1: Save
    await runTest('Save data to S3', async () => {
      await storageService.save(testFilename, testData, testSubfolder);
      console.log('Data saved successfully');
    });

    // Test 2: Get
    await runTest('Retrieve data from S3', async () => {
      const retrieved = await storageService.get<TestData>(testFilename, testSubfolder);
      if (!retrieved) throw new Error('Retrieved data is null');
      console.log('Retrieved:', JSON.stringify(retrieved, null, 2));
      
      if (retrieved.context !== testData.context) {
        throw new Error('Context mismatch');
      }
      if (retrieved.decision !== testData.decision) {
        throw new Error('Decision mismatch');
      }
      console.log('Data matches expected values');
    });

    // Test 3: Exists
    await runTest('Check if file exists', async () => {
      const exists = await storageService.exists(testFilename, testSubfolder);
      if (!exists) throw new Error('File should exist but does not');
      console.log('File exists: true');
    });

    // Test 4: List
    await runTest('List files in subfolder', async () => {
      const files = await storageService.list(testSubfolder);
      console.log('Files found:', files.length);
      console.log('Files:', files);
      
      if (!files.includes(testFilename)) {
        throw new Error('Test file not found in list');
      }
      console.log('Test file found in list');
    });

    // Test 5: Get non-existent file
    await runTest('Get non-existent file (should return null)', async () => {
      const result = await storageService.get('non-existent-file-' + Date.now(), testSubfolder);
      if (result !== null) {
        throw new Error('Should return null for non-existent file');
      }
      console.log('Correctly returned null');
    });

    // // Test 6: Delete
    // await runTest('Delete file from S3', async () => {
    //   const deleted = await storageService.delete(testFilename, testSubfolder);
    //   if (!deleted) throw new Error('Delete operation failed');
    //   console.log('File deleted successfully');
    // });

    // // Test 7: Verify deletion
    // await runTest('Verify file is deleted', async () => {
    //   const stillExists = await storageService.exists(testFilename, testSubfolder);
    //   if (stillExists) throw new Error('File should not exist after deletion');
    //   console.log('File no longer exists: confirmed');
    // });

    // Summary
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);

    if (testsFailed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during E2E tests:', error);
    
    process.exit(1);
  }
})();