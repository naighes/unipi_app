import { OpenAPIV3 } from 'openapi-types'

export const planDoc: OpenAPIV3.PathsObject = {
  '/{careerId}/plan': {
    get: {
      operationId: 'planOp',
      description: "get the career's plan",
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
        406: {
          '$ref': '#/components/responses/NotAcceptable'
        },
        401: {
          '$ref': '#/components/responses/UnauthorizedError'
        },
        404: {
          description: 'could not find a plan for the career'
        },
        200: {
          description: 'successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  entries: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        planEntries: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              code: { type: 'string', nullable: true },
                              name: { type: 'string', nullable: true },
                              weight: { type: 'number', format: 'float', nullable: true },
                              status: { type: 'integer', nullable: true }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              example: {
                entries: [{
                  "name": "Attività Didattiche obbligatorie",
                  "planEntries": [
                    {
                      "code": "INF01",
                      "name": "TEST DI VALUTAZIONE DI INFORMATICA",
                      "weight": 2,
                      "status": 1
                    }
                  ]
                }, {
                  "name": "Attività Didattiche - Anno di Corso 1",
                  "planEntries": [{
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
}
