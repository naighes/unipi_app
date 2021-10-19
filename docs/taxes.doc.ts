import { OpenAPIV3 } from 'openapi-types'

export const taxesDoc: OpenAPIV3.PathsObject = {
  '/{studentId}/taxes': {
    get: {
      operationId: 'taxesOp',
      description: 'get a list of taxes for the student',
      parameters: [{
        in: 'path',
        name: 'studentId',
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
        404: {
          description: 'could not find taxes for the student'
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
                type: 'object',
                properties: {
                  entries: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        invoiceId: { type: 'string', nullable: true },
                        IUVcode: { type: 'string', nullable: true },
                        reason: { type: 'string', nullable: true },
                        description: { type: 'array', items: { type: 'string' } },
                        expirationDate: { type: 'string', format: 'date', nullable: true },
                        amount: { type: 'number', format: 'float', nullable: true },
                        paymentStatus: { type: 'integer', nullable: true }
                      }
                    }
                  }
                }
              },
              example: {
                "entries": [{
                  "invoiceId": "1234567",
                  "IUVcode": "000000012345678",
                  "reason": "RA121",
                  "description": [
                    "Matricola XXXXXX - Corso di Laurea - INFORMATICA ​",
                    "- Tasse di iscrizione laurea, laurea specialistica e magistrale A.A. 2021/2022 ​"
                  ],
                  "expirationDate": "2021-09-29T22:00:00.000Z",
                  "amount": 340,
                  "paymentStatus": 2
                },
                {
                  "invoiceId": "7654321",
                  "IUVcode": "000000087654321",
                  "reason": "RA420",
                  "description": [
                    "Matricola XXXXXX - Corso di Laurea - INFORMATICA ​",
                    "- Tasse di iscrizione laurea, laurea specialistica e magistrale A.A. 2020/2021 ​"
                  ],
                  "expirationDate": "2021-06-14T22:00:00.000Z",
                  "amount": 734,
                  "paymentStatus": 1
                }]
              }
            }
          }
        }
      }
    }
  }
}
