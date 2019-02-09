const { execSync } = require('child_process')

process.env['NODE_ENV'] = 'test';

execSync(
  'npx babel utilities.js --out-file compiled/utilities.js && ' +
  'npx babel tests/test_util.js --out-file compiled/test_util.js && ' +
  'npx babel models/writingWorkshop.js --out-file compiled/writingWorkshop.js'
)

process.exit()