import express from "express"
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { handleError } from "../net"
import { extractToken } from "../auth"
import { fetchCourses, Course } from "../sessions_calendar"
import { getSecret } from "../config"
import { pipe } from 'fp-ts/function'
import { format } from "../views/sessions_calendar.view"

export const coursesOp = async (req: express.Request, res: express.Response) => {
    const subject = req.params['subject']
    return await TE.fold(
        (e: Error) => T.of(handleError(res)(e)),
        (c: Array<Course>) => T.of(format(c)(res))
    )
    (
        pipe(
            extractToken(req.headers)(getSecret()),
            TE.fromEither,
            TE.chain(token => fetchCourses(token.cookie || {})(subject))
        )
    )()
}
