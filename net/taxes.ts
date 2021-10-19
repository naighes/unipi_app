import { formatCookie, userAgent, StringPairDictionary, HTTPRequest, followRedirect, ensureOk } from "./index"
import { fetchCareer } from "./careers"
import { parse as parseHTML, HTMLElement } from 'node-html-parser'
import moment from 'moment'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ensureSession } from "./auth"
import { ensureGetElementsByTagName } from "../utils/diagnostic"

const taxesReq = (cookie: StringPairDictionary): HTTPRequest => ({
    host: "www.studenti.unipi.it",
    path: "/auth/studente/Tasse/ListaFatture.do",
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

enum TaxEntryPaymentStatus {
    Paid = 1,
    NotPaid
}

type TaxEntryList = {
    entries: Array<TaxEntry>
}

type TaxEntry = {
    invoiceId: string | undefined
    IUVcode: string | undefined
    reason: string | undefined
    description: Array<string>
    expirationDate: Date | undefined
    amount: number | undefined
    paymentStatus: TaxEntryPaymentStatus | undefined
}

const parseStatus = (s: string) => {
    switch (s.toLowerCase()) {
        case "images/semaf_v.gif":
            return TaxEntryPaymentStatus.Paid
        default:
            return TaxEntryPaymentStatus.NotPaid
    }
}

const egebtn = ensureGetElementsByTagName('taxes')

const map = (body: string) => {
    const entries = egebtn(parseHTML(body))('table')
        .flatMap(x => egebtn(x)("tbody"))
        .flatMap(x => egebtn(x)("tr"))
        .map(row => {
            const columns = row.getElementsByTagName("td")
            const first = () => {
                const z = tdVal(x => (x.getElementsByTagName("a") || [])
                    .map(o => o.text.trim()))(columns)(0) || []
                return z.length > 0 ? z[0] : undefined
            }
            const fourth = () => tdVal(x => (x.getElementsByTagName("li") || [])
                .map(o => o.text.trim())
                )(columns)(3) || []
            
            const sixth = () => tdVal(x => {
                const z = (x.getElementsByTagName("img") || []).map(x => x.getAttribute("src") || "")
                return parseStatus(z.length > 0 ? z[0] : "")
            })(columns)(6)
            return {
                invoiceId: first(),
                IUVcode: tdVal(x => x.text.trim())(columns)(1),
                reason: tdVal(x => x.text.trim())(columns)(2),
                description: fourth(),
                expirationDate: moment(tdVal(x => x.text.trim())(columns)(4) || "", "DD-MM-YYYY").toDate() || undefined,
                amount: tdVal(x => {
                    const m = x.text.trim().replace(".", "").match(/[0-9]+,[0-9]{2}/i) || []
                    return m.length > 0 ? (parseFloat(m[0]) || undefined) : undefined
                })(columns)(5),
                paymentStatus: sixth()
            }
        })
    return {
        entries: entries
    }
}

const fetchTaxes = (cookie: StringPairDictionary) => (id: number): TE.TaskEither<Error, TaxEntryList> => pipe(
    fetchCareer(cookie)(id),
    TE.chain(_ => TE.tryCatch(
        () => followRedirect(taxesReq(cookie)),
        error => ({ name: "net_error", message: `${error}` }))
    ),
    TE.chain(ensureOk),
    TE.chain(ensureSession),
    TE.map(x => map(x.body))
)

export { fetchTaxes, TaxEntryList, TaxEntry, TaxEntryPaymentStatus }
