#!/usr/bin/env node
// World creator CLI.
//
// Generate a random (seeded) world:
//   node tools/create-world.js --random --seed 42 --rooms 10 --out generated/forest42
//
// Build a world from a JSON spec ({places, items, synonyms, actions, meta}):
//   node tools/create-world.js --spec myworld.json --out generated/custom
//
// Options:
//   --playable   also copy index.html, core.js, engine.js, strings.js and
//                cover.png so the output folder is a complete playable game
//   --name "My Forest"   world title
//
// Every world is validated and machine-solved before anything is written;
// an unwinnable or broken world is rejected.

const fs = require('fs');
const path = require('path');
const { generateWorld } = require('./lib/generate');
const { validateWorld } = require('./lib/validate');
const { solve, findUnreachablePlaces } = require('./lib/solver');

const WEBFILES = path.resolve(__dirname, '../webfiles');

function parseArgs(argv) {
    const args = { rooms: 8, seed: 42, out: null, spec: null, random: false, playable: false, name: null };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--random') args.random = true;
        else if (a === '--playable') args.playable = true;
        else if (a === '--seed') args.seed = parseInt(argv[++i], 10);
        else if (a === '--rooms') args.rooms = parseInt(argv[++i], 10);
        else if (a === '--out') args.out = argv[++i];
        else if (a === '--spec') args.spec = argv[++i];
        else if (a === '--name') args.name = argv[++i];
        else if (a === '--help' || a === '-h') args.help = true;
        else { console.error(`Unknown argument: ${a}`); process.exit(1); }
    }
    return args;
}

function writeWorld(world, outDir, options = {}) {
    fs.mkdirSync(outDir, { recursive: true });

    const parts = ['places', 'items', 'synonyms', 'actions', 'meta'];
    for (const part of parts) {
        const content = `const ${part} = ${JSON.stringify(world[part], null, 2)};\n`;
        fs.writeFileSync(path.join(outDir, `${part}.js`), content, 'utf8');
    }

    // Engine strings: reuse the shipped table unless the spec brings its own.
    if (world.strings) {
        fs.writeFileSync(path.join(outDir, 'strings.js'),
            `const strings = ${JSON.stringify(world.strings, null, 2)};\n`, 'utf8');
    } else {
        fs.copyFileSync(path.join(WEBFILES, 'strings.js'), path.join(outDir, 'strings.js'));
    }

    // Machine-readable spec of the whole world.
    fs.writeFileSync(path.join(outDir, 'world.json'), JSON.stringify(world, null, 2), 'utf8');

    if (options.playable) {
        for (const file of ['index.html', 'core.js', 'engine.js', 'cover.png', 'favicon.ico']) {
            const src = path.join(WEBFILES, file);
            if (fs.existsSync(src)) fs.copyFileSync(src, path.join(outDir, file));
        }
    }
}

function writeWalkthrough(result, world, outDir) {
    const lines = [
        `# Walkthrough: ${world.meta.title || 'Generated world'}`,
        '',
        `Start: ${world.meta.start}  |  Goal: ${world.meta.goal}`,
        '',
        ...result.walkthrough.map((cmd, i) => `${i + 1}. \`${cmd}\``),
        ''
    ];
    fs.writeFileSync(path.join(outDir, 'WALKTHROUGH.md'), lines.join('\n'), 'utf8');
}

function main() {
    const args = parseArgs(process.argv);
    if (args.help || (!args.random && !args.spec)) {
        console.log('Usage: node tools/create-world.js (--random [--seed N] [--rooms N] | --spec file.json) [--out dir] [--playable] [--name "Title"]');
        process.exit(args.help ? 0 : 1);
    }

    let world;
    if (args.spec) {
        const specPath = path.resolve(args.spec);
        world = JSON.parse(fs.readFileSync(specPath, 'utf8'));
        if (args.name) world.meta = { ...(world.meta || {}), title: args.name };
        console.log(`Loaded world spec from ${specPath}`);
    } else {
        world = generateWorld({ seed: args.seed, rooms: args.rooms, name: args.name });
        console.log(`Generated world "${world.meta.title}" (seed ${args.seed}, ${Object.keys(world.places).length} places)`);
    }

    // --- Quality gate: never write a broken or unwinnable world. ---
    const { errors, warnings } = validateWorld(world);
    warnings.forEach(w => console.warn(`  warning: ${w}`));
    if (errors.length) {
        errors.forEach(e => console.error(`  error: ${e}`));
        console.error('World is invalid; nothing written.');
        process.exit(1);
    }

    const solution = solve(world);
    if (!solution.reachedGoal) {
        console.error('World is unwinnable (the solver cannot reach the goal); nothing written.');
        process.exit(1);
    }
    const unreachable = findUnreachablePlaces(world);
    if (unreachable.length) {
        console.warn(`  warning: unreachable places: ${unreachable.join(', ')}`);
    }

    const outDir = path.resolve(args.out ||
        path.join('generated', args.spec ? path.basename(args.spec, '.json') : `world-${args.seed}`));
    writeWorld(world, outDir, { playable: args.playable });
    writeWalkthrough(solution, world, outDir);

    console.log(`Validation: OK (${warnings.length} warnings)`);
    console.log(`Solvable in ${solution.walkthrough.length} steps:`);
    solution.walkthrough.forEach((cmd, i) => console.log(`  ${i + 1}. ${cmd}`));
    console.log(`World written to ${outDir}`);
    if (args.playable) console.log('Open index.html in that folder to play it.');
    else console.log('Copy the .js files into webfiles/ (or rerun with --playable) to play it.');
}

main();
