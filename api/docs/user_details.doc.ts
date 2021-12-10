import { OpenAPIV3 } from 'openapi-types'

export const userDetailsDoc: OpenAPIV3.PathsObject = {
  '/{careerId}/user/details': {
    get: {
      operationId: 'userDetailsOp',
      description: "get the user's details",
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
          description: 'could not find the user details for the career'
        },
        200: {
          description: 'successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', nullable: true },
                  pictureURL: { type: 'string', nullable: true },
                  residentialAddress: { type: 'string', nullable: true },
                  livingAddress: { type: 'string', nullable: true },
                  email: { type: 'string', nullable: true },
                  internalEmail: { type: 'string', nullable: true },
                  phone: { type: 'string', nullable: true }
                }
              },
              example: {
                "fullName": "Mario Rossi",
                "pictureURL": "http://picture.shost/picture.png",
                "residentialAddress": "Via Giuseppe Verdi, 1",
                "livingAddress": "Via Antonio Vivaldi, 2",
                "email": "youremail@emailhos.tcom",
                "internalEmail": "youremail@studenti.unipi.it",
                "phone": "+39 311000000"
              }
            }
          }
        }
      }
    }
  }
}
