import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { handleError, StringPairDictionary } from "../net"
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

export const authOp = async (req: EX.Request<{}, {}, AuthBody>, res: EX.Response): Promise<EX.Response> =>
    await TE.fold(
        (e: Error) => T.of(handleError(res)(e)),
        (c: StringPairDictionary) => {
            const token: AuthToken = {
                access_token: sign({ cookie: c }, getSecret()),
                token_type: "Bearer"
            }
            return T.of(res.status(200).json(token))
        }
    )
    (fetchAuthReq(req.body?.usr || "", req.body?.pwd || ""))()
