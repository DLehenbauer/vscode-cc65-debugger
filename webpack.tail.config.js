//@ts-check

'use strict';

const path = require('path');
const fs = require('fs');
const util = require('util');

const config = async() => {
    /**@type {import('webpack').Configuration}*/
    return {
      target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
      node: {
        __dirname: false,
      },
      entry: {
        tail: './node_modules/tail-cli/bin/tail-cli', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
      },
      output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'dist'),
        filename: 'tail.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]'
      },
      devtool: 'source-map',
      externals: {
        vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/

        'spdx-exceptions': 'commonjs spdx-exceptions',
        'spdx-license-ids': 'commonjs spdx-license-ids',
        'spdx-license-ids/deprecated': 'commonjs spdx-license-ids/deprecated',
      },
      resolve: {
        modules: [path.join(__dirname, 'stubbed_modules'), 'node_modules'],
        extensions: ['.js']
      },
      module: {
        rules: [
        {
            test: await util.promisify(fs.realpath)(path.resolve(__dirname, "node_modules/tail-cli/bin/tail-cli")),
            use: [
            {
                loader: 'shebang-loader'
            }
            ]
        }
        ]
      }
    };
}

module.exports = config
