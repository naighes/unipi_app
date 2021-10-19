import { OpenAPIV3 } from 'openapi-types'

export const bookletDoc: OpenAPIV3.PathsObject = {
  '/{careerId}/booklet': {
    get: {
      operationId: 'bookletOp',
      description: 'get a list of book entries for a career',
      parameters: [{
          in: 'path',
          name: 'careerId',
          required: true,
          schema: {
            type: 'integer'
          }
      }],
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
        404: {
          description: 'could not find a booklet for the career'
        },
        200: {
          description: 'successful response',
          content: {
            'text/html': { },
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  records: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', nullable: true },
                        name: { type: 'string', nullable: true },
                        year: { type: 'integer', nullable: true },
                        weight: { type: 'integer', format: 'float', nullable: true },
                        academicYear: { type: 'string', nullable: true },
                        score: { type: 'integer', nullable: true },
                        date: { type: 'string', format: 'date', nullable: true },
                        status: { type: 'integer', nullable: true }
                      }
                    }
                  },
                  average: { type: 'number' },
                  collectedCredits: { type: 'integer' }
                }
              },
              example: {
                "records": [
                  {
                    "code": "728AA",
                    "name": "FONDAMENTI DELL'INFORMATICA",
                    "year": 1,
                    "weight": 9.0,
                    "academicYear": "2020/2021",
                    "score": 28,
                    "date": "2021-01-14T23:00:00.000Z",
                    "status": 3
                  },
                  {
                    "code": "731AA",
                    "name": "LABORATORIO I",
                    "year": 1,
                    "weight": 12.0,
                    "academicYear": "2020/2021",
                    "score": 30,
                    "date": "2021-09-09T22:00:00.000Z",
                    "status": 3
                  },
                  {
                    "code": "735AA",
                    "name": "PROGRAMMAZIONE E ALGORITMICA",
                    "year": 1,
                    "weight": 15.0,
                    "academicYear": "2020/2021",
                    "score": 25,
                    "date": "2020-10-25T23:00:00.000Z",
                    "status": 3
                  }
                ],
                "average": 27.66,
                "collectedCredits": 36
              }
            }
          }
        }
      }
    }
  }
}
