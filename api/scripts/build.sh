#!/usr/bin/env bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SRC_DIR="$(dirname "${SCRIPT_DIR}")"
npm install --prefix ${SRC_DIR}
${SRC_DIR}/node_modules/typescript/bin/tsc -p ${SRC_DIR}/tsconfig.json

