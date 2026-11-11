// Simple test script to check if localhost:5174 is working
import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5174,
  path: '/',
  method: 'GET',
  timeout: 5000,
};

console.log('Testing http://localhost:5174/ ...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n=== Response Body (first 1000 chars) ===');
    console.log(data.substring(0, 1000));
    
    // Check for our markers
    if (data.includes('__APP_MOUNTED__')) {
      console.log('\n✅ Found __APP_MOUNTED__ flag');
    } else {
      console.log('\n❌ __APP_MOUNTED__ flag NOT found');
    }
    
    if (data.includes('Safety Net')) {
      console.log('✅ Found Safety Net script');
    } else {
      console.log('❌ Safety Net script NOT found');
    }
    
    if (data.includes('createTimeoutFetch')) {
      console.log('✅ Code contains timeout wrapper (but this is in JS module)');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request failed: ${e.message}`);
});

req.on('timeout', () => {
  console.error('❌ Request timed out after 5 seconds');
  req.destroy();
});

req.end();
