import { OpenAPIV3 } from 'openapi-types'

export const authDoc: OpenAPIV3.PathsObject = {
  '/auth': {
    post: {
      operationId: 'authOp',
      description: "get access token",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: 'object',
              properties: {
                usr: { type: 'string' },
                pwd: { type: 'string' }
              },
              required: ['usr', 'pwd']
            }
          },
          "application/x-www-form-urlencoded": {
            schema: {
              type: 'object',
              properties: {
                usr: { type: 'string' },
                pwd: { type: 'string' }
              },
              required: ['usr', 'pwd']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  access_token: { type: 'string' },
                  token_type: { type: 'string' }
                }
              },
              example: [{
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb29raWUiOnsiSlNFU1NJT05JRCI6IjI5MzE3NDdFNkE2NjNEN0JGODk3OEY0Nzg0NkI4RUNEIiwic2hpYl9pZHBfc2Vzc2lvbiI6IjBmMWJkOGEzNzVkOWE3ODEwOGZhYzI4ZTVmNmIxMjI2ZWVlNGIzYzIyNDBiOTJjYTAzNjdhOWY2ZWI1N2U2NjIiLCJfc2hpYnNlc3Npb25fNjU3MzczNjUzMzVmNzU2ZTY5NzA2OTY4NzQ3NDcwNzMzYTJmMmY3Nzc3NzcyZTczNzQ3NTY0NjU2ZTc0NjkyZTc1NmU2OTcwNjkyZTY5NzQyZjczNjg2OTYyNjI2ZjZjNjU3NDY4IjoiX2UyMjMyYjNmZGNkYjllNTZhNTdjOTMxNWU1NDFiNjUwIn0sImlhdCI6MTYzNDMzMTM5MH0.qL2Rgb7ofGGXhEPIPpL87QyruAx2caDFEHp91A9XLyw",
                "token_type": "Bearer"
              }]
            }
          }
        },
        401: {
          '$ref': '#/components/responses/UnauthorizedError'
        }
      }
    }
  }
}
