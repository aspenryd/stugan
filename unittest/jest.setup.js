const fs = require('fs');
const path = require('path');

// Path to the script to be tested
const scriptPath = path.resolve(__dirname, '../webfiles/core.js');

// Read the script file
let scriptCode = fs.readFileSync(scriptPath, 'utf8');

// This is a workaround for JSDOM environments where 'const' at the top level
// of a script doesn't attach to the global object. We are explicitly assigning
// GameCore to the global scope so it's available in all test files.
scriptCode = scriptCode.replace(/^const GameCore\s*=\s*/, 'global.GameCore = ');

// Using eval to execute the script in the global scope of the test runner.
// This makes GameCore available to all test suites.
eval(scriptCode);
