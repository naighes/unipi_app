import { userAgent as userAgent, formatCookie, followRedirect, HTTPRequest, ensureOk, Fetch } from "./index"
import { parse as parseHTML, HTMLElement } from 'node-html-parser'
import { ensureSession } from "./auth"
import url from 'url'
import querystring from 'querystring'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ensureGetElementsByTagName } from "../utils/diagnostic"
import { tdVal } from "../utils/dom"

const careersReq = (cookie: Record<string, string>): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/Logon.do",
    query: "",
    method: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    }
})

const careerReq = (cookie: Record<string, string>) => (id: number): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/studente/SceltaCarrieraStudente.do",
    query: `stu_id=${id}`,
    method: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    }
})

type CareerList = {
    entries: Array<Career>
}

type Career = {
    registrationNumber: number | undefined,
    type: string | undefined,
    name: string | undefined,
    active: boolean | undefined,
    careerId: number
}

const egebtn = ensureGetElementsByTagName('careers')

const map = (body: string): CareerList => {
    const studId = (e: HTMLElement) => {
        const hrefs = (e.getElementsByTagName("a") || []).map(x => {
            const query = url.parse(x.getAttribute("href") || "").query || ""
            const q = querystring.parse(query)["stu_id"] as string
            return q ? parseInt(q) || undefined : undefined
        })
        return hrefs.length !== 0 ? hrefs[0] : undefined
    }
    return {
        entries: egebtn(parseHTML(body))('table')
        .flatMap(x => egebtn(x)("tbody"))
        .flatMap(x => egebtn(x)("tr"))
        .map(c => {
            const columns = c.getElementsByTagName("td") || []
            const registrationNumber = tdVal(x => parseInt(x.text) || 0)(columns)(0)
            const type = tdVal(x => x.text)(columns)(1)
            const name = tdVal(x => x.text)(columns)(2)
            const active = tdVal(x => x.text === "Attivo")(columns)(3)

            return ({
                registrationNumber: registrationNumber,
                type: type,
                name: name,
                active: active,
                careerId: tdVal(studId)(columns)(4) || 0
            }) as Career
        }).filter(x => x.careerId > 0)
    }
}

const fetchCareers = (f: Fetch) => (cookie: Record<string, string>): TE.TaskEither<Error, CareerList> => pipe(
    TE.tryCatch(
        () => followRedirect(f)(careersReq(cookie)),
        error => ({ name: "net_error", message: `${error}` })
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(x => map(x.body))
)

const fetchCareer = (f: Fetch) => (cookie: Record<string, string>) => (careerId: number): TE.TaskEither<Error, {[s: string]: number}> => pipe(
    TE.tryCatch(
        () => followRedirect(f)(careerReq(cookie)(careerId)),
        error => ({ name: "net_error", message: `${error}` })
    ),
    TE.chain(x => typeof x.statusCode !== "undefined" && x.statusCode >= 400 && x.statusCode < 500
        ? TE.left({ name: "not_found", message: `career with id ${careerId} could not be found` })
        : TE.right(x)
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(_ => ({ 'id': careerId }))
)

export {
    fetchCareers,
    fetchCareer,
    Career,
    CareerList
}
