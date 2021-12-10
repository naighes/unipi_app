import { formatCookie, userAgent, HTTPRequest, followRedirect, ensureOk, Fetch } from "./index"
import { fetchCareer } from "./careers"
import { HTMLElement, parse as parseHTML } from 'node-html-parser'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ensureSession } from "./auth"
import { ensureQuerySelectorAll } from "../utils/diagnostic"
import { tdVal } from "../utils/dom"

const userDetailsReq = (cookie: Record<string, string>): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/studente/HomePageStudente.do",
    method: "GET",
    headers: {
        'user-agent': userAgent,
        'cookie': formatCookie(cookie || {}),
    },
    query: ""
})

type UserDetails = {
    pictureURL: string | undefined
    fullName: string | undefined
    residentialAddress: string | undefined
    livingAddress: string | undefined
    email: string | undefined
    internalEmail: string | undefined
    phone: string | undefined
}

const eqsa = ensureQuerySelectorAll('plan')

const map = (body: string): TE.TaskEither<Error, UserDetails> => {
    const doc = parseHTML(body)
    const strip = (e: HTMLElement) => e.childNodes
        .filter(c => c.childNodes.length === 0)
        .join(" ")
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/(\n)+/g, ' ')
        .replace(/[^\x00-\x7F]/g, '')
        .replace(/ +(?= )/g,'')
        .trim()
    const dls = eqsa(doc)("dl.record-riga").map(x => {
        const columns = x.getElementsByTagName("dd") || []
        return {
            pictureURL: tdVal(e => {
                const imgs = e.getElementsByTagName("img")
                return imgs.length > 0 ? imgs[0].getAttribute("src") : undefined
            })(columns)(0),
            fullName: tdVal(strip)(columns)(1),
            residentialAddress: tdVal(strip)(columns)(2),
            livingAddress: tdVal(strip)(columns)(3),
            email: tdVal(strip)(columns)(5),
            internalEmail: tdVal(strip)(columns)(6),
            phone: tdVal(strip)(columns)(7)
        }
    })
    return dls.length === 0
        ? TE.left({ name: "not_found", message: `booklet could not be found` })
        : TE.right(dls[0])
}

const fetchUserDetails = (f: Fetch) => (cookie: Record<string, string>) => (id: number): TE.TaskEither<Error, UserDetails> => pipe(
    fetchCareer(f)(cookie)(id),
    TE.chain(_ => TE.tryCatch(
        () => followRedirect(f)(userDetailsReq(cookie)),
        error => ({ name: "net_error", message: `${error}` }))
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.chain(x => map(x.body))
)

export { fetchUserDetails, UserDetails }
