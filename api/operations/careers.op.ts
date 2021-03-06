import EX from 'express'
import { CareerList, fetchCareers } from "../net/careers"
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Fetch, handleError } from "../net"
import { extractToken } from "../net/auth"
import { getSecret } from "../utils/config"
import { pipe } from 'fp-ts/function'
import { format } from "../views/careers.view"

export const careersOp = (f: Fetch) => async (req: EX.Request, res: EX.Response): Promise<EX.Response> =>
    await TE.fold(
        (e: Error) => T.of(handleError(res)(e)),
        (c: CareerList) => T.of(format(c)(res))
    )
    (
        pipe(
            extractToken(req.headers)(getSecret()),
            TE.fromEither,
            TE.chain(token => fetchCareers(f)(token.cookie || {}))
        )
    )()
