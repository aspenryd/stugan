const fs = require('fs');
const path = require('path');

// Helper function to load and execute a script in the test's context
const loadScript = (fileName, overrideName = null) => {
    const scriptPath = path.resolve(__dirname, `../webfiles/${fileName}`);
    let scriptCode = fs.readFileSync(scriptPath, 'utf8');
    const varName = overrideName || fileName.split('.')[0];
    // Replace const varName = ... with global.varName = ...
    // using a regex that matches the start of the file or line
    scriptCode = scriptCode.replace(new RegExp(`^const ${varName}\\s*=\\s*`), `global.${varName} = `);

    // Safety check: ensure we are not assigning to undefined if the regex failed
    // (This might happen if the file variable name doesn't match the filename/override)
    try {
        eval(scriptCode);
    } catch (e) {
        console.error(`Error loading script ${fileName}:`, e);
    }
};

// Load all game data scripts.
// The 'global' object is used to make the data available in the test environment.
loadScript('places.js');
loadScript('items.js');
loadScript('synonyms.js');
loadScript('actions.js');
loadScript('core.js', 'GameCore');

describe('Stugan Game Tests', () => {
    let DATA;

    beforeEach(() => {
        // Deep-clone the data for each test to ensure isolation.
        DATA = JSON.parse(JSON.stringify({
            places: global.places,
            items: global.items,
            synonyms: global.synonyms,
            actions: global.actions
        }));
        GameCore.buildSynonymMap(DATA.synonyms);
    });

    it('should start at stugan and display description', () => {
        const result = GameCore.init(DATA);
        expect(result.newState.loc).toBe('stugan');
        const output = result.output.join(' ');
        expect(output.toLowerCase()).toContain('stockved');
    });

    it('should allow movement to gläntan', () => {
        const result = GameCore.init(DATA);
        // Move south from stugan to gläntan
        const moveResult = GameCore.processCommand(result.newState, DATA, 'söder');
        expect(moveResult.newState.loc).toBe('gläntan');
        expect(moveResult.output.join(' ').toLowerCase()).toContain('glänta');
    });

    it('should allow taking an item', () => {
        const result = GameCore.init(DATA);
        // Take flashlight which is in stugan
        const takeResult = GameCore.processCommand(result.newState, DATA, 'ta ficklampa');
        expect(takeResult.newState.inventory).toContain('ficklampa');
        expect(takeResult.output.join(' ')).toContain('plockar upp ficklampa');
    });

    it('should handle flashlight toggle action', () => {
        let state = GameCore.init(DATA).newState;
        state = GameCore.processCommand(state, DATA, 'ta ficklampa').newState;

        const lightResult = GameCore.processCommand(state, DATA, 'tänd ficklampa');
        expect(lightResult.output.join(' ')).toContain('tänder ficklampa');

        // Verify item state change
        expect(DATA.items['ficklampa'].state).toBe('På');
    });

    it('should handle multi-step navigation', () => {
        let state = GameCore.init(DATA).newState;
        state = GameCore.processCommand(state, DATA, 'söder').newState; // gläntan
        expect(state.loc).toBe('gläntan');

        state = GameCore.processCommand(state, DATA, 'väster').newState; // rävgryt
        expect(state.loc).toBe('rävgryt');

        state = GameCore.processCommand(state, DATA, 'ned').newState; // rotsystemet
        expect(state.loc).toBe('rotsystemet');
    });
});
