import { OpenAPIV3 } from 'openapi-types'

export const careersDoc: OpenAPIV3.PathsObject = {
  '/careers': {
    get: {
      operationId: 'careersOp',
      description: 'get a list of subcribed courses',
      security: [{
        bearerAuth: []
      }],
      responses: {
        401: {
          '$ref': '#/components/responses/UnauthorizedError'
        },
        406: {
          '$ref': '#/components/responses/NotAcceptable'
        },
        200: {
          description: 'successful response',
          content: {
            'text/html': { },
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    registrationNumber: { type: 'string', nullable: true },
                    type: { type: 'string', nullable: true },
                    name: { type: 'string', nullable: true },
                    active: { type: 'boolean', nullable: true },
                    careerId: { type: 'integer', nullable: true }
                  }
                }
              },
              example: [{
                  "registrationNumber": "777777",
                  "type": "Diploma Universitario",
                  "name": "INGEGNERIA LOGISTICA E DELLA PRODUZIONE",
                  "active": false,
                  "careerId": 9999999
                }, {
                  "registrationNumber": "11111111",
                  "type": "Corso di Laurea",
                  "name": "INFORMATICA",
                  "active": true,
                  "careerId": 8888888
                }]
            }
          }
        }
      }
    }
  }
}
