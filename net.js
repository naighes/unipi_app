const https = require('https')
const http = require('http')
const url = require('url')

const setCookieParser = require('set-cookie-parser')
const cookieParser = {
    parse: x => (x || "").split(";").reduce((p, c) => {
        const z = c.split("=")
        return z.length !== 2 ? p : { ...p, [z[0].trim()]: z[1].trim() }
    }, {})
}

const requestCookies = headers => cookieParser.parse(headers['cookie'] || "")
const responseCookies = headers => setCookieParser.parse(headers['set-cookie'] || []).reduce((p, c) => ({
    ...p,
    [c.name]: c.value
}), {})
const mergedCookie = (reqHeaders, resHeaders) => ({
    ...requestCookies(reqHeaders),
    ...responseCookies(resHeaders)
})
const formatCookie = c => Object.keys(c).map(x => `${x}=${c[x]}`).join("; ")

const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:82.0) Gecko/20100101 Firefox/82.0"

const makeOptions = req => ({
    protocol: req.protocol || "https:",
    hostname: req.host,
    port: req.port || 443,
    path: `${req.path}${req.query ? "?" + req.query : ""}`,
    method: req.verb,
    headers: req.headers
})

const fetch = req => {
    const options = makeOptions(req)
    // console.log(`> ${options.protocol} ${options.method} ${options.hostname} ${options.path} - cookie: ${options.headers.cookie || ''}`)
    const h = options.protocol === "https:" ? https : http

    return new Promise((resolve, reject) => {
        const r = h.request(options, res => {
            res.setEncoding('utf8')
            let inBuffer = ""
            res.on('data', chunk => { inBuffer += chunk })
            res.on('end', () => {
                // console.log(`< ${res.statusCode}`)
                resolve({
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    requestHost: req.host,
                    requestPath: req.path,
                    headers: res.headers,
                    body: inBuffer
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

const followRedirect = req => fetch(req).then(res => {
    const reqHeaders = req.headers || {}
    const resHeaders = res.headers || {}
    const cookie = mergedCookie(reqHeaders, resHeaders)
    if (resHeaders.location && res.statusCode === 302) {
        const q = url.parse(resHeaders.location)
        return followRedirect({
            host: q.host || `${res.requestHost}`,
            path: q.pathname,
            query: q.query,
            verb: "GET",
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

module.exports = {
    userAgent: userAgent,
    makeOptions: makeOptions,
    fetch: fetch,
    followRedirect: followRedirect,
    formatCookie: formatCookie
}

