#!/usr/bin/env bash

DATA="usr=$1&pwd=$2"
TOKEN=$(curl -s "http://localhost:3000/auth" \
    -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data ${DATA} | jq -r '.access_token')
echo ${TOKEN}
