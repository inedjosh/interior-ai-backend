import { NextFunction, Request, Response } from 'express'
import { sendUnAuthorizedError } from '../helpers/errors/commonAppErrors'
import asyncHandler from '../utils/asyncHandler'
import logger from '../utils/logger'
import { verifyJwt } from '../utils/auth/jwt'
import configs from '../config/config'

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers['authorization']

      if (!authHeader) {
        return next(
          sendUnAuthorizedError(
            'Could not authenticate, please login and try again.'
          )
        )
      }

      const token = authHeader.split(' ')[1]

      const decoded: any = await verifyJwt(token, configs.JWT_ACCESS_SECRET)

      if (!decoded)
        return next(
          sendUnAuthorizedError(
            'Request could not be authorized, please login again.'
          )
        )

      req.body.user = decoded

      next()
    } catch (error) {
      return next(
        sendUnAuthorizedError(
          'Request could not be authorized, please login again.'
        )
      )
    }
  }
)
