import { formatCookie, userAgent, HTTPRequest, followRedirect, ensureOk, Fetch } from "./index"
import { parse as parseHTML, HTMLElement } from 'node-html-parser'
import moment from 'moment'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ensureSession } from "./auth"
import { decode } from 'html-entities'
import { ensureGetElementsByTagName, ensureQuerySelectorAll } from "../utils/diagnostic"
import { tdVal } from "../utils/dom"

const coursesReq = (cookie: Record<string, string>) => (subject: string) => (path: string): HTTPRequest => ({
    host: "esami.unipi.it",
    path: `/elencoappelli.php?from=sappelli&docente=&insegnamento=${encodeURIComponent(subject).replace(/%20/g, '+')}&cds=${path}&cerca=`,
    method: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    },
    query: ""
})

const pathsReq = (): HTTPRequest => ({
    host: "esami.unipi.it",
    path: `/elencoappelli.php`,
    method: "GET",
    headers: {
        'user-agent': userAgent
    },
    query: ""
})

type CourseList = {
    entries: Array<Course>
}

type Course = {
    academicYear: string | undefined
    subject: string | undefined
    code: string | undefined
    weight: number | undefined
    teacher: string | undefined
    calls: Array<Call>
}

type Call = {
    type: string | undefined
    date: Date | undefined
    location: string | undefined
    notes: string | undefined
    subscriptions: number | undefined
    oldSystem: string | undefined
    openingDates: Date | undefined
    closingDates: Date | undefined
}

const eqsa = ensureQuerySelectorAll('courses')
const egebtn = ensureGetElementsByTagName('courses')

const mapCall = (row: HTMLElement): Array<Call> =>
    eqsa(row)("table.table-appelli")
        .flatMap(x => egebtn(x)("tbody"))
        .flatMap(x => egebtn(x)("tr"))
        .map(r => {
            const columns = r.getElementsByTagName("td")
            const openingDates = tdVal(x => {
                const s = x.innerHTML.split("<BR>")
                return s.length === 0
                    ? undefined
                    : moment(s[0].replace("Inizio iscrizioni: ", ""), "DD-MM-YYYY hh:mm").toDate() || undefined
            })(columns)(6)
            const closingDates = tdVal(x => {
                const s = x.innerHTML.split("<BR>")
                return s.length <= 1
                    ? undefined
                    : moment(s[1].replace("Termine iscrizioni: ", ""), "DD-MM-YYYY hh:mm").toDate() || undefined
            })(columns)(6)
            const notes = tdVal(x => {
                const a = x.getElementsByTagName("a") || []
                return a.length === 0
                    ? x.text
                    : decode(a[0].getAttribute("onClick")?.replace('showDetail("', "")?.replace('");', "")?.replace('<br />', ''))
            })(columns)(3)
            return {
                type: tdVal(x => x.text.trim())(columns)(0),
                date: moment(tdVal(x => x.text.trim())(columns)(1) || "", "DD-MM-YYYY hh:mm").toDate() || undefined,
                location: tdVal(x => x.text.trim())(columns)(2),
                notes: notes,
                subscriptions: tdVal(x => parseInt(x.text) || undefined)(columns)(4),
                oldSystem: tdVal(x => x.text.trim())(columns)(5),
                openingDates: openingDates,
                closingDates: closingDates
            }
        })

const mapCourses = (body: string): CourseList => ({
    entries: eqsa(parseHTML(body))('tr.corso')
        .map(row => {
            const calls = mapCall(row)
            row.removeChild(row.firstChild)
            const columns = row.getElementsByTagName("td")
            return {
                academicYear: tdVal(x => x.text.trim())(columns)(0),
                subject: tdVal(x => x.text.trim())(columns)(2),
                code: tdVal(x => x.text.trim())(columns)(3),
                weight: tdVal(x => parseInt(x.text) || undefined)(columns)(4),
                teacher: tdVal(x => x.text.trim())(columns)(5),
                calls: calls
            }
        })
    })

const mapPaths = (body: string): Record<string, string> => eqsa(parseHTML(body))('#cds')
    .flatMap(x => egebtn(x)("option"))
    .reduce((p, c) => {
        const a = c.getAttribute("value")
        return typeof a === "undefined" ? p : ({ ...p, [a]: c.text })
    }, {})

const fetchCourses = (f: Fetch) => (cookie: Record<string, string>) => (subject: string) => (path: string): TE.TaskEither<Error, CourseList> => pipe(
    TE.tryCatch(
        () => followRedirect(f)(coursesReq(cookie)(subject)(path)),
        error => ({ name: "net_error", message: `${error}` })),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(x => mapCourses(x.body))
)

const fetchPaths = (f: Fetch) => (): TE.TaskEither<Error, Record<string, string>> => pipe(
    TE.tryCatch(
        () => followRedirect(f)(pathsReq()),
        error => ({ name: "net_error", message: `${error}` })),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(x => mapPaths(x.body))
)

export { fetchCourses, fetchPaths, CourseList, Course, Call }
