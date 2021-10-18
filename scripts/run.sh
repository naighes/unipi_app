#!/usr/bin/env bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SRC_DIR="$(dirname "${SCRIPT_DIR}")"
INDEX_PATH=${SRC_DIR}/.bin/index.js
${SCRIPT_DIR}/build.sh

retVal=$?

if [ $retVal -ne 0 ]; then
    exit $retVal
fi

node ${INDEX_PATH} --secret $1
