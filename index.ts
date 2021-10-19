import EX from 'express'
import { careersOp, bookletOp, taxesOp, coursesOp, authOp, planOp } from './operations'
import { apiDoc } from './docs'
import { initialize } from 'express-openapi'
import { config, getSecret } from './utils/config'
import type { ErrorRequestHandler } from "express"
import bodyParser from 'body-parser'

const app = EX()
app.use(EX.json())
app.use(bodyParser.urlencoded({ extended: true }))

initialize({
    apiDoc: apiDoc,
    app: app,
    operations: {
        careersOp,
        bookletOp,
        taxesOp,
        planOp,
        coursesOp,
        authOp
    },
    promiseMode: true
})

const safe = (f: (_req: EX.Request, _res: EX.Response) => Promise<EX.Response>) => async (req: EX.Request, res: EX.Response, next: EX.NextFunction) => {
    try {
        return await f(req, res)
    } catch (e) {
        return next(e)
    }
}

app.get('/:studentId/plan', safe(planOp))
app.get('/courses/:subject/calendar', safe(coursesOp))
app.get('/:studentId/taxes', safe(taxesOp))
app.get('/:studentId/booklet', safe(bookletOp))
app.get('/careers', safe(careersOp))
app.post('/auth', safe(authOp))

const errorHandler: ErrorRequestHandler = (err, _, res, _next) => res.status(500).send({
    name: "unhandled error",
    message: err && (typeof err === 'object' || Array.isArray(err)) ? err : `${err}`
})

app.use(errorHandler)

const cfg = config()
const port = cfg.port || 3000
// ensure secret
getSecret()

app.listen(port, () => {
    console.log(`unipi-api listening at http://localhost:${port}`)
})
