import { IncomingHttpHeaders, IncomingMessage } from 'http'
import https, { RequestOptions } from 'https'
import url from 'url'
import setCookieParser from 'set-cookie-parser'
import { either as E } from "fp-ts"
import * as TE from 'fp-ts/lib/TaskEither'
import EX from 'express'
import moment from 'moment'

type Fetch = (req: HTTPRequest) => Promise<HTTPResponse>

interface StringPairDictionary {
    [key: string]: string
}

type HTTPRequest = {
    host: string
    port?: number
    path: string | null | undefined
    method: string
    headers: IncomingHttpHeaders
    query: string | null | undefined
    data?: string
}

type HTTPResponse = {
    statusCode?: number
    statusMessage?: string
    request: HTTPRequest
    headers: IncomingHttpHeaders
    body: string
    cookie?: StringPairDictionary
}

const cookieParser = {
    parse: (x: string): StringPairDictionary => x.split(";").reduce((p, c) => {
        const z = c.split("=")
        return z.length !== 2 ? p : { ...p, [z[0].trim()]: z[1].trim() }
    }, {})
}

const requestCookies = (headers: IncomingHttpHeaders): StringPairDictionary => cookieParser.parse(headers['cookie'] || "")
const responseCookies = (headers: IncomingHttpHeaders): StringPairDictionary => setCookieParser.parse(headers['set-cookie'] || []).reduce((p, c) => ({
    ...p,
    [c.name]: c.value
}), {})
const mergedCookie = (reqHeaders: IncomingHttpHeaders, resHeaders: IncomingHttpHeaders) => ({
    ...requestCookies(reqHeaders),
    ...responseCookies(resHeaders)
})
const formatCookie = (c: StringPairDictionary): string => Object.keys(c).map(x => `${x}=${c[x]}`).join("; ")

const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:82.0) Gecko/20100101 Firefox/82.0"

const makeOptions = (req: HTTPRequest): RequestOptions => ({
    hostname: req.host,
    port: req.port || 443,
    path: `${req.path}${req.query ? "?" + req.query : ""}`,
    method: req.method,
    headers: req.headers
})

const ensureOk = (d: HTTPResponse): TE.TaskEither<Error, HTTPResponse> => TE.fromEither(typeof d.statusCode !== "undefined" && d.statusCode !== 200
    ? E.left({ name: "unexpected_status_code", message: `received ${d.statusCode}, expected 200` })
    : E.right(d))

const printLog = (options: RequestOptions, res: IncomingMessage, buffer: Buffer | undefined) =>
    `${options.hostname || "-"} - - ${moment().format("DD/MMM/YYYY:hh:mm")} "${options.method || "-"}  ${options.path || "-"}" ${res.statusCode || '-'} ${buffer?.length || "-"}`

const fetch: Fetch = (req: HTTPRequest): Promise<HTTPResponse> => {
    const options = makeOptions(req)
    return new Promise((resolve, reject) => {
        const r = https.request(options, res => {
            res.setEncoding('utf8')
            let buffers: Array<Uint8Array> = []
            res.on('data', chunk => {
                if (chunk instanceof Buffer) {
                    buffers.push(chunk)
                } else {
                    buffers.push(Buffer.from(chunk as string, 'utf8'))
                }
            }).on('end', () => {
                   const buffer = Buffer.concat(buffers)
                   console.log(printLog(options, res, buffer))
                   const body = buffer.toString('utf8')
                   resolve({
                       statusCode: res.statusCode,
                       statusMessage: res.statusMessage,
                       request: req,
                       headers: res.headers,
                       body: body
                   })
            })
        })

        r.on('error', error => {
            reject(error)
        })

        if (req.data) {
            r.write(req.data)
        }

        r.end()
    })
}

const followRedirect = (f: Fetch) => (req: HTTPRequest): Promise<HTTPResponse> => f(req).then(res => {
    const reqHeaders = req.headers || {}
    const resHeaders = res.headers || {}
    const cookie = mergedCookie(reqHeaders, resHeaders)
    if (resHeaders.location && res.statusCode === 302) {
        const q = url.parse(resHeaders.location)
        return followRedirect(f)({
            host: q.host || `${res.request.host}`,
            path: q.pathname || "",
            query: q.query || "",
            method: "GET",
            headers: {
                'user-agent': userAgent,
                'cookie': formatCookie(cookie)
            }
        })
    }
    return {
        ...res,
        cookie: {
            ...(res.cookie || {}),
            ...cookie
        }
    }
})

const handleError = (res: EX.Response) => (e: Error): EX.Response => {
    switch (e.name) {
        case "session_is_expired":
            return res.set({
                'WWW-Authenticate': 'Bearer error="invalid_token", error_description="session_is_expired"'
              }).status(401).json({
                name: "invalid_token",
                message: "session_is_expired"
            })
        case "wrong_credentials":
            return res.set({
                'WWW-Authenticate': 'Bearer error="invalid_token", error_description="wrong_credentials"'
              }).status(401).json({
                name: "invalid_token",
                message: "wrong_credentials"
            })
        case "not_found":
            return res.status(404).send()
        case "token_error":
            return res.set({
                'WWW-Authenticate': 'Bearer error="invalid_token", error_description="invalid_token"'
              }).status(401).json({
                name: "invalid_token",
                message: "invalid_token"
            })
        // case "form_action_expected":
        // case "net_error":        
        // case "authentication_error":
        // case "unexpected_status_code":
        default:
            return res.status(500).send()
    }
}

export {
    userAgent,
    makeOptions,
    fetch,
    followRedirect,
    formatCookie,
    HTTPRequest,
    HTTPResponse,
    StringPairDictionary,
    ensureOk,
    handleError,
    Fetch
}
