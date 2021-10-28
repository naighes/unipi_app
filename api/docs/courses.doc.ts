import { OpenAPIV3 } from 'openapi-types'

export const coursesDoc: OpenAPIV3.PathsObject = {
  '/courses/{path}/{subject}/calendar': {
    get: {
      operationId: 'coursesOp',
      description: 'get a list of exam sessions for a subject',
      parameters: [{
        in: 'path',
        name: 'subject',
        required: true,
        schema: {
          type: 'string'
        }
      }, {
        in: 'path',
        name: 'path',
        required: true,
        schema: {
          type: 'string'
        }
      }],
      security: [{
        bearerAuth: []
      }],
      responses: {
        406: {
          '$ref': '#/components/responses/NotAcceptable'
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
                    academicYear: { type: 'string', nullable: true },
                    subject: { type: 'string', nullable: true },
                    code: { type: 'string', nullable: true },
                    weight: { type: 'integer', nullable: true },
                    teacher: { type: 'string', nullable: true },
                    calls: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string', nullable: true },
                          date: { type: 'string', format: 'date', nullable: true },
                          location: { type: 'string', nullable: true },
                          notes: { type: 'string', nullable: true },
                          subscriptions: { type: 'integer', nullable: true },
                          oldSystem: { type: 'string', nullable: true },
                          openingDates: { type: 'string', format: 'date', nullable: true },
                          closingDates: { type: 'string', format: 'date', nullable: true }
                        }
                      }
                    }
                  }
                }
              },
              example: [{
                "academicYear": "2020/21",
                "subject": "ALGEBRA LINEARE (A)",
                "code": "723AA",
                "weight": 6,
                "teacher": "MARIO ROSSI",
                "calls": [{
                    "type": "misto - da remoto",
                    "date": "2021-10-27T07:00:00.000Z",
                    "location": "aula virtuale",
                    "notes": "",
                    "subscriptions": 1,
                    "oldSystem": "",
                    "openingDates": "2021-09-27T07:00:00.000Z",
                    "closingDates": "2021-10-12T21:59:00.000Z"
                  }, {
                    "type": "misto - da remoto",
                    "date": "2021-10-27T07:00:00.000Z",
                    "location": "aula virtuale",
                    "notes": "",
                    "subscriptions": 13,
                    "oldSystem": "585AA - Matematica discreta e algebra lineare A",
                    "openingDates": "2021-09-26T22:00:00.000Z",
                    "closingDates": "2021-10-12T21:59:00.000Z"
                  }
                ]
              }]
            }
          }
        }
      }
    }
  }, 
  '/courses': {
    get: {
      operationId: 'pathsOp',
      description: 'get a list of available courses',
      responses: {
        406: {
          '$ref': '#/components/responses/NotAcceptable'
        },
        200: {
          description: 'successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: {
                  type: 'string'
                }
              },
              example: {
                "WAR-LM": "ARCHEOLOGIA  (Magistrale)",
                "WAI-LM": "ARTIFICIAL INTELLIGENCE AND DATA ENGINEERING (Magistrale)",
                "WBF-LM": "BANCA, FINANZA AZIENDALE E MERCATI FINANZIARI (Magistrale)"
              }
            }
          }
        }
      }
    }
  }
}
