import express from "express"
import { Career, fetchCareers } from "../net/careers"
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { handleError } from "../net"
import { extractToken } from "../net/auth"
import { getSecret } from "../utils/config"
import { pipe } from 'fp-ts/function'
import { format } from "../views/careers.view"

export const careersOp = async (req: express.Request, res: express.Response) => {
    return await TE.fold(
        (e: Error) => T.of(handleError(res)(e)),
        (c: Array<Career>) => T.of(format(c)(res))
    )
    (
        pipe(
            extractToken(req.headers)(getSecret()),
            TE.fromEither,
            TE.chain(token => fetchCareers(token.cookie || {}))
        )
    )()
}
