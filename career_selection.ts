import { userAgent as userAgent, formatCookie, followRedirect, StringPairDictionary, HTTPRequest, ensureOk } from "./net"
import { parse as parseHTML, HTMLElement } from 'node-html-parser'
import { ensureSession } from "./auth"
import url from 'url'
import querystring from 'querystring'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'

const careerSelectionReq = (cookie: StringPairDictionary): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/Logon.do",
    query: "menu_opened_cod=",
    method: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    }
})

const careerReq = (cookie: StringPairDictionary) => (id: number): HTTPRequest => {
    return {
        host: "www.studenti.unipi.it",
        path: "/auth/studente/SceltaCarrieraStudente.do",
        query: `stu_id=${id}`,
        method: "GET",
        headers: {
            'user-agent': userAgent,
            'cookie': formatCookie(cookie || {}),
        }
    }
}

type Careers = {
    [id: number]: {
        type: string,
        name: string,
        active: boolean,
        studentId: number | undefined
    }
}

const map = (body: string) => {
    const tdVal = <T> (f: (e: HTMLElement) => T) => (columns: Array<HTMLElement>) => (i: number) => {
        return i < columns.length ? f(columns[i]) : undefined
    }
    const studId = (e: HTMLElement) => {
        const hrefs = (e.getElementsByTagName("a") || []).map(x => {
            const query = url.parse(x.getAttribute("href") || "").query || ""
            const q = querystring.parse(query)["stu_id"] as string
            return q ? parseInt(q) || undefined : undefined
        })
        return hrefs.length !== 0 ? hrefs[0] : undefined
    }
    return (parseHTML(body)?.getElementsByTagName('table') || [])
        .flatMap(x => x.getElementsByTagName("tbody"))
        .flatMap(x => x.getElementsByTagName("tr"))
        .reduce((p, c) => {
            const columns = c.getElementsByTagName("td") || []
            const id = tdVal(x => parseInt(x.text) || 0)(columns)(0)
            const type = tdVal(x => x.text)(columns)(1)
            const name = tdVal(x => x.text)(columns)(2)
            const active = tdVal(x => x.text === "Attivo")(columns)(3)

            return id ? {
                ...p,
                [id]: {
                    type: type,
                    name: name,
                    active: active,
                    studentId: tdVal(studId)(columns)(4)
                }
            } as Careers : p as Careers
        }, {})
}

const fetchCareerSelection = (cookie: StringPairDictionary): TE.TaskEither<Error, Careers> => pipe(
    TE.tryCatch(
        () => followRedirect(careerSelectionReq(cookie)),
        error => ({ name: "net_error", message: `${error}` })
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(x => map(x.body))
)

const fetchCareer = (cookie: StringPairDictionary) => (studentId: number): TE.TaskEither<Error, {[s: string]: number}> => pipe(
    TE.tryCatch(
        () => followRedirect(careerReq(cookie)(studentId)),
        error => ({ name: "net_error", message: `${error}` })
    ),
    TE.chain(x => typeof x.statusCode !== "undefined" && x.statusCode >= 400 && x.statusCode < 500
        ? TE.left({ name: "not_found", message: `career with id ${studentId} could not be found` })
        : TE.right(x)
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(_ => ({ 'id': studentId }))
)

export {
    fetchCareerSelection,
    fetchCareer,
    Careers
}
