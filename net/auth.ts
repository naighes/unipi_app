import url from 'url'
import querystring from 'querystring'
import { parse as parseHTML } from 'node-html-parser'
import { followRedirect, formatCookie, userAgent, HTTPRequest, HTTPResponse, StringPairDictionary, ensureOk } from "./index"
import { either as E } from "fp-ts"
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { IncomingHttpHeaders } from 'http'
import { verify } from 'jsonwebtoken'

const authReq = (): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/Logon.do",
    method: "GET",
    headers: {
        'user-agent': userAgent
    },
    query: undefined,
    data: undefined
})

const ensureSession = (d: HTTPResponse): TE.TaskEither<Error, HTTPResponse> => {
    return TE.fromEither(d.request.host.indexOf("unipi.idp.cineca.it") === -1
? E.right(d)
: E.left({ name: "session_is_expired", message: `session is expired` }))
}

const parseFormAction = (s: string): string | undefined => {
    const result = (parseHTML(s)?.getElementsByTagName('form') || []).map(x => x.getAttribute("action"))
    return result.length > 0 ? result[0] : undefined
}
const parseSAMLFields = (s: string): {[key: string]: string | undefined} => {
    return (parseHTML(s)?.getElementsByTagName('form') || [])
        .flatMap(x => x.getElementsByTagName("input"))
        .reduce<{[key: string]: string | undefined}>((p, c) => {
            const name = c.getAttribute("name")
            const value = c.getAttribute("value")
            return name ? { ...p, [name]: value } : p
    }, {})
}

const isAuthError = (s: string) => {
    return (parseHTML(s).getElementsByTagName('section') || [])
        .flatMap(x => x.getElementsByTagName('p'))
        .filter(p => p.text.toUpperCase().indexOf("FAILED") >= 0 ||
                     p.text.toUpperCase().indexOf("ERROR") >= 0 ||
                     p.text.toUpperCase().indexOf("WRONG") >= 0).length > 0
}

const f1 = (res: HTTPResponse): TE.TaskEither<Error, HTTPResponse> => {
    const data = querystring.stringify({
        "shib_idp_ls_exception.shib_idp_session_ss": "",
        "shib_idp_ls_success.shib_idp_session_ss": "false",
        "shib_idp_ls_value.shib_idp_session_ss": "",
        "shib_idp_ls_exception.shib_idp_persistent_ss": "",
        "shib_idp_ls_success.shib_idp_persistent_ss": "false",
        "shib_idp_ls_value.shib_idp_persistent_ss": "",
        "shib_idp_ls_supported": "false",
        "_eventId_proceed": ""
    })
    return pipe(
        res,
        (r: HTTPResponse) => parseFormAction(r.body),
        E.fromNullable({ name: "form_action_expected", message: "expected form action" }),
        E.map(url.parse),
        E.map(q => ({
            host: q.host || `${res.request.host}`,
            path: q.pathname,
            query: q.query as string,
            method: "POST",
            headers: {
                'user-agent': userAgent,
                'cookie': formatCookie(res.cookie || {}),
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': Buffer.byteLength(data).toString()
            },
            data: data
        })),
        TE.fromEither,
        TE.chain(request => TE.tryCatch(
            () => followRedirect(request),
            error => ({ name: "net_error", message: `${error}` }))
        ),
        TE.chain(ensureOk)
    )
}

const f2 = (usr: string) => (pwd: string) => (res: HTTPResponse) => {
    const data = querystring.stringify({
        "j_username": usr,
        "j_password": pwd,
        "_eventId_proceed": "",
        "spid_idp": ""
    })
    return pipe(
        res,
        (r: HTTPResponse) => parseFormAction(r.body),
        E.fromNullable({ name: "form_action_expected", message: "expected form action" }),
        E.map(url.parse),
        E.map(q => ({
            host: q.host || `${res.request.host}`,
            path: q.pathname,
            query: q.query as string,
            method: "POST",
            headers: {
                'user-agent': userAgent,
                'cookie': formatCookie(res.cookie || {}),
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': Buffer.byteLength(data).toString()
            },
            data: data
        })),
        TE.fromEither,
        TE.chain(request => TE.tryCatch(
            () => followRedirect(request),
            error => ({ name: "net_error", message: `${error}` }))
        ),
        TE.chain(ensureOk)
    )
}

const f3 = (res: HTTPResponse) => {
    const data = querystring.stringify(parseSAMLFields(res.body))
    return pipe(
        res,
        (r: HTTPResponse) => parseFormAction(r.body),
        E.fromNullable({ name: "form_action_expected", message: "expected form action" }),
        E.map(url.parse),
        E.map(q => ({
            host: q.host || `${res.request.host}`,
            path: q.pathname,
            query: q.query as string,
            method: "POST",
            headers: {
                'user-agent': userAgent,
                'cookie': formatCookie(res.cookie || {}),
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': Buffer.byteLength(data).toString()
            },
            data: data
        })),
        TE.fromEither,
        TE.chain(request => TE.tryCatch(
            () => followRedirect(request),
            error => ({ name: "net_error", message: `${error}` }))
        ),
        TE.chain(ensureOk)
    )
}

const fetchAuthReq = (usr: string, pwd: string): TE.TaskEither<Error, StringPairDictionary> => pipe(
    TE.tryCatch(
        () => followRedirect(authReq()),
        (reason) => new Error(`${reason}`)
    ),
    TE.chain(f1),
    TE.chain(f2(usr)(pwd)),
    TE.chain(d => TE.fromEither(isAuthError(d.body)
        ? E.left({ name: "wrong_credentials", message: "wrong credentials" })
        : E.right(d))),
    TE.chain(f3),
    TE.map(x => x.cookie || {}),
    TE.chain(d => TE.fromEither(Object.keys(d).length < 2
        ? E.left({ name: "authentication_error", message: "authentication error" })
        : E.right(d)))
)

type AuthToken = {
    cookie: StringPairDictionary
}

const extractToken = (headers: IncomingHttpHeaders) => (secret: string) : E.Either<Error, AuthToken> => {
    const token = ((headers || {})['authorization'] || "").replace("Bearer " , "")
    return E.tryCatch(
        () => verify(token, secret) as AuthToken,
        e => ({ name: "token_error", message: `${e}` })
    )
}

export { fetchAuthReq, ensureSession, extractToken }
