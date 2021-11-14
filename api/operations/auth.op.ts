import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { Fetch, handleError } from "../net"
import { fetchAuthReq } from "../net/auth"
import { getSecret } from "../utils/config"
import { sign } from 'jsonwebtoken'
import EX from 'express'

type AuthBody = {
    usr?: string
    pwd?: string
}

type AuthToken = {
    access_token: string
    token_type: string
}

export const authOp = (f: Fetch) => async (req: EX.Request<{}, {}, AuthBody>, res: EX.Response): Promise<EX.Response> =>
    await TE.fold(
        (e: Error) => T.of(handleError(res)(e)),
        (c: Record<string, string>) => {
            const token: AuthToken = {
                access_token: sign({ cookie: c }, getSecret()),
                token_type: "Bearer"
            }
            return T.of(res.status(200).json(token))
        }
    )
    (fetchAuthReq(f)(req.body?.usr || "", req.body?.pwd || ""))()
