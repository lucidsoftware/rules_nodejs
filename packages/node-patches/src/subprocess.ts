// this does not actually patch child_process
// but adds support to ensure the registered loader is included in all nested executions of nodejs.
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

export const patcher = (requireScriptName: string, nodeDir?: string) => {
  requireScriptName = path.resolve(requireScriptName);
  if (!nodeDir) {
    // Write to a temporary directory so we don't write to runfiles, which are often read-only in a
    // remote execution environment
    const hash = crypto.createHash('sha1').update(requireScriptName).digest('hex').substring(0, 8);

    nodeDir = path.join(os.tmpdir(), `_node_bin_${hash}`);

    function cleanUpTemporaryDirectory() {
      fs.rmSync(nodeDir, {
        recursive: true
      });
    }

    process.on('exit', cleanUpTemporaryDirectory);
    process.on('SIGINT', cleanUpTemporaryDirectory);
    process.on('SIGTERM', cleanUpTemporaryDirectory);
    process.on('SIGUSR1', cleanUpTemporaryDirectory);
    process.on('SIGUSR2', cleanUpTemporaryDirectory);
    process.on('uncaughtException', cleanUpTemporaryDirectory);
  }
  const file = path.basename(requireScriptName);

  try {
    fs.mkdirSync(nodeDir, {recursive: true});
  } catch (e) {
    // with node versions that don't have recursive mkdir this may throw an error.
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }
  if (process.platform == 'win32') {
    const nodeEntry = path.join(nodeDir, 'node.bat');
    if (!fs.existsSync(nodeEntry)) {
      fs.writeFileSync(nodeEntry, `@if not defined DEBUG_HELPER @ECHO OFF
set NP_SUBPROCESS_NODE_DIR=${nodeDir}
set Path=${nodeDir};%Path%
"${process.execPath}" ${process.env.NODE_REPOSITORY_ARGS} --require "${requireScriptName}" %*
`);
    }
  } else {
    const nodeEntry = path.join(nodeDir, 'node');
    if (!fs.existsSync(nodeEntry)) {
      fs.writeFileSync(
          nodeEntry, `#!/bin/bash
export NP_SUBPROCESS_NODE_DIR="${nodeDir}"
export PATH="${nodeDir}":\$PATH
if [[ ! "\${@}" =~ "${file}" ]]; then
  exec ${process.execPath} ${process.env.NODE_REPOSITORY_ARGS} --require "${requireScriptName}" "$@"
else
  exec ${process.execPath} ${process.env.NODE_REPOSITORY_ARGS} "$@"
fi
`,
          {mode: 0o777});
    }
  }

  if (!process.env.PATH) {
    process.env.PATH = nodeDir;
  } else if (process.env.PATH.indexOf(nodeDir + path.delimiter) === -1) {
    process.env.PATH = nodeDir + path.delimiter + process.env.PATH;
  }

  // fix execPath so folks use the proxy node
  if (process.platform == 'win32') {
    // FIXME: need to make an exe, or run in a shell so we can use .bat
  } else {
    process.argv[0] = process.execPath = path.join(nodeDir, 'node');
  }


  // replace any instances of require script in execArgv with the absolute path to the script.
  // example: bazel-require-script.js
  process.execArgv.map(v => {
    if (v.indexOf(file) > -1) {
      return requireScriptName;
    }
    return v;
  });
};
