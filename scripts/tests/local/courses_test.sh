#!/usr/bin/env bash

if [ "$#" -ne 4 ]; then
    echo "illegal number of parameters"
    echo "command synopsis:"
    echo "./courses_test.sh <user> <password> <path> <subject>"
    exit 2
fi

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SRC_DIR="$(dirname "${SCRIPT_DIR}")"
TOKEN=$(${SCRIPT_DIR}/auth_test.sh $1 $2)

curl -s -H "Authorization: Bearer ${TOKEN}" \
    -H "Accept: application/json" \
    "http://localhost:3000/courses/$3/$4/calendar" | jq .
