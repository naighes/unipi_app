#!/usr/bin/env bash

if [ "$#" -ne 2 ]; then
    echo "illegal number of parameters"
    echo "command synopsis:"
    echo "./career_selection_test.sh <user> <password>"
    exit 2
fi

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SRC_DIR="$(dirname "${SCRIPT_DIR}")"
TOKEN=$(${SCRIPT_DIR}/auth_test.sh $1 $2)

curl -s -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/json" \
    "https://unipi-api.herokuapp.com/careers" | jq .
