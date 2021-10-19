import { formatCookie, userAgent, StringPairDictionary, HTTPRequest, followRedirect, ensureOk } from "./net"
import { fetchCareer } from "./career_selection"
import { parse as parseHTML, HTMLElement } from 'node-html-parser'
import moment from 'moment'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ensureSession } from "./auth"

const bookletReq = (cookie: StringPairDictionary): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/studente/Libretto/LibrettoHome.do",
    method: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    },
    query: ""
})

const tdVal = <T> (f: (e: HTMLElement) => T) => (columns: Array<HTMLElement>) => (i: number) => {
    return i < columns.length ? f(columns[i]) : undefined
}

enum BookletEntryStatus {
    Planned = 1,
    Attended,
    Passed,
    Unknow
}

type BookletEntryList = {
    average: number
    records: Array<BookletEntry>
    collectedCredits: number
}

type BookletEntry = {
    code: string | undefined
    name: string | undefined
    year: number | undefined
    weight: number | undefined
    academicYear: string | undefined
    score: number | undefined
    date: Date | undefined
    status: BookletEntryStatus | undefined
}

const average = (entries: Array<BookletEntry>) => {
    const list = entries.filter(e => typeof e.score !== "undefined")
    const sum = list.reduce((p, c) => p + (c.score || 0), 0)
    return list.length > 0 ? sum / list.length : 0
}

const collectedCredits = (entries: Array<BookletEntry>) => {
    const list = entries.filter(e => e.status === BookletEntryStatus.Passed)
    return list.reduce((p, c) => p + (c.weight || 0), 0)
}

const parseStatus = (s: string) => {
    switch (s.toLowerCase()) {
        case "images/frequentata.gif":
            return BookletEntryStatus.Attended
        case "images/pianificata.gif":
            return BookletEntryStatus.Planned
        case "images/superata.gif":
            return BookletEntryStatus.Passed
        default:
            return BookletEntryStatus.Unknow
    }
}

const map = (body: string) => {
    const record = (parseHTML(body)?.querySelectorAll('table.tableLibretto') || [])
        .flatMap(x => x.getElementsByTagName("tbody"))
        .flatMap(x => x.getElementsByTagName("tr"))
        .map(row => {
            const columns = row.getElementsByTagName("td")
            const first = (r: number) => {
                const z = tdVal(x => (x.getElementsByTagName("a") || [])
                    .flatMap(y => ((y.text || "").split("-") || []))
                    .map(o => o.trim()))(columns)(0) || []
                return r < z.length ? z[r] : undefined
            }
            const fifth = (r: number) => {
                const z = tdVal(x => (x.text || "").split("-").map(o => o.trim()))(columns)(5) || []
                return r < z.length ? z[r] : undefined
            }
            const third = tdVal(x => {
                const z = (x.getElementsByTagName("img") || []).map(x => x.getAttribute("src") || "")
                return parseStatus(z.length > 0 ? z[0] : "")
            })(columns)(3)
            return {
                code: first(0),
                name: first(1),
                year: tdVal(x => parseInt(x.text) || undefined)(columns)(1),
                weight: tdVal(x => parseFloat(x.text) || undefined)(columns)(2),
                academicYear: tdVal(x => (x.text || "").trim())(columns)(4),
                score: parseInt((fifth(0) || "")) || undefined,
                date: moment((fifth(1) || ""), "DD-MM-YYYY").toDate() || undefined,
                status: third
            }
        })
    return {
        records: record,
        average: average(record),
        collectedCredits: collectedCredits(record)
    }
}

const fetchBooklet = (cookie: StringPairDictionary) => (id: number): TE.TaskEither<Error, BookletEntryList> => pipe(
    fetchCareer(cookie)(id),
    TE.chain(_ => TE.tryCatch(
        () => followRedirect(bookletReq(cookie)),
        error => ({ name: "net_error", message: `${error}` }))
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(x => map(x.body))
)

export { fetchBooklet, BookletEntryList, BookletEntry }
