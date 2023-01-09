import { NextFunction, Request, Response } from 'express'
import configs from '../../config/config'
import { postRequest } from '../../helpers/apiRequests'
import { sendBadRequestError } from '../../helpers/errors/commonAppErrors'
import { uploadImage } from '../../services/cloudinary'
import asyncHandler from '../../utils/asyncHandler'
import logger from '../../utils/logger'
import sendSuccessApiResponse from '../../utils/response/sendSuccessApiResponse'

export default asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const image_url = await uploadImage(req.body.image)
  
    if(req.body.user.email !== req.body.email) return next(sendBadRequestError('Authentication failed, log in and try again'))

    const img_data = {
        "key": configs.STABLE_DIFFUSION_KEY,
        "prompt": "ultra realistic close up portrait ((beautiful pale cyberpunk female with heavy black eyeliner)), blue eyes, shaved side haircut, hyper detail, cinematic lighting, magic neon, dark red city, Canon EOS R3, nikon, f/1.4, ISO 200, 1/160s, 8K, RAW, unedited, symmetrical balance, in-frame, 8K",
        "negative_prompt": "((out of frame)), ((extra fingers)), mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), (((tiling))), ((naked)), ((tile)), ((fleshpile)), ((ugly)), (((abstract))), blurry, ((bad anatomy)), ((bad proportions)), ((extra limbs)), cloned face, (((skinny))), glitchy, ((extra breasts)), ((double torso)), ((extra arms)), ((extra hands)), ((mangled fingers)), ((missing breasts)), (missing lips), ((ugly face)), ((fat)), ((extra legs)), anime",
        "width": "512",
        "height": "512",
        "samples": "1",
        "num_inference_steps": "20",
        "seed": null,
        "guidance_scale": 7.5,
        "webhook": null,
        "track_id": null
        }

    const result = await postRequest({
        endpoint: 'https://stablediffusionapi.com/api/v3/text2img',
        data: { ...img_data },
    })


    return sendSuccessApiResponse({
      res,
      statusCode: 200,
      message: 'Successfully generated image',
      data: { data: result },
    })
  }
)
