import express from "express"
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { handleError } from "../net"
import { extractToken } from "../net/auth"
import { fetchCourses, Course } from "../net/courses"
import { getSecret } from "../utils/config"
import { pipe } from 'fp-ts/function'
import { format } from "../views/courses.view"

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
