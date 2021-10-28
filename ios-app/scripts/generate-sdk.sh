#!/usr/bin/env bash

function printUsage {
    printf "usage: ./generate-sdk.sh <host>\n"
}

if test "$#" -ne 1; then
    echo -e "illegal number of parameters"
    printUsage
    exit 1
fi

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SRC_DIR="$(dirname "${SCRIPT_DIR}")"
declare DOCKER_MOUNTED_PATH="/tmp/workdir"

clean() {
    rm -rf ${SRC_DIR}/SwagGen
}

git clone --depth 1 https://github.com/yonaskolb/SwagGen.git ${SRC_DIR}/SwagGen

r1=$?
if [ $r1 -ne 0 ]; then
    echo "could not clone into ${SRC_DIR}/SwagGen"
    clean
    exit $r1
fi

URL="https://$1/api-docs"
curl -s -o ${SRC_DIR}/SwagGen/api-docs.json ${URL}

r2=$?
if [ $r2 -ne 0 ]; then
    echo "could not fetch spec from ${URL}"
    clean
    exit $r2
fi

docker run \
    --rm \
    -v "${SRC_DIR}:${DOCKER_MOUNTED_PATH}" \
    hawkci/swaggen:latest \
    swaggen generate "${DOCKER_MOUNTED_PATH}/SwagGen/api-docs.json" \
    --language swift \
    --template "${DOCKER_MOUNTED_PATH}/SwagGen/Templates/Swift/template.yml" \
    --destination "${DOCKER_MOUNTED_PATH}/unipi-sdk" \
    --clean all

r3=$?
if [ $r3 -ne 0 ]; then
    echo "could not generate sdk"
    clean
    exit $r3
fi

clean

