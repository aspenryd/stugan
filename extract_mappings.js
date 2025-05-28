const fs = require('fs');

const itemsJsContent = fs.readFileSync('items.js', 'utf-8');

const mappings = {};
const lines = itemsJsContent.split('\n');

let currentItemName = null;

for (const line of lines) {
  const itemNameMatch = line.match(/"(.*?)": \{ \/\/ Tidigare (.*)/);
  if (itemNameMatch) {
    const newItemName = itemNameMatch[1];
    const oldItemName = itemNameMatch[2].trim();
    mappings[oldItemName] = newItemName;
  } else {
    // Simpler regex for cases where the comment is on its own line or part of the item block
    const simpleCommentMatch = line.match(/\/\/\s*Tidigare\s+(.*)/);
    if (simpleCommentMatch && currentItemName) {
        const oldItemName = simpleCommentMatch[1].trim();
        // Check if this old name isn't already mapped (to avoid overwriting if multiple comments exist)
        // and that the currentItemName is not already a value (meaning this comment is for this item)
        if (!mappings[oldItemName] && !Object.values(mappings).includes(currentItemName)) {
            mappings[oldItemName] = currentItemName;
        }
    }

    // Track the current item name based on the object key lines
    const currentItemMatch = line.match(/^\s*"(.*?)"\s*:\s*\{/);
    if (currentItemMatch) {
        currentItemName = currentItemMatch[1];
    }
  }
}

console.log(JSON.stringify(mappings, null, 2));
