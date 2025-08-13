const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Path to the script to be tested
const scriptPath = path.resolve(__dirname, '../webfiles/core.js');

// Read the script file
const scriptCode = fs.readFileSync(scriptPath, 'utf8');

// Execute the script in the current JSDOM global context.
// This will attach GameCore to the window object in the test environment.
vm.runInThisContext(scriptCode);
