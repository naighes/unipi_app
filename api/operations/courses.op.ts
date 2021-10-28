import EX from 'express'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { handleError, StringPairDictionary } from "../net"
import { extractToken } from "../net/auth"
import { fetchCourses, Course, fetchPaths } from "../net/courses"
import { getSecret } from "../utils/config"
import { pipe } from 'fp-ts/function'
import { formatCourses, formatPaths } from "../views/courses.view"

const pathsOp = async (_: EX.Request, res: EX.Response): Promise<EX.Response> =>
    await TE.fold(
        (e: Error) => T.of(handleError(res)(e)),
        (c: StringPairDictionary) => T.of(formatPaths(c)(res))
    )
    (
        pipe(
            fetchPaths()
        )
    )()

const coursesOp = async (req: EX.Request, res: EX.Response): Promise<EX.Response> =>
    await TE.fold(
        (e: Error) => T.of(handleError(res)(e)),
        (c: Array<Course>) => T.of(formatCourses(c)(res))
    )
    (
        pipe(
            extractToken(req.headers)(getSecret()),
            TE.fromEither,
            TE.chain(token => fetchCourses(token.cookie || {})(req.params['subject'])(req.params['path']))
        )
    )()

export { coursesOp, pathsOp }
