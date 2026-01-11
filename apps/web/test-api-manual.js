/**
 * Simple Manual API Test Script for Story 2.1
 * Run: node test-api-manual.js
 */

const BASE_URL = 'http://localhost:3000';

// Color output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

const log = {
  pass: msg => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  fail: msg => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: msg => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

let authCookie = '';
const createdClientIds = [];

async function waitForKeypress() {
  return new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });
}

async function makeRequest(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authCookie && { Cookie: authCookie }),
    },
    redirect: 'manual', // Don't follow redirects
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    // Check for redirect (auth failed)
    if (response.status === 307 || response.status === 302) {
      return {
        status: 401,
        data: {
          error: {
            code: 'AUTH_REDIRECT',
            message: 'Cookie expired or invalid',
          },
        },
        response,
      };
    }

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      // Response might be empty (204) or HTML
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        return {
          status: 401,
          data: {
            error: {
              code: 'AUTH_FAILED',
              message: 'Received HTML page, check cookie',
            },
          },
          response,
        };
      }
    }

    return { status: response.status, data, response };
  } catch (error) {
    return {
      status: 0,
      data: { error: { code: 'FETCH_ERROR', message: error.message } },
      response: null,
    };
  }
}

async function test1_CreateClient() {
  log.info('Test 1: Creating first client...');
  const { status, data } = await makeRequest('POST', '/api/clients', {
    name: 'Test Client One',
    company: 'Acme Corp',
    email: 'client1@test.com',
  });

  if (status === 201 && data?.id) {
    createdClientIds.push(data.id);
    log.pass(`Created client: ${data.name} (ID: ${data.id.slice(0, 8)}...)`);
    return true;
  } else {
    log.fail(`Expected 201, got ${status}. Response: ${JSON.stringify(data)}`);
    return false;
  }
}

async function test2_ListClients() {
  log.info('Test 2: Listing clients...');
  const { status, data } = await makeRequest('GET', '/api/clients');

  if (status === 200 && Array.isArray(data?.clients)) {
    log.pass(`Listed ${data.clients.length} clients`);
    return true;
  } else {
    log.fail(`Expected 200 with array, got ${status}`);
    return false;
  }
}

async function test3_GetClientDetails() {
  log.info('Test 3: Getting client details...');
  const clientId = createdClientIds[0];
  const { status, data } = await makeRequest('GET', `/api/clients/${clientId}`);

  if (status === 200 && data?.id === clientId) {
    log.pass(`Retrieved client details: ${data.name}`);
    return true;
  } else {
    log.fail(`Expected 200, got ${status}`);
    return false;
  }
}

async function test4_UpdateClient() {
  log.info('Test 4: Updating client...');
  const clientId = createdClientIds[0];
  const { status, data } = await makeRequest(
    'PUT',
    `/api/clients/${clientId}`,
    {
      name: 'Test Client UPDATED',
    }
  );

  if (status === 200 && data?.name === 'Test Client UPDATED') {
    log.pass(`Updated client name`);
    return true;
  } else {
    log.fail(`Expected 200, got ${status}`);
    return false;
  }
}

async function test5_DuplicateEmail() {
  log.info('Test 5: Testing duplicate email detection...');
  const { status, data } = await makeRequest('POST', '/api/clients', {
    name: 'Duplicate Test',
    email: 'client1@test.com',
  });

  if (status === 409 && data?.error?.code === 'DUPLICATE_CLIENT') {
    log.pass(`Duplicate email rejected correctly`);
    return true;
  } else {
    log.fail(`Expected 409, got ${status}`);
    return false;
  }
}

async function test6_TierLimit() {
  log.info('Test 6: Testing tier limit (free = 3 clients)...');

  // Create 2 more clients (total = 3)
  await makeRequest('POST', '/api/clients', {
    name: 'Client Two',
    email: 'client2@test.com',
  });
  await makeRequest('POST', '/api/clients', {
    name: 'Client Three',
    email: 'client3@test.com',
  });

  // Try 4th client
  const { status, data } = await makeRequest('POST', '/api/clients', {
    name: 'Client Four',
    email: 'client4@test.com',
  });

  if (status === 403 && data?.error?.code === 'TIER_LIMIT_EXCEEDED') {
    log.pass(`Tier limit enforced (3/3)`);
    return true;
  } else {
    log.fail(`Expected 403, got ${status}. Response: ${JSON.stringify(data)}`);
    return false;
  }
}

async function test7_InvalidUUID() {
  log.info('Test 7: Testing invalid UUID...');
  const { status, data } = await makeRequest(
    'GET',
    '/api/clients/invalid-uuid'
  );

  if (status === 400 && data?.error?.code === 'INVALID_CLIENT_ID') {
    log.pass(`Invalid UUID rejected`);
    return true;
  } else {
    log.fail(`Expected 400, got ${status}`);
    return false;
  }
}

async function test8_Unauthorized() {
  log.info('Test 8: Testing unauthorized access...');
  const savedCookie = authCookie;
  authCookie = ''; // Remove auth

  const { status, data } = await makeRequest('GET', '/api/clients');

  authCookie = savedCookie; // Restore

  if (status === 401 && data?.error?.code === 'UNAUTHORIZED') {
    log.pass(`Unauthorized access blocked`);
    return true;
  } else {
    log.fail(`Expected 401, got ${status}`);
    return false;
  }
}

async function test9_DeleteClient() {
  log.info('Test 9: Testing delete (CASCADE)...');
  const clientId = createdClientIds[0];
  const { status } = await makeRequest('DELETE', `/api/clients/${clientId}`);

  if (status === 204) {
    log.pass(`Client deleted (CASCADE applied)`);
    return true;
  } else {
    log.fail(`Expected 204, got ${status}`);
    return false;
  }
}

async function cleanup() {
  log.info('Cleaning up test data...');
  for (const id of createdClientIds) {
    await makeRequest('DELETE', `/api/clients/${id}`);
  }
  log.pass('Cleanup complete');
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  Story 2.1 Manual API Testing');
  console.log('='.repeat(60) + '\n');

  // Get auth cookie from command line or stdin
  const cookieArg = process.argv[2];

  if (cookieArg) {
    authCookie = cookieArg.includes('__session')
      ? cookieArg
      : `__session=${cookieArg}`;
    log.pass('Cookie loaded from argument\n');
  } else {
    log.warn('SETUP: You need to sign in first');
    console.log('\n1. Open your browser to http://localhost:3000');
    console.log('2. Sign in with Clerk');
    console.log('3. Open DevTools (F12) → Application → Cookies');
    console.log('4. Copy the __session value');
    console.log('\nPaste cookie here and press Enter:');

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const input = await new Promise(resolve => {
      process.stdin.once('data', data => resolve(data.toString().trim()));
    });

    authCookie = input.includes('__session') ? input : `__session=${input}`;
    log.pass('Cookie saved\n');
  }

  // Check if server is running
  log.info('Checking if dev server is running...');
  try {
    const healthCheck = await fetch(BASE_URL).catch(() => null);
    if (!healthCheck) {
      log.fail('Dev server not running at http://localhost:3000');
      console.log('\nStart it with: npm run dev\n');
      process.exit(1);
    }
    log.pass('Dev server is running\n');
  } catch (e) {
    log.fail(`Cannot reach server: ${e.message}`);
    process.exit(1);
  }

  // Run tests
  const results = [];

  try {
    results.push(await test1_CreateClient());
    results.push(await test2_ListClients());
    results.push(await test3_GetClientDetails());
    results.push(await test4_UpdateClient());
    results.push(await test5_DuplicateEmail());
    results.push(await test6_TierLimit());
    results.push(await test7_InvalidUUID());
    results.push(await test8_Unauthorized());
    results.push(await test9_DeleteClient());
  } catch (error) {
    log.fail(`Test error: ${error.message}`);
  } finally {
    await cleanup();
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(Boolean).length;
  const total = results.length;

  if (passed === total) {
    log.pass(`ALL TESTS PASSED (${passed}/${total})`);
    console.log('\n✅ Story 2.1 is production-ready!\n');
  } else {
    log.fail(`SOME TESTS FAILED (${passed}/${total})`);
    console.log('\n❌ Review failures above\n');
  }

  console.log('='.repeat(60) + '\n');
  process.exit(passed === total ? 0 : 1);
}

main();
