import express from "express"
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import { handleError } from "../net"
import { extractToken } from "../net/auth"
import { fetchTaxes, TaxEntryList } from "../net/taxes"
import { getSecret } from "../utils/config"
import { pipe } from 'fp-ts/function'
import { format } from "../views/taxes.view"

const parseCareerId = (r: express.Request) => {
    const n = parseInt(r.params['careerId'] || "")
    return isNaN(n)
        ? E.left({ name: "not_found", message: "resource could not be found" })
        : E.right(n)
}

export const taxesOp = async (req: express.Request, res: express.Response) => await TE.fold(
    (e: Error) => T.of(handleError(res)(e)),
    (c: TaxEntryList) => T.of(format(c)(res))
)
(
    pipe(
        parseCareerId(req),
        E.chain(id => pipe(
            extractToken(req.headers)(getSecret()),
            E.map(token => ({ id: id, token: token})))
        ),
        TE.fromEither,
        TE.chain(r => fetchTaxes(r.token.cookie || {})(r.id))
    )
)()
