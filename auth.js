const url = require('url')
const querystring = require('querystring')
const htmlParser = require('node-html-parser')
const net = require("./net.js")

const followRedirect = net.followRedirect
const formatCookie = net.formatCookie
const userAgent = net.userAgent

const authReq = () => ({
    host: "www.studenti.unipi.it",
    path: "/auth/Logon.do?menu_opened_cod=",
    query: "",
    verb: "GET",
    headers: {
        'user-agent': userAgent
    }
})

const parseFormAction = s => htmlParser.parse(s).getElementsByTagName('form')[0].getAttribute("action")
const parseSAMLFields = s => htmlParser.parse(s).getElementsByTagName('form')[0].getElementsByTagName("input").reduce((p, c) => ({
    ...p,
    [c.getAttribute("name")]: c.getAttribute("value")
}), {})

const fetchAuthReq = (usr, pwd) => {
    return followRedirect(authReq()).then(res => {
        const q = url.parse(parseFormAction(res.body))
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
        return followRedirect({
            host: q.host || `${res.requestHost}`,
            path: q.pathname,
            query: q.query,
            verb: "POST",
            headers: {
                'user-agent': userAgent,
                'cookie': formatCookie(res.cookie || {}),
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': Buffer.byteLength(data)
            },
            data: data
        })
    }).then(res => {
        const q = url.parse(parseFormAction(res.body))
        const data = querystring.stringify({
            "j_username": usr,
            "j_password": pwd,
            "_eventId_proceed": "",
            "spid_idp": ""
        })
        return followRedirect({
            host: q.host || `${res.requestHost}`,
            path: q.pathname,
            query: q.query,
            verb: "POST",
            headers: {
                'user-agent': userAgent,
                'cookie': formatCookie(res.cookie || {}),
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': Buffer.byteLength(data)
            },
            data: data
        })
    }).then(res => {
        const q = url.parse(parseFormAction(res.body))
        const data = querystring.stringify(parseSAMLFields(res.body))
        return followRedirect({
            host: q.host || `${res.requestHost}`,
            path: q.pathname,
            query: q.query,
            verb: "POST",
            headers: {
                'user-agent': userAgent,
                'cookie': formatCookie(res.cookie || {}),
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': Buffer.byteLength(data)
            },
            data: data
        })
    }).then(res => res.cookie || {})
}

module.exports = {
    fetchCookies: (usr, pwd) => fetchAuthReq(usr, pwd)
}

