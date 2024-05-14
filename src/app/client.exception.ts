import { HttpException, HttpStatus } from '@nestjs/common'

// interface ErrorRecord {
//   code: number
//   message: string
//   status: HttpStatus
// }

// const ERRORS: ErrorRecord[] = [
//   {
//     code: 40001,
//     message: 'Incorrect phone number',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40002,
//     message: 'SMS service error',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40003,
//     message: 'Error calculating download link',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40004,
//     message: 'Error calculating upload link',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40005,
//     message: 'Error uploading file',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40006,
//     message: 'Incorrect profile name',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40007,
//     message: 'Login does not meet requirements',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40008,
//     message: 'Password does not meet requirements',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40009,
//     message: 'Similar id is not specified',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40010,
//     message: 'Illegal sorting method',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40011,
//     message: 'Illegal content type',
//     status: HttpStatus.BAD_REQUEST
//   },
//   {
//     code: 40101,
//     message: 'Code is incorrect',
//     status: HttpStatus.UNAUTHORIZED
//   },
//   {
//     code: 40102,
//     message: 'Password is incorrect',
//     status: HttpStatus.UNAUTHORIZED
//   },
//   {
//     code: 40301,
//     message: 'Impossible to delete someone else`s route',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40302,
//     message: 'Impossible to delete someone else`s track',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40303,
//     message: 'Can not update this profile',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40304,
//     message: 'Can not delete this profile',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40305,
//     message: 'No rights to set versions',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40306,
//     message: 'No rights to set links',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40307,
//     message: 'No rights to set surveys',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40308,
//     message: 'Impossible to delete someone else`s place',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40309,
//     message: 'Impossible to edit someone else`s place',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40310,
//     message: 'Impossible to edit someone else`s route',
//     status: HttpStatus.FORBIDDEN
//   },
//   {
//     code: 40401,
//     message: 'No such phone',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40402,
//     message: 'No such route',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40403,
//     message: 'No such track',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40404,
//     message: 'No such profile',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40405,
//     message: 'No versions in DB',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40406,
//     message: 'No such place',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40407,
//     message: 'No such survey',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40408,
//     message: 'No such scenario',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40409,
//     message: 'No such admin',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40410,
//     message: 'No such user',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40411,
//     message: 'No such moderator',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40412,
//     message: 'No such verifier',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40413,
//     message: 'No content owner',
//     status: HttpStatus.NOT_FOUND
//   },
//   {
//     code: 40901,
//     message: 'SMS too early',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40902,
//     message: 'This user is already exists',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40903,
//     message: 'This admin is already exists',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40904,
//     message: 'This moderator is already exists',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40905,
//     message: 'This verifier is already exists',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40906,
//     message: 'This route is already moderated',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40907,
//     message: 'This place is already moderated',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40908,
//     message: 'This route is already verified',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40909,
//     message: 'This place is already verified',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40910,
//     message: 'Impossible to wipe out moderated or verified route',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40911,
//     message: 'Impossible to wipe out moderated or verified place',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40912,
//     message: 'Impossible to review user`s own route',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 40913,
//     message: 'Impossible to review user`s own place',
//     status: HttpStatus.CONFLICT
//   },
//   {
//     code: 50000,
//     message: 'Unknown Error',
//     status: HttpStatus.INTERNAL_SERVER_ERROR
//   },
//   {
//     code: 50301,
//     message: 'SMS API not available',
//     status: HttpStatus.SERVICE_UNAVAILABLE
//   },
//   {
//     code: 50302,
//     message: 'Geocoding API not available',
//     status: HttpStatus.SERVICE_UNAVAILABLE
//   }
// ]

export enum ClientErrors {
  'Incorrect phone number' = 40001,
  'SMS service error' = 40002,
  'Error calculating download link' = 40003,
  'Error calculating upload link' = 40004,
  'Error uploading file' = 40005,
  'Incorrect profile name' = 40006,
  'Login does not meet requirements' = 40007,
  'Password does not meet requirements' = 40008,
  'Similar id is not specified' = 40009,
  'Illegal sorting method' = 40010,
  'Illegal content type' = 40011,
  'Code is incorrect' = 40101,
  'Password is incorrect' = 40102,
  'Impossible to delete someone else`s route' = 40301,
  'Impossible to delete someone else`s track' = 40302,
  'Can not update this profile' = 40303,
  'Can not delete this profile' = 40304,
  'No rights to set versions' = 40305,
  'No rights to set links' = 40306,
  'No rights to set surveys' = 40307,
  'Impossible to delete someone else`s place' = 40308,
  'Impossible to edit someone else`s place' = 40309,
  'Impossible to edit someone else`s route' = 40310,
  'No such phone' = 40401,
  'No such route' = 40402,
  'No such track' = 40403,
  'No such profile' = 40404,
  'No versions in DB' = 40405,
  'No such place' = 40406,
  'No such survey' = 40407,
  'No such scenario' = 40408,
  'No such admin' = 40409,
  'No such user' = 40410,
  'No such moderator' = 40411,
  'No such verifier' = 40412,
  'No content owner' = 40413,
  'No such notification' = 40414,
  'SMS too early' = 40901,
  'This user is already exists' = 40902,
  'This admin is already exists' = 40903,
  'This moderator is already exists' = 40904,
  'This verifier is already exists' = 40905,
  'This route is already moderated' = 40906,
  'This place is already moderated' = 40907,
  'This route is already verified' = 40908,
  'This place is already verified' = 40909,
  'Impossible to wipe out moderated or verified route' = 40910,
  'Impossible to wipe out moderated or verified place' = 40911,
  'Impossible to review user`s own route' = 40912,
  'Impossible to review user`s own place' = 40913,
  'Impossible to mark someone else`s notification as read' = 40914,
  'Unknown Error' = 50000,
  'SMS API not available' = 50301,
  'Geocoding API not available' = 50302
}

export class ClientException extends HttpException {
  constructor(code_: number, details?: string) {
    let message = 'Unknown Error'
    let code = 50000

    for (const errMessage of Object.keys(ClientErrors)) {
      if (ClientErrors[errMessage] === code_) {
        message = errMessage
        code = ClientErrors[errMessage]
        break
      }
    }

    const errorObj = super(
      code.toString(),
      HttpStatus.INTERNAL_SERVER_ERROR
    ) as unknown as HttpException

    console.error(
      '\x1b[31m[Client] - \x1b[37m',
      new Date().toLocaleString('en-EN'),
      '\x1b[31mERROR',
      '\x1b[33m[Exception Handler]\x1b[31m',
      message,
      '\x1b[37m'
    )
    if (details) {
      console.error(details)
    }
    console.error(errorObj.stack)
  }
}
