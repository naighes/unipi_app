#!/usr/bin/env bash

if [ "$#" -ne 2 ]; then
    echo "illegal number of parameters"
    echo "command synopsis:"
    echo "./auth_test.sh <user> <password>"
    exit 2
fi

DATA="usr=$1&pwd=$2"
TOKEN=$(curl -s "https://unipi-api.herokuapp.com/auth" \
    -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data ${DATA} | jq -r '.access_token')
echo ${TOKEN}
