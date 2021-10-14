const net = require("./net.js")
const htmlParser = require('node-html-parser')

const userAgent = net.userAgent
const formatCookie = net.formatCookie
const followRedirect = net.followRedirect

const careerSelectionReq = cookie => ({
    host: "www.studenti.unipi.it",
    path: "/auth/Logon.do",
    query: "menu_opened_cod=",
    verb: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    }
})

const fetchCareerSelection = cookie => {
    return followRedirect(careerSelectionReq(cookie)).then(res => {
        const table = htmlParser.parse(res.body).getElementsByTagName('table')[0]
        const tbody = table.getElementsByTagName("tbody")[0]
        const rows = tbody.getElementsByTagName("tr")
        return rows.reduce((p, c) => {
            const columns = c.getElementsByTagName("td")
            const id = columns[0].text
            const type = columns[1].text
            const name = columns[2].text
            const active = columns[3].text === "Attivo"
            const href = columns[4].getElementsByTagName("a")[0].getAttribute("href")

            return {
                ...p,
                [id]: {
                    type: type,
                    name: name,
                    active: active,
                    href: `https://${res.requestHost}/${href}`
                }
            }
        }, {})
    })
}

module.exports = {
    fetchCareerSelection: cookie => fetchCareerSelection(cookie)
}

