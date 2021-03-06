import { formatCookie, userAgent, HTTPRequest, followRedirect, ensureOk, Fetch } from "./index"
import { fetchCareer } from "./careers"
import { parse as parseHTML } from 'node-html-parser'
import moment from 'moment'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ensureSession } from "./auth"
import { ensureGetElementsByTagName, ensureQuerySelectorAll } from "../utils/diagnostic"
import { tdVal } from "../utils/dom"

const bookletReq = (cookie: Record<string, string>): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/studente/Libretto/LibrettoHome.do",
    method: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    },
    query: ""
})

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

const average = (entries: Array<BookletEntry>): number => {
    const list = entries.filter(e => typeof e.score !== "undefined")
    const sum = list.reduce((p, c) => p + (c.score || 0), 0)
    return list.length > 0 ? sum / list.length : 0
}

const collectedCredits = (entries: Array<BookletEntry>): number => {
    const list = entries.filter(e => e.status === BookletEntryStatus.Passed)
    return list.reduce((p, c) => p + (c.weight || 0), 0)
}

const parseStatus = (s: string): BookletEntryStatus => {
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

const eqsa = ensureQuerySelectorAll('booklet')
const egebtn = ensureGetElementsByTagName('booklet')

const map = (body: string): TE.TaskEither<Error, BookletEntryList> => {
    const table = eqsa(parseHTML(body))('#tableLibretto')
    if (table.length === 0) {
        return TE.left({ name: "not_found", message: `booklet could not be found` })
    }
    const records = table
        .flatMap(x => egebtn(x)("tbody"))
        .flatMap(x => egebtn(x)("tr"))
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
    return TE.right({
        records: records,
        average: average(records),
        collectedCredits: collectedCredits(records)
    })
}

const fetchBooklet = (f: Fetch) => (cookie: Record<string, string>) => (id: number): TE.TaskEither<Error, BookletEntryList> => pipe(
    fetchCareer(f)(cookie)(id),
    TE.chain(_ => TE.tryCatch(
        () => followRedirect(f)(bookletReq(cookie)),
        error => ({ name: "net_error", message: `${error}` }))
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.chain(x => map(x.body))
)

export { fetchBooklet, BookletEntryList, BookletEntry }
