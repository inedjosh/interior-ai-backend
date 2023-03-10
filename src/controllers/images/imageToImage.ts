import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import configs from '../../config/config'
import { postRequest } from '../../helpers/apiRequests'
import {
  sendBadRequestError,
  sendUnProcessableEntityError,
} from '../../helpers/errors/commonAppErrors'
import getErrorMessagesFromArray from '../../helpers/getErrorMessagesFromArray'
import { uploadImage } from '../../services/cloudinary'
import asyncHandler from '../../utils/asyncHandler'
import logger from '../../utils/logger'
import sendSuccessApiResponse from '../../utils/response/sendSuccessApiResponse'
import findUserByEmail from '../../utils/auth/findUserByEmail'
import { sendUserAccountNotAvailableError } from '../../helpers/errors/commonAppAuthErrors'
import checkTrials from '../../utils/image/checkTrials'
import { createOneFactory } from '../../utils/factories/factories'
import ImageModel from '../../models/Image'

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const errorMessages = getErrorMessagesFromArray(errors.array())
      next(sendBadRequestError(errorMessages))
    }

    if (req.body.user.email !== req.body.email)
      return next(
        sendBadRequestError('Authentication failed, log in and try again')
      )

    const { email } = req.body

    const user = await findUserByEmail(email)

    if (!user) return next(sendUserAccountNotAvailableError())

    const checkTrial = checkTrials(user.trials)

    if (!checkTrial)
      return next(
        sendBadRequestError(
          'You do not have enough trials to generate an image, purchase and try again'
        )
      )

    const image_url = await uploadImage(req.body.image)

    const img_data = {
      key: configs.STABLE_DIFFUSION_KEY,
      prompt: 'a cat sitting on a bench',
      negative_prompt: null,
      init_image: image_url,
      width: '512',
      height: '512',
      samples: '1',
      num_inference_steps: '30',
      guidance_scale: 7.5,
      strength: 0.7,
      seed: null,
      webhook: null,
      track_id: null,
    }

    const result = await postRequest({
      endpoint: 'https://stablediffusionapi.com/api/v3/img2img',
      data: { ...img_data },
    })

    if (
      !(await createOneFactory({
        model: ImageModel,
        fields: {
          userId: user._id,
          imageUrl: result.data.output[0],
        },
      }))
    ) {
      return next(
        sendUnProcessableEntityError('Something went wrong, request failed')
      )
    }

    user.trials -= 1

    if (!(await user.save()))
      return next(
        sendUnProcessableEntityError('Something went wrong, request failed')
      )

    return sendSuccessApiResponse({
      res,
      statusCode: 200,
      message: 'Successfully generated image',
      data: {
        image_url: result.data.output,
        generationTime: result.data.generationTime,
        meta: result.data.meta,
      },
    })
  }
)
