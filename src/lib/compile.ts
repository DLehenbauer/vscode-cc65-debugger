import * as fs from 'fs';
import * as child_process from 'child_process';
import watch from 'node-watch';
import _flow from 'lodash/fp/flow';
import _orderBy from 'lodash/fp/orderBy';
import _map from 'lodash/fp/map';
import * as debugUtils from './debug-utils';
import * as util from 'util';
import readdir from 'recursive-readdir';
import * as path from 'path';
import * as os from 'os';
import * as tmp from 'tmp';
import { LaunchRequestBuildArguments } from "./launch-arguments";
import { __basedir } from '../basedir';

export const DEFAULT_BUILD_COMMAND = 'make';
export const DEFAULT_BUILD_ARGS = ['OPTIONS=mapfile,labelfile,debugfile'];

export async function getBinaryFromProgram(program: string) : Promise<Buffer> {
    if(/\.d[0-9]{2}$/.test(program)) {
        const fileName = await util.promisify(tmp.tmpName)({ prefix: 'cc65-vice-program-'})
        await util.promisify(child_process.execFile)('c1541', ['-attach', program, '-read', '*', fileName])
        const buf = await util.promisify(fs.readFile)(fileName);
        await util.promisify(fs.unlink)(fileName);
        return buf;
    }

    return await util.promisify(fs.readFile)(program);
}

// FIXME Need to get rid of this, but UI depends on it for now.
export async function guessProgramPath(workspaceDir: string) : Promise<string[]> {
    const filenames : string[] = await readdir(workspaceDir);

    const programs = filenames.filter(x => debugUtils.programFiletypes.test(x))

    const fileMeta = await Promise.all(programs.map(async filename => {
        const [fileStats, listingLength] = await Promise.all([
            util.promisify(fs.stat)(filename),
            (async() => {
                const ext = path.extname(filename).toLowerCase();
                if (/^\.d[0-9]{2}$/.test(ext)) {
                    try {
                        const res = await util.promisify(child_process.execFile)('c1541', ['-attach', filename, '-list'])
                        return (res.stdout.match(/[\r\n]+/g) || '').length
                    }
                    catch {}
                }

                return 0;
            })(),
        ]);

        return {
            fileStats,
            filename,
            listingLength,
        };
    }));
    const orderedPrograms = _flow(
        _orderBy<typeof fileMeta[0]>([x => x.fileStats.mtime, x => x.listingLength], ['desc', 'desc']),
        _map((x: typeof fileMeta[0]) => x.filename)
    )(fileMeta);

    return orderedPrograms;
}

export async function clean(buildCwd: string, execHandler: debugUtils.ExecHandler, cc65Home?: string) : Promise<void> {
    const pids = await execHandler('make', ['clean'], { cwd: buildCwd });

    while(true) {
        try {
            pids[0] != -1 && process.kill(pids[0], 0);
            pids[1] != -1 && process.kill(pids[1], 0);
        }
        catch {
            break;
        }
        await debugUtils.delay(100);
    }
}

/**
* Build the program using the command specified and try to find the output file with monitoring.
* @returns The possible output files of types d81, prg, and d64.
*/
export async function build(build: LaunchRequestBuildArguments, execHandler: debugUtils.ExecHandler, cc65Home?: string) : Promise<boolean> {
    if(build.skip) {
        return true;
    }

    let sep = ':';
    if(process.platform == 'win32') {
        sep = ';';
    }
    let binDir : string | undefined;
    if(!cc65Home) {
        if(['linux', 'win32'].includes(process.platform) && ['arm', 'arm64', 'x32', 'x64'].includes(os.arch())) {
            cc65Home = path.normalize(__basedir + '/../dist/cc65');
            binDir = cc65Home + '/bin_' + process.platform + '_' + os.arch();
        }
    }
    else {
        binDir = cc65Home + '/bin';
    }

    console.log('CC65_HOME', cc65Home);
    console.log('CC65 path', binDir);

    const opts : child_process.ExecOptions = {
        shell: <any>true,
        env: {
            PATH: [binDir, process.env.PATH].filter(x => x).join(sep),
            CC65_HOME: [process.env.CC65_HOME, cc65Home].find(x => x),
        }
    };

    const [changedFilenames] = await Promise.all([
        make(build, execHandler, opts),
    ]);

    return true;
}

export async function make(build: LaunchRequestBuildArguments, execHandler: debugUtils.ExecHandler, opts: child_process.ExecOptions) : Promise<string[]> {
    const doBuild = async() => {
        let args = [
            ...(build.command ? (build.args || []) : DEFAULT_BUILD_ARGS),
        ];

        const failurePath =  `${os.tmpdir()}/cc65vice_make_failure_${Math.random().toString()}`;
        const successPath =  `${os.tmpdir()}/cc65vice_make_success_${Math.random().toString()}`;
        let command = build.command || DEFAULT_BUILD_COMMAND;
        args.push('&&', 'echo', '>', successPath, '||', 'echo', '>', failurePath);

        const pids = await execHandler(command, args, {
            ...opts,
            shell: true,
            cwd: build.cwd,
            title: 'Building...',
        });

        console.log('Started build', pids);
        while(true) {
            let failure = true;
            try {
                await util.promisify(fs.unlink)(failurePath);
            }
            catch {
                failure = false;
            }

            if(failure) {
                throw new Error('Build failed');
            }

            let success = false;
            try {
                await util.promisify(fs.unlink)(successPath);
                success = true;
            }
            catch {
            }

            if(success) {
                break;
            }

            await debugUtils.delay(100);
        }

        console.log('Finished build', pids);
    };

    const builder = doBuild();

    let filenames : string[] = [];
    const watcher = watch(build.cwd, {
        recursive: true,
    }, (evt, filename) => {
        if(!filename) {
            return;
        }
        // Ignore dotfiles
        if(/(^|[\\\/])\.[^\\\/]+/g.test(filename)) {
            return;
        }
        // Ignore files that aren't programs
        if(debugUtils.programFiletypes.test(filename)) {
            return;
        }

        filenames.push(filename || "");
    });

    await builder;

    watcher.close();

    return filenames;
}