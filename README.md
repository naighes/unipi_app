# unipi-app

A student-made HTTP API for easy access to unipi stuff.
An always up-to-date version is hosted at https://unipi-api.herokuapp.com.

[Open API 3.0](https://spec.openapis.org/oas/v3.0.0) spec available at [https://unipi-api.herokuapp.com/api-docs](https://unipi-api.herokuapp.com/api-docs).

## how to build the API

Run `./api/scripts/build.sh`.

## how to run

You need to configure a secret by the parameter `<secret>` or via the environment variable `SECRET` in order to allow the application to work properly.
You can run the application by typing `./api/scripts/run.sh <secret>`.

## how to generate the swift SDK

Run `./ios-app/scripts/generate-sdk.sh <host> <protocol>`, where the **host** parameter is the source of the API spec (e.g. `unipi-api.herokuapp.com`) and **protocol** should be `http` or `https`.

## basic usage

An **access_token** is required to access the most of the available resources.
It can be retrieved by sending a `POST` request to `https://unipi-api.herokuapp.com/auth`.
Credentials can be sent by `application/x-www-form-urlencoded` as well as `application/json`:

```sh
# application/x-www-form-urlencoded
curl -s "https://unipi-api.herokuapp.com/auth" \
    -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data "usr=<user_name>&pwd=<password>"

# application/json
curl -s "https://unipi-api.herokuapp.com/auth" \
    -X POST \
    -H "Content-Type: application/json" \
    --data "{\"usr\":\"<user_name>\",\"pwd\":\"<password>\"}"
```

When an error occurs (e.g. invalid credentials) a `401` status code is returned:

```
> POST /auth HTTP/1.1
> ...
< HTTP/1.1 401 Unauthorized
< ...
< Www-Authenticate: Bearer error="invalid_token", error_description="wrong_credentials"
```

Otherwise, the access token is returned within the body of the response:

```json
{
    "access_token":"eyJhbGciOiJIUzI1BiIsInR5cCI6IkpXVCJ9.eyJjb29raWUiOnsiSlNFU1NJT05JRCI6IkE0RTAxMTY5RjIxMzg1NDBDNTRBNDhCMjlGMEVBMkQ2Iiwic2hpYl9pZHBfc2Vzc2lvbiI6ImU1Y2VmFRElYmU2M2JiZDczZThjMGY4ZDYxYzZiYTEwMGQ3NGRlMjU2MGY1NzliYWZkOGRiZmRjYjZmZDZmMGMiLCJfc2hpYnNlc3Npb25fNjU3MzczNjUzMzVmNzU2ZTY5NzA2OTY4NzQ3NDcwNzMzYTJmMmY3Nzc3NzcyZTczNzQ3NTY0NjU2ZTc0NjkyZTc1NmU2OTcwNjkyZTY5NzQyZjczNjg2OTYyNjI2ZjZjNjU3NDY4IjoiX2QwN2ZlZDYzM2UzMTMzYzU3ZDVkMTIyY2QyYmVlOWNkIn0sImlhdCI6MTYzNDU2OTI0NX0.oAmk5gmfzADUBSddu7c_tc7z3zuTy5Pu_19wqwWiTDI",
    "token_type":"Bearer"
}
```

The above access token will be used to invoke any other resource. For example:

```sh
curl -s "https://unipi-api.herokuapp.com/careers" \
    -X GET \ 
    -H "Accept: application/json" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1BiIsInR5cCI6IkpXVCJ9.eyJjb29raWUiOnsiSlNFU1NJT05JRCI6IkE0RTAxMTY5RjIxMzg1NDBDNTRBNDhCMjlGMEVBMkQ2Iiwic2hpYl9pZHBfc2Vzc2lvbiI6ImU1Y2VmFRElYmU2M2JiZDczZThjMGY4ZDYxYzZiYTEwMGQ3NGRlMjU2MGY1NzliYWZkOGRiZmRjYjZmZDZmMGMiLCJfc2hpYnNlc3Npb25fNjU3MzczNjUzMzVmNzU2ZTY5NzA2OTY4NzQ3NDcwNzMzYTJmMmY3Nzc3NzcyZTczNzQ3NTY0NjU2ZTc0NjkyZTc1NmU2OTcwNjkyZTY5NzQyZjczNjg2OTYyNjI2ZjZjNjU3NDY4IjoiX2QwN2ZlZDYzM2UzMTMzYzU3ZDVkMTIyY2QyYmVlOWNkIn0sImlhdCI6MTYzNDU2OTI0NX0.oAmk5gmfzADUBSddu7c_tc7z3zuTy5Pu_19wqwWiTDI"
```

## available formats

By default a JSON representation is returned and right now it'is the only available view.
