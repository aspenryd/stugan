describe('GameCore', () => {
    let mockData;

    beforeEach(() => {
        // This mock data simulates the structure of the actual game data files.
        mockData = {
            places: {
                'övergivet_torp': {
                    desc: 'You are in an abandoned cottage.',
                    exits: { 'north': 'hall' },
                    items: ['key']
                },
                'hall': {
                    desc: 'You are in a long hall.',
                    exits: { 'south': 'övergivet_torp' },
                    items: []
                }
            },
            items: {
                'key': {
                    desc: 'A shiny brass key.',
                    portable: true
                }
            },
            synonyms: {
                'north': ['n'],
                'take': ['ta', 'get', 'pick up'], // Correctly define 'ta' as a synonym for 'take'
            },
            actions: {}
        };
        // The setup file already loads GameCore, but we need to build the synonym map for each test.
        GameCore.buildSynonymMap(mockData.synonyms);
    });

    it('should initialize the game state correctly', () => {
        const result = GameCore.init(mockData);
        expect(result.newState).toBeDefined();
        expect(result.newState.loc).toBe('övergivet_torp');
        expect(result.output).toEqual(['You are in an abandoned cottage.', 'Du ser: Key']);
    });

    it('should handle the "look" command', () => {
        const initialState = GameCore.init(mockData).newState;
        const result = GameCore.processCommand(initialState, mockData, 'look');
        expect(result.output.join(' ')).toContain('You are in an abandoned cottage.');
    });

    it('should handle the "move" command', () => {
        const initialState = GameCore.init(mockData).newState;
        const result = GameCore.processCommand(initialState, mockData, 'go north');
        expect(result.newState.loc).toBe('hall');
        expect(result.output.join(' ')).toContain('You are in a long hall.');
    });

    it('should handle the "take" command using a synonym', () => {
        const initialState = GameCore.init(mockData).newState;
        const result = GameCore.processCommand(initialState, mockData, 'ta key');
        expect(result.newState.inventory).toEqual(['key']);
        expect(result.output.join(' ')).toContain('Du plockar upp key.');
    });

    it('should handle the "inventory" command', () => {
        let state = GameCore.init(mockData).newState;
        // First, take the key
        state = GameCore.processCommand(state, mockData, 'ta key').newState;
        // Then, check the inventory
        const result = GameCore.processCommand(state, mockData, 'inventory');
        expect(result.output.join(' ')).toContain('Du bär: Key');
    });
});
