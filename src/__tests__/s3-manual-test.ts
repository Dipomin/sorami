/**
 * Script de Test Manuel S3
 * 
 * Exécuter avec: node -r esbuild-register src/__tests__/s3-manual-test.ts
 * Ou: ts-node src/__tests__/s3-manual-test.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const USER_ID = process.env.USER_ID || '';

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

async function runTest(name: string, testFn: () => Promise<void>) {
  const start = Date.now();
  log('🧪', `Testing: ${name}`);
  
  try {
    await testFn();
    const duration = Date.now() - start;
    results.push({ name, success: true, message: 'Passed', duration });
    log('✅', `PASS (${duration}ms)`);
  } catch (error: any) {
    const duration = Date.now() - start;
    results.push({ name, success: false, message: error.message, duration });
    log('❌', `FAIL: ${error.message}`);
  }
  console.log('');
}

// Tests
async function testListFiles() {
  const response = await fetch(`${API_URL}/api/files/list?contentType=image`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.files || !Array.isArray(data.files)) {
    throw new Error('Response should have files array');
  }

  log('ℹ️ ', `Found ${data.files.length} files`);
}

async function testListFilesWithoutAuth() {
  const response = await fetch(`${API_URL}/api/files/list?contentType=image`);

  if (response.status !== 401) {
    throw new Error(`Expected 401 Unauthorized, got ${response.status}`);
  }

  log('ℹ️ ', 'Auth required correctly enforced');
}

async function testPresignedUrlUnauthorized() {
  const otherUserKey = 'user_other123/images/test.png';

  const response = await fetch(`${API_URL}/api/files/presigned-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      s3Key: otherUserKey,
      expiresIn: 3600,
    }),
  });

  if (response.status !== 403) {
    throw new Error(`Expected 403 Forbidden, got ${response.status}`);
  }

  log('ℹ️ ', 'Ownership check passed');
}

async function testDeleteUnauthorized() {
  const otherUserKey = 'user_other123/images/test.png';

  const response = await fetch(`${API_URL}/api/files/delete`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      s3Key: otherUserKey,
    }),
  });

  if (response.status !== 403) {
    throw new Error(`Expected 403 Forbidden, got ${response.status}`);
  }

  log('ℹ️ ', 'Delete ownership check passed');
}

async function testAuthHelpers() {
  const response = await fetch(`${API_URL}/api/test-auth-helpers`);

  if (response.status === 404) {
    log('ℹ️ ', 'Test auth page not created yet (expected)');
    return;
  }

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  log('ℹ️ ', 'Auth helpers working');
}

// Main
async function main() {
  console.log('');
  log('🚀', 'Starting S3 Integration Tests');
  console.log('='.repeat(60));
  console.log('');

  // Check prerequisites
  if (!AUTH_TOKEN) {
    log('❌', 'AUTH_TOKEN not set');
    log('ℹ️ ', 'Get token from DevTools → Application → Cookies → __session');
    process.exit(1);
  }

  log('✅', 'Auth token set');
  log('ℹ️ ', `API URL: ${API_URL}`);
  log('ℹ️ ', `User ID: ${USER_ID || 'Not set'}`);
  console.log('');

  // Run tests
  await runTest('List files with auth', testListFiles);
  await runTest('List files without auth (should fail)', testListFilesWithoutAuth);
  await runTest('Presigned URL unauthorized access (should fail)', testPresignedUrlUnauthorized);
  await runTest('Delete unauthorized file (should fail)', testDeleteUnauthorized);
  await runTest('Auth helpers endpoint', testAuthHelpers);

  // Summary
  console.log('');
  console.log('='.repeat(60));
  log('📊', 'Test Summary');
  console.log('='.repeat(60));
  console.log('');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const duration = `${result.duration}ms`;
    console.log(`${icon} ${result.name.padEnd(50)} ${duration.padStart(8)}`);
    if (!result.success) {
      console.log(`   └─ ${result.message}`);
    }
  });

  console.log('');
  log('📈', `Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('');
    log('❌', 'Some tests failed!');
    process.exit(1);
  } else {
    console.log('');
    log('✅', 'All tests passed!');
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('');
    log('💥', 'Fatal error:');
    console.error(error);
    process.exit(1);
  });
}

export { main as runS3Tests };
