import { Fetch, HTTPRequest, HTTPResponse, StringPairDictionary } from '../net'
import { fetchAuthReq } from '../net/auth'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'

const fail = (s: string) => {
    throw s
}

const successfullFetch = (expected: HTTPResponse) => (req: HTTPRequest): Promise<HTTPResponse> => new Promise((resolve, _) => {
    resolve({
        statusCode: expected.statusCode,
        statusMessage: expected.statusMessage,
        request: req,
        headers: expected.headers,
        body: expected.body
    })
})

const failureFetch = (error: Error) => (req: HTTPRequest): Promise<HTTPResponse> => new Promise((resolve, reject) => {
    reject(error)
})

test('authentication: net error', async () => {
    let i = 0
    const inner = [failureFetch({
        name: "oh my",
        message: "something definitely went wrong"
    })]
    const f = () => inner[i++]
    const data = await TE.fold(
        (e: Error) => T.of(expect(e.name).toBe('net_error')),
        (_: StringPairDictionary) => T.of(fail('net error was expected'))
    )
    (fetchAuthReq(f())("", ""))()
})

test('authentication: unexpected status code', async () => {
    let i = 0
    const inner = [successfullFetch({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        headers: {},
        body: "",
        request: undefined
    })]
    const f = () => inner[i++]
    const data = await TE.fold(
        (e: Error) => T.of(expect(e.name).toBe('unexpected_status_code')),
        (_: StringPairDictionary) => T.of(fail('unexpected status coder was expected'))
    )
    (fetchAuthReq(f())("", ""))()
})

test('authentication: no form action', async () => {
    let i = 0
    const inner = [successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: "",
        request: undefined
    })]
    const f = () => inner[i++]
    const data = await TE.fold(
        (e: Error) => T.of(expect(e.name).toBe('form_action_expected')),
        (_: StringPairDictionary) => T.of(fail('missing form action was expected'))
    )
    (fetchAuthReq(f())("", ""))()
})

test('authentication: wrong credentials', async () => {
    let i = 0
    const inner = [successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    }), successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    }), successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><section><p>failed</p></section><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    })]
    const f = (req: HTTPRequest): Promise<HTTPResponse> => inner[i++](req)
    await TE.fold(
        (e: Error) => {
            return T.of(expect(e.name).toBe('wrong_credentials'))
        },
        (_: StringPairDictionary) => T.of(fail('wrong_credentials error was expected'))
    )
    (fetchAuthReq(f)("", ""))()
})

test('authentication: missing cookies', async () => {
    let i = 0
    const inner = [successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    }), successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    }), successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    }), successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><section><p>failed</p></section><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined,
        cookie: {}
    })]
    const f = (req: HTTPRequest): Promise<HTTPResponse> => inner[i++](req)
    await TE.fold(
        (e: Error) => T.of(expect(e.name).toBe('authentication_error')),
        (_: StringPairDictionary) => T.of(fail('authentication_error error was expected'))
    )
    (fetchAuthReq(f)("", ""))()
})

test('authentication: succesfull authentication', async () => {
    let i = 0
    const inner = [successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    }), successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    }), successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: {},
        body: '<html><head></head><body><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined
    }), successfullFetch({
        statusCode: 200,
        statusMessage: "Ok",
        headers: { 'set-cookie': ['a=b', 'c=d'] },
        body: '<html><head></head><body><section><p>failed</p></section><form action="https://blahblah.com/action.html"></form></body></html>',
        request: undefined,
        cookie: { a: "b", c: "d" }
    })]
    const f = (req: HTTPRequest): Promise<HTTPResponse> => inner[i++](req)
    await TE.fold(
        (e: Error) => T.of(fail(`succesfull authentication was expected; got ${JSON.stringify(e)} instead`)),
        (c: StringPairDictionary) => T.of(expect(Object.keys(c).length).toBeGreaterThan(1))
    )
    (fetchAuthReq(f)("", ""))()
})
