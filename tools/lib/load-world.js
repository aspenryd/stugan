const fs = require('fs');
const path = require('path');

// The world data files are plain browser scripts (`const places = {...}`).
// We evaluate each one and return the declared object, so Node tooling and
// tests consume exactly the same files the browser does.
const WORLD_FILES = {
    places: { file: 'places.js', required: true },
    items: { file: 'items.js', required: true },
    synonyms: { file: 'synonyms.js', required: true },
    actions: { file: 'actions.js', required: true },
    strings: { file: 'strings.js', required: false },
    meta: { file: 'meta.js', required: false }
};

function loadWorld(dir) {
    const world = {};
    for (const [key, spec] of Object.entries(WORLD_FILES)) {
        const filePath = path.join(dir, spec.file);
        if (!fs.existsSync(filePath)) {
            if (spec.required) throw new Error(`Missing required world file: ${filePath}`);
            continue;
        }
        const code = fs.readFileSync(filePath, 'utf8');
        try {
            world[key] = new Function(`${code}; return ${key};`)();
        } catch (e) {
            throw new Error(`Failed to evaluate ${filePath}: ${e.message}`);
        }
    }
    return world;
}

// Deep-clones a world so game runs and validations never mutate the source.
function cloneWorld(world) {
    return JSON.parse(JSON.stringify(world));
}

module.exports = { loadWorld, cloneWorld, WORLD_FILES };
