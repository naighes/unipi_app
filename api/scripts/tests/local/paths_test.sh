#!/usr/bin/env bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SRC_DIR="$(dirname "${SCRIPT_DIR}")"

curl -s -H "Accept: application/json" \
    "http://localhost:3000/courses" | jq .
