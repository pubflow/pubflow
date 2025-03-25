// test/node.js
const { PubFlow } = require('../dist/index.js');

// Create a PubFlow client
const client = new PubFlow({
  baseUrl: 'https://api.example.com',
  debug: true
});

// Log the detected runtime
console.log('Detected runtime:', client.runtime);

// Test storage
async function testStorage() {
  try {
    await client.auth.getSession();
    console.log('Storage test passed');
  } catch (error) {
    console.error('Storage test failed:', error);
  }
}

// Test HTTP client
async function testHttp() {
  try {
    // This will fail but we're just testing that the HTTP client works
    await client.auth.validateSession();
  } catch (error) {
    console.log('HTTP client test completed (expected error):', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('Running Node.js runtime tests...');
  await testStorage();
  await testHttp();
  console.log('Tests completed');
}

runTests();