import { OpenAPIV3 } from 'openapi-types'
import { bookletDoc } from './booklet.doc'
import { careersDoc } from './careers.doc'
import { taxesDoc } from './taxes.doc'
import { planDoc } from './plan.doc'
import { coursesDoc } from './courses.doc'
import { authDoc } from './auth.doc'
import { userDetailsDoc } from './user_details.doc'

export const apiDoc: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'unipi-api',
    version: '0.0.1',
  },
  components: {
    responses: {
      'UnauthorizedError': {
        description: "access token is missing or invalid",
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                message: {
                  type: 'string'
                }
              }
            },
            example: {
              "name": "invalid_token",
              "message": "wrong_credentials"
            }
          }
        }
      },
      'NotAcceptable': {
        description: "this resource cannot be served by the requested format"
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
    ...authDoc,
    ...userDetailsDoc
  }
}
