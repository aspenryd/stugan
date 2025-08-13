const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Path to the script to be tested
const scriptPath = path.resolve(__dirname, '../webfiles/core.js');

// Read the script file
let scriptCode = fs.readFileSync(scriptPath, 'utf8');

// Modify the script to attach GameCore to the global object.
// This is a workaround for the fact that 'const' at the top level of a script
// executed by vm.runInThisContext does not create a global variable.
scriptCode = scriptCode.replace('const GameCore', 'global.GameCore');

// Execute the modified script in the current JSDOM global context.
vm.runInThisContext(scriptCode);
