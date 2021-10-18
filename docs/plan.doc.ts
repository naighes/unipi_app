import { OpenAPIV3 } from 'openapi-types'

export const planDoc: OpenAPIV3.PathsObject = {
  '/{studentId}/plan': {
    get: {
      operationId: 'planOp',
      description: "get the student's plan",
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
          description: 'could not find a plan for the student'
        },
        200: {
          description: 'successful response',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    entries: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          code: { type: 'string', nullable: true },
                          name: { type: 'string', nullable: true },
                          weight: { type: 'integer', nullable: true },
                          status: { type: 'integer', nullable: true }
                        }
                      }
                    }
                  }
                }
              },
              example: [{
                  "name": "Attività Didattiche obbligatorie",
                  "entries": [
                    {
                      "code": "INF01",
                      "name": "TEST DI VALUTAZIONE DI INFORMATICA",
                      "weight": 2,
                      "status": 1
                    }
                  ]
                }, {
                  "name": "Attività Didattiche - Anno di Corso 1",
                  "entries": [{
                      "code": "723AA",
                      "name": "ALGEBRA LINEARE",
                      "weight": 6,
                      "status": 2
                    }, {
                      "code": "724AA",
                      "name": "ANALISI MATEMATICA",
                      "status": 3
                    }]
                  }
                ]
            }
          }
        }
      }
    }
  }
}
