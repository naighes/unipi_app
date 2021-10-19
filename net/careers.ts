import { userAgent as userAgent, formatCookie, followRedirect, StringPairDictionary, HTTPRequest, ensureOk } from "./index"
import { parse as parseHTML, HTMLElement } from 'node-html-parser'
import { ensureSession } from "./auth"
import url from 'url'
import querystring from 'querystring'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ensureGetElementsByTagName } from "../utils/diagnostic"

const careersReq = (cookie: StringPairDictionary): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/Logon.do",
    query: "",
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

type Career = {
    registrationNumber: string | undefined,
    type: string,
    name: string,
    active: boolean,
    careerId: number | undefined
}

const egebtn = ensureGetElementsByTagName('careers')

const map = (body: string): Array<Career> => {
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
    return egebtn(parseHTML(body))('table')
        .flatMap(x => egebtn(x)("tbody"))
        .flatMap(x => egebtn(x)("tr"))
        .map(c => {
            const columns = c.getElementsByTagName("td") || []
            const id = tdVal(x => parseInt(x.text) || 0)(columns)(0)
            const type = tdVal(x => x.text)(columns)(1)
            const name = tdVal(x => x.text)(columns)(2)
            const active = tdVal(x => x.text === "Attivo")(columns)(3)

            return ({
                registrationNumber: id,
                type: type,
                name: name,
                active: active,
                careerId: tdVal(studId)(columns)(4)
            }) as Career
        })
}

const fetchCareers = (cookie: StringPairDictionary): TE.TaskEither<Error, Array<Career>> => pipe(
    TE.tryCatch(
        () => followRedirect(careersReq(cookie)),
        error => ({ name: "net_error", message: `${error}` })
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(x => map(x.body))
)

const fetchCareer = (cookie: StringPairDictionary) => (careerId: number): TE.TaskEither<Error, {[s: string]: number}> => pipe(
    TE.tryCatch(
        () => followRedirect(careerReq(cookie)(careerId)),
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
    Career
}
