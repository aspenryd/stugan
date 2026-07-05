// Thin DOM wrapper around GameCore. All game logic lives in core.js so the
// exact same engine runs in the browser and in the test suite.
const $ = s => document.querySelector(s);

const DATA = {
    places,
    items,
    synonyms,
    actions,
    strings: typeof strings !== 'undefined' ? strings : undefined,
    meta: typeof meta !== 'undefined' ? meta : undefined
};

let gameState = null;

const viewport = $('#viewport');
const statsBar = $('#statsBar');

const print = msg => {
    const p = document.createElement('p');
    p.textContent = msg;
    viewport.appendChild(p);
    requestAnimationFrame(() => {
        viewport.scrollTop = viewport.scrollHeight;
    });
};

const uiString = key => {
    const lang = (DATA.meta && DATA.meta.lang) || 'en';
    const table = (DATA.strings && DATA.strings[lang]) || {};
    return table[key] || key;
};

const inventoryDisplay = () => gameState.inventory.map(id => {
    const it = DATA.items[id] || {};
    const pretty = it.name || id.charAt(0).toUpperCase() + id.slice(1);
    return it.state != null ? `${pretty} (${it.state})` : pretty;
}).join(', ');

const refreshStats = () => {
    const place = DATA.places[gameState.loc];
    const placeName = (place && place.name) || gameState.loc;
    statsBar.textContent =
        `${uiString('statLocation')}: ${placeName} | ` +
        `${uiString('statHealth')}: ${gameState.health} | ` +
        `${uiString('statItems')}: ${inventoryDisplay() || '–'}`;
};

const startGame = () => {
    GameCore.buildSynonymMap(DATA.synonyms);
    const result = GameCore.init(DATA);
    gameState = result.newState;
    $('#landing').style.display = 'none';
    $('#gameUI').style.display = 'flex';
    result.output.forEach(print);
    refreshStats();
    $('#commandInput').focus();
};

let isProcessing = false;
$('#startBtn').onclick = startGame;
$('#commandForm').onsubmit = e => {
    e.preventDefault();
    if (isProcessing || !gameState) return;
    const input = $('#commandInput');
    const val = input.value;
    if (!val.trim()) return;

    isProcessing = true;
    input.value = '';
    const result = GameCore.processCommand(gameState, DATA, val);
    gameState = result.newState;
    result.output.forEach(print);
    refreshStats();
    if (result.shouldQuit) {
        input.disabled = true;
    }
    isProcessing = false;
};
