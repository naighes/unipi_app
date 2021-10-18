import express from "express"
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { handleError, StringPairDictionary } from "../net"
import { fetchAuthReq } from "../auth"
import { getSecret } from "../config"
import { sign } from 'jsonwebtoken'

type AuthBody = {
    usr?: string
    pwd?: string
}

export const authOp = async (req: express.Request<{}, {}, AuthBody>, res: express.Response) => TE.fold(
    (e: Error) => T.of(handleError(res)(e)),
    (c: StringPairDictionary) => T.of(res.status(200).json({
        access_token: sign({ cookie: c }, getSecret()),
        token_type: "Bearer"
    }))
)
(fetchAuthReq(req.body?.usr || "", req.body?.pwd || ""))()
