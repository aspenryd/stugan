const fs = require('fs');
const path = require('path');

const WEBFILES = path.resolve(__dirname, '../webfiles');

// Loads a browser data script (`const foo = ...`) onto the global object.
const loadGlobal = (fileName, varName) => {
    let code = fs.readFileSync(path.join(WEBFILES, fileName), 'utf8');
    code = code.replace(new RegExp(`^const ${varName}\\s*=\\s*`), `global.${varName} = `);
    eval(code);
};

// Smoke test of the DOM layer: index.html ids + engine.js wiring + GameCore.
describe('Browser engine (DOM smoke test)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <section id="landing"></section>
            <main id="gameUI">
                <div id="statsBar"></div>
                <div id="viewport"></div>
                <form id="commandForm"><input id="commandInput" /></form>
            </main>
            <button id="startBtn"></button>`;

        if (typeof global.requestAnimationFrame !== 'function') {
            global.requestAnimationFrame = cb => cb();
        }

        loadGlobal('places.js', 'places');
        loadGlobal('items.js', 'items');
        loadGlobal('synonyms.js', 'synonyms');
        loadGlobal('actions.js', 'actions');
        loadGlobal('strings.js', 'strings');
        loadGlobal('meta.js', 'meta');
    });

    it('index.html contains the elements and scripts the engine expects', () => {
        const html = fs.readFileSync(path.join(WEBFILES, 'index.html'), 'utf8');
        for (const id of ['landing', 'gameUI', 'statsBar', 'viewport', 'commandForm', 'commandInput', 'startBtn']) {
            expect(html).toContain(`id="${id}"`);
        }
        // Data scripts must load before the engine scripts.
        const order = ['places.js', 'items.js', 'synonyms.js', 'actions.js',
            'strings.js', 'meta.js', 'core.js', 'engine.js'];
        const positions = order.map(f => html.indexOf(`src="${f}"`));
        positions.forEach(p => expect(p).toBeGreaterThan(-1));
        expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    });

    it('starts the game and processes commands through the UI', () => {
        const engineCode = fs.readFileSync(path.join(WEBFILES, 'engine.js'), 'utf8');
        eval(engineCode);

        document.querySelector('#startBtn').onclick();

        const viewport = document.querySelector('#viewport');
        const statsBar = document.querySelector('#statsBar');
        expect(document.querySelector('#landing').style.display).toBe('none');
        expect(viewport.textContent).toContain('Firewood');
        expect(statsBar.textContent).toContain('Location: The Cabin');

        const input = document.querySelector('#commandInput');
        const form = document.querySelector('#commandForm');
        const type = (command) => {
            input.value = command;
            form.onsubmit(new Event('submit'));
        };

        type('take flashlight');
        expect(viewport.textContent).toContain('You pick up the flashlight');
        expect(statsBar.textContent).toContain('Flashlight (off)');

        type('turn on flashlight');
        expect(statsBar.textContent).toContain('Flashlight (on)');

        type('go south');
        expect(statsBar.textContent).toContain('Location: The Clearing');

        type('quit');
        expect(viewport.textContent).toContain('Game over');
        expect(input.disabled).toBe(true);
    });
});
