import * as path from 'path';
import * as assert from 'assert';
import * as testShared from './test-shared';
import { LaunchRequestBuildArguments } from '../launch-arguments';
import * as debugUtils from '../debug-utils';
describe('Assembly', () => {
    const BUILD_CWD = path.normalize(__dirname + '/../../src/__tests__/asm-project');
    const BUILD_ARGS = testShared.DEFAULT_BUILD_ARGS;
    const BUILD_COMMAND = testShared.DEFAULT_BUILD_COMMAND;
    const BUILD : LaunchRequestBuildArguments = {
        cwd: BUILD_CWD,
        args: BUILD_ARGS,
        command: BUILD_COMMAND,
    }
    const MAP_FILE = BUILD_CWD + '/asm-project.c64.map';
    const DEBUG_FILE = BUILD_CWD + '/asm-project.c64.dbg';
    const LABEL_FILE = BUILD_CWD + '/asm-project.c64.lbl';
    const PROGRAM = BUILD_CWD + '/asm-project.c64'

    const VICE_DIRECTORY = testShared.DEFAULT_VICE_DIRECTORY;
    const VICE_ARGS = testShared.DEFAULT_VICE_ARGS;

    const MAIN_S = path.join(BUILD_CWD, "src/main.s")

    test('Starts and terminates successfully without intervention', async() => {
        const rt = await testShared.newRuntime();
        await rt.start(
            PROGRAM,
            BUILD_CWD,
            true,
            false,
            false,
            VICE_DIRECTORY,
            VICE_ARGS,
            false,
            DEBUG_FILE,
            MAP_FILE,
            LABEL_FILE
        );

        await testShared.waitFor(rt, 'stopOnEntry');

        await rt.continue();
        await debugUtils.delay(2000);
        await rt.terminate();
    });

    test('Can set a breakpoint', async() => {
        const rt = await testShared.newRuntime();
        await rt.start(
            PROGRAM,
            BUILD_CWD,
            true,
            false,
            false,
            VICE_DIRECTORY,
            VICE_ARGS,
            false,
            DEBUG_FILE,
            MAP_FILE,
            LABEL_FILE
        );

        await testShared.waitFor(rt, 'stopOnEntry');

        await rt.setBreakPoint(MAIN_S, 12);
        await Promise.all([
            rt.continue(),
            testShared.waitFor(rt, 'stopOnBreakpoint', (type, __, file, line, col) => {
                assert.strictEqual(file, MAIN_S)
                assert.strictEqual(line, 12)
            }),
        ]);

        await rt.terminate();
    });

    test('Can step in', async() => {
        const rt = await testShared.newRuntime();
        await rt.start(
            PROGRAM,
            BUILD_CWD,
            true,
            false,
            false,
            VICE_DIRECTORY,
            VICE_ARGS,
            false,
            DEBUG_FILE,
            MAP_FILE,
            LABEL_FILE
        );

        await testShared.waitFor(rt, 'started');

        await rt.setBreakPoint(MAIN_S, 7);
        await Promise.all([
            rt.continue(),
            testShared.waitFor(rt, 'stopOnBreakpoint', (type, __, file, line, col) => {
                assert.strictEqual(file, MAIN_S)
                assert.strictEqual(line, 7)
            }),
        ]);

        await Promise.all([
            rt.stepIn(),
            testShared.waitFor(rt, 'stopOnStep', (type, __, file, line, col) => {
                assert.strictEqual(file, MAIN_S)
                assert.strictEqual(line, 18)
            }),
        ]);

        await rt.terminate();
    });

    test('Can step out', async() => {
        const rt = await testShared.newRuntime();
        await rt.start(
            PROGRAM,
            BUILD_CWD,
            true,
            false,
            false,
            VICE_DIRECTORY,
            VICE_ARGS,
            false,
            DEBUG_FILE,
            MAP_FILE,
            LABEL_FILE
        );

        await testShared.waitFor(rt, 'stopOnEntry');

        await rt.setBreakPoint(MAIN_S, 7);
        await Promise.all([
            rt.continue(),
            testShared.waitFor(rt, 'stopOnBreakpoint', (type, __, file, line, col) => {
                assert.strictEqual(file, MAIN_S);
                assert.strictEqual(line, 7);
            }),
        ]);


        await Promise.all([
            rt.stepIn(),
            testShared.waitFor(rt, 'stopOnStep', (type, __, file, line, col) => {
                assert.strictEqual(file, MAIN_S);
                assert.strictEqual(line, 18);
            }),
        ]);

        await Promise.all([
            rt.stepOut(),
            testShared.waitFor(rt, 'stopOnStep', (type, __, file, line, col) => {
                assert.strictEqual(file, MAIN_S);
                assert.strictEqual(line, 9);
            }),
        ]);

        await rt.terminate();
    });
});