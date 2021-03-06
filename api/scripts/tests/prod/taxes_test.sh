#!/usr/bin/env bash

if [ "$#" -ne 3 ]; then
    echo "illegal number of parameters"
    echo "command synopsis:"
    echo "./taxes_test.sh <user> <password> <careerId>"
    exit 2
fi

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SRC_DIR="$(dirname "${SCRIPT_DIR}")"
TOKEN=$(${SCRIPT_DIR}/auth_test.sh $1 $2)

curl -s -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/json" \
    "https://unipi-api.herokuapp.com/$3/taxes" | jq .
