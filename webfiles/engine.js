// --- engine.js: The UI and Rendering Layer ---

const $ = s => document.querySelector(s);

// Globally available data (loaded via script tags in index.html)
const DATA = {
    places,
    items,
    synonyms,
    actions
};

// --- DOM Elements ---
const viewport = $('#viewport');
const statsBar = $('#statsBar');
const commandInput = $('#commandInput');
const landingPage = $('#landing');
const gameUI = $('#gameUI');
const startBtn = $('#startBtn');
const commandForm = $('#commandForm');

// --- Game State ---
// The engine's only responsibility is to hold the current state object.
let state = {};

// --- UI Rendering Functions ---

// Prints a single message to the viewport.
const print = msg => {
    const p = document.createElement('p');
    // Sanitize text to prevent accidental HTML injection
    p.textContent = msg;
    viewport.appendChild(p);
    // Auto-scroll to the latest message
    viewport.scrollTop = viewport.scrollHeight;
};

// Generates the string for the inventory part of the status bar.
const inventoryDisplay = () => {
    if (!state.inventory || state.inventory.length === 0) return '–';
    return state.inventory.map(id => {
        const it = DATA.items[id];
        const pretty = id.charAt(0).toUpperCase() + id.slice(1);
        return it.state != null ? `${pretty}:${it.state}` : pretty;
    }).join(', ');
};

// Updates the top status bar with the current game state.
const refreshStats = () => {
    if (!state.loc) return; // Don't render if state isn't initialized
    statsBar.textContent = `Plats: ${state.loc} | Hälsa: ${state.health} | Föremål: ${inventoryDisplay()}`;
};


// --- Game Flow ---

// Processes a single command by sending it to the core and rendering the result.
const processInput = (input) => {
    // Call the core logic to process the command
    const result = GameCore.processCommand(state, DATA, input);

    // The core returns a new state object, which we adopt.
    state = result.newState;
    // The core gives us a JSON-friendly state, so we must re-hydrate the Set.
    state.visited = new Set(state.visited);

    // Render all output lines returned by the core.
    result.output.forEach(line => print(line));

    // Update the UI to reflect the new state.
    refreshStats();

    // If the core signals the game should end, disable input.
    if (result.shouldQuit) {
        commandInput.disabled = true;
    }
};


// --- Initialisation ---

// Kicks off the game.
const startGame = () => {
    // 1. Build the synonym map for the core to use.
    GameCore.buildSynonymMap(DATA.synonyms);

    // 2. Initialize the game state and get the first room description.
    const initResult = GameCore.init(DATA);
    state = initResult.newState;
    state.visited = new Set(state.visited); // Re-hydrate the Set.

    // 3. Switch from the landing page to the game UI.
    landingPage.style.display = 'none';
    gameUI.style.display = 'flex';
    commandInput.focus();

    // 4. Print the initial room description and stats.
    initResult.output.forEach(line => print(line));
    refreshStats();
};

// --- Event Listeners ---
startBtn.onclick = startGame;

commandForm.onsubmit = e => {
    e.preventDefault();
    const input = commandInput.value;
    if (input.trim() && !commandInput.disabled) {
        processInput(input);
    }
    commandInput.value = '';
};
