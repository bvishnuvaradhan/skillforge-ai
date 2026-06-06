const fs = require('fs');
const path = require('path');

const testDir = path.resolve(__dirname, 'test');

async function run() {
  console.log('Running backend tests...');

  if (!fs.existsSync(testDir)) {
    console.error('No test directory found:', testDir);
    process.exitCode = 1;
    return;
  }

  const files = fs.readdirSync(testDir).filter(f => f.endsWith('.js') && !f.includes('k6'));
  for (const file of files) {
    const full = path.join(testDir, file);
    console.log('->', file);
    try {
      require(full);
    } catch (err) {
      console.error('Test file failed:', file, err);
      process.exitCode = 1;
    }
  }

  console.log('Backend tests finished');
}

run();
