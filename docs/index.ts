import { OpenAPIV3 } from 'openapi-types'
import { bookletDoc } from './booklet.doc'
import { careersDoc } from './careers.doc'
import { taxesDoc } from './taxes.doc'
import { planDoc } from './plan.doc'
import { coursesDoc } from './sessions_calendar.doc'
import { authDoc } from './auth.doc'

export const apiDoc: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'unipi-api',
    version: '0.0.1',
  },
  components: {
    responses: {
      'UnauthorizedError': {
        description: "access token is missing or invalid"
      }
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    }
  },
  paths: {
    ...careersDoc,
    ...bookletDoc,
    ...taxesDoc,
    ...planDoc,
    ...coursesDoc,
    ...authDoc
  }
}
