import EX from 'express'
import { careersOp, bookletOp, taxesOp, coursesOp, authOp, planOp, pathsOp } from './operations'
import { apiDoc } from './docs'
import { initialize } from 'express-openapi'
import { config, getSecret } from './utils/config'
import moment from 'moment'

const app = EX()
app.use((req: EX.Request, res: EX.Response, next: EX.NextFunction)=> {
    console.log(`${req.hostname} - - ${moment().format("DD/MMM/YYYY:hh:mm")} "${req.method} ${req.path}" ${res.statusCode} -`)
    next()
})
app.use(EX.urlencoded())
app.use(EX.json())

initialize({
    apiDoc: apiDoc,
    app: app,
    operations: {
        careersOp,
        bookletOp,
        taxesOp,
        planOp,
        coursesOp,
        pathsOp,
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

app.get('/:careerId/plan', safe(planOp))
app.get('/courses/:path/:subject/calendar', safe(coursesOp))
app.get('/courses', safe(pathsOp))
app.get('/:careerId/taxes', safe(taxesOp))
app.get('/:careerId/booklet', safe(bookletOp))
app.get('/careers', safe(careersOp))
app.post('/auth', safe(authOp))

const errorHandler: EX.ErrorRequestHandler = (err, _, res, _next) => {
    if (err) {
        console.log(err)
    }
    const tryParseStatus = () => err && err.status && typeof err.status === 'number' ? parseInt(err.status) : 500
    const tryParseMessage = () => {
        if (err && typeof err === 'object') {
            return err.errors ? err.errors : err
        }
        if (Array.isArray(err)) {
            return err
        }
        return `${err}`
    }
    return res.status(tryParseStatus()).send({
        name: "unhandled_error",
        message: tryParseMessage()
    })
}

app.use(errorHandler)

const cfg = config()
const port = cfg.port || 3000
// ensure secret
getSecret()

app.listen(port, () => {
    console.log(`unipi-api listening at http://localhost:${port}`)
})
