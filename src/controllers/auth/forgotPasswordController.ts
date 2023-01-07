import { NextFunction, Request, Response } from "express";
import { sendProvideEmailError, sendRequestCouldNotBeCompletedError, sendUserAccountNotAvailableError } from "../../helpers/errors/commonAppAuthErrors";
import asyncHandler from "../../utils/asyncHandler";
import findUserByEmail from "../../utils/auth/findUserByEmail";
import { sendForgotPasswordOtp } from "../../utils/emails/auth/otp";
import sendSuccessApiResponse from "../../utils/response/sendSuccessApiResponse";

export default asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        
        const { email } = req.body;
        
        if (!email) next(sendProvideEmailError())

        const findUser = await findUserByEmail(email)

        if (!findUser) next(sendUserAccountNotAvailableError())
        
        // generate otp
        const otp = findUser.generateOtp()

        if (!(await findUser.save())) next(sendRequestCouldNotBeCompletedError())
        
        // send otp to users mail
         await sendForgotPasswordOtp({
            email: email,
            name: findUser.first_name,
            otp: otp
         })
        
        // send success response
        return sendSuccessApiResponse({
            res,
            statusCode: 200,
            message: "Successfully sent otp to users email",
            data: {}
        })
    }
)