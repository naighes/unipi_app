import { formatCookie, userAgent, StringPairDictionary, HTTPRequest, followRedirect, ensureOk } from "./index"
import { fetchCareer } from "./careers"
import { parse as parseHTML, HTMLElement } from 'node-html-parser'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ensureSession } from "./auth"
import { ensureGetElementsByTagName, ensureQuerySelectorAll } from "../utils/diagnostic"

const planReq = (cookie: StringPairDictionary): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/studente/Piani/PianiHome.do",
    method: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    },
    query: ""
})

enum PlanEntryStatus {
    Planned = 1,
    Attended,
    Passed,
    Unknow
}

type PlanGroup = {
    name: string | undefined
    entries: Array<PlanEntry>
}

type PlanEntry = {
    code: string | undefined
    name: string | undefined
    weight: number | undefined
    status: PlanEntryStatus | undefined
}

const parseStatus = (s: string) => {
    switch (s.toLowerCase()) {
        case "pianificata":
            return PlanEntryStatus.Planned
        case "frequentata":
            return PlanEntryStatus.Attended
        case "superata":
            return PlanEntryStatus.Passed
        default:
            return PlanEntryStatus.Unknow
    }
}

const eqsa = ensureQuerySelectorAll('plan')
const egebtn = ensureGetElementsByTagName('plan')

const map = (body: string): Array<PlanGroup> => {
    const tdVal = <T> (f: (e: HTMLElement) => T) => (columns: Array<HTMLElement>) => (i: number) => {
        return i < columns.length ? f(columns[i]) : undefined
    }
    const doc = parseHTML(body)
    const titles = eqsa(doc)("td.tplTitolo").map(x => x.text)
    const tables = eqsa(doc)("table.detail_table").map(x =>
        egebtn(x)("tr").splice(1).map(y => {
            const columns = y.getElementsByTagName("td") || []
            return {
                code: tdVal(e => e.text)(columns)(0),
                name: tdVal(e => e.text)(columns)(1),
                weight: tdVal(e => parseInt(e.text) || undefined)(columns)(columns.length > 3 ? 6 : 2),
                status: columns.length > 3 ? tdVal(e => parseStatus(e.text))(columns)(5) : PlanEntryStatus.Unknow
            }
        })
    )
    return titles.map((x, i) => ({ name: x, entries: tables[i] }))
}

const fetchPlan = (cookie: StringPairDictionary) => (id: number): TE.TaskEither<Error, Array<PlanGroup>> => pipe(
    fetchCareer(cookie)(id),
    TE.chain(_ => TE.tryCatch(
        () => followRedirect(planReq(cookie)),
        error => ({ name: "net_error", message: `${error}` }))
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(x => map(x.body))
)

export { fetchPlan, PlanGroup, PlanEntry, PlanEntryStatus }
