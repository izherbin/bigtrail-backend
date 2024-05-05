import { HttpException, HttpStatus } from '@nestjs/common'

interface ErrorRecord {
  code: number
  message: string
  status: HttpStatus
}

const ERRORS: ErrorRecord[] = [
  {
    code: 40001,
    message: 'Incorrect phone number',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40002,
    message: 'SMS service error',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40003,
    message: 'Error calculating download link',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40004,
    message: 'Error calculating upload link',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40005,
    message: 'Error uploading file',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40006,
    message: 'Incorrect profile name',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40007,
    message: 'Login does not meet requirements',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40008,
    message: 'Password does not meet requirements',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40009,
    message: 'Similar id is not specified',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40010,
    message: 'Wrong sorting method',
    status: HttpStatus.BAD_REQUEST
  },
  {
    code: 40101,
    message: 'Code is incorrect',
    status: HttpStatus.UNAUTHORIZED
  },
  {
    code: 40102,
    message: 'Password is incorrect',
    status: HttpStatus.UNAUTHORIZED
  },
  {
    code: 40301,
    message: 'Impossible to delete someone else`s route',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40302,
    message: 'Impossible to delete someone else`s track',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40303,
    message: 'Can not update this profile',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40304,
    message: 'Can not delete this profile',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40305,
    message: 'No rights to set versions',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40306,
    message: 'No rights to set links',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40307,
    message: 'No rights to set surveys',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40308,
    message: 'Impossible to delete someone else`s place',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40309,
    message: 'Impossible to edit someone else`s place',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40310,
    message: 'Impossible to edit someone else`s route',
    status: HttpStatus.FORBIDDEN
  },
  {
    code: 40401,
    message: 'No such phone',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40402,
    message: 'No such route',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40403,
    message: 'No such track',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40404,
    message: 'No such profile',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40405,
    message: 'No versions in DB',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40406,
    message: 'No such place',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40407,
    message: 'No such survey',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40408,
    message: 'No such scenario',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40409,
    message: 'No such admin',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40410,
    message: 'No such user',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40411,
    message: 'No such moderator',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40412,
    message: 'No such verifier',
    status: HttpStatus.NOT_FOUND
  },
  {
    code: 40901,
    message: 'SMS too early',
    status: HttpStatus.CONFLICT
  },
  {
    code: 40902,
    message: 'This user is already exists',
    status: HttpStatus.CONFLICT
  },
  {
    code: 40903,
    message: 'This admin is already exists',
    status: HttpStatus.CONFLICT
  },
  {
    code: 40904,
    message: 'This moderator is already exists',
    status: HttpStatus.CONFLICT
  },
  {
    code: 40905,
    message: 'This verifier is already exists',
    status: HttpStatus.CONFLICT
  },
  {
    code: 40906,
    message: 'This route is already moderated',
    status: HttpStatus.CONFLICT
  },
  {
    code: 40907,
    message: 'This place is already moderated',
    status: HttpStatus.CONFLICT
  },
  {
    code: 40908,
    message: 'This route is already verified',
    status: HttpStatus.CONFLICT
  },
  {
    code: 40909,
    message: 'This place is already verified',
    status: HttpStatus.CONFLICT
  },
  {
    code: 50000,
    message: 'Unknown Error',
    status: HttpStatus.INTERNAL_SERVER_ERROR
  },
  {
    code: 50301,
    message: 'SMS API not available',
    status: HttpStatus.SERVICE_UNAVAILABLE
  },
  {
    code: 50302,
    message: 'Geocoding API not available',
    status: HttpStatus.SERVICE_UNAVAILABLE
  }
]

export class ClientException extends HttpException {
  constructor(code: number, details?: string) {
    let error = ERRORS.find((err) => err.code === code)
    if (!error) error = ERRORS.find((err) => err.code === 50000)

    const errorObj = super(
      error.code.toString(),
      error.status
    ) as unknown as HttpException

    console.error(
      '\x1b[31m[Client] - \x1b[37m',
      new Date().toLocaleString('en-EN'),
      '\x1b[31mERROR',
      '\x1b[33m[Exception Handler]\x1b[31m',
      error.message,
      '\x1b[37m'
    )
    if (details) {
      console.error(details)
    }
    console.error(errorObj.stack)
  }
}
