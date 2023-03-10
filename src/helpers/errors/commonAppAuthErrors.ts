import {
  sendBadRequestError,
  sendInternalServerError,
  sendUnAuthorizedError,
} from './commonAppErrors'

export const sendProvideUsernameError = () => {
  sendBadRequestError('Please provide username π')
}

export const sendProvideEmailError = () => {
  sendBadRequestError("Please provide user's email π")
}

export const sendProvideUsernameAndPasswordError = () => {
  sendBadRequestError('Please provide username and password π')
}

export const sendProvideUsernameAndOtpError = () => {
  sendBadRequestError('Please provide username and OTP π')
}

export const sendUserAccountNotAvailableError = () => {
  sendBadRequestError(
    "You don't have an account on this platform π, please proceed to signup"
  )
}

export const sendInvalidOtpError = () => {
  sendBadRequestError('Invalid OTP or OTP has expired π')
}

export const sendInvalidLoginCredentialsError = () => {
  sendBadRequestError('Invalid login credentials π')
}

export const sendUserAccountNotActiveError = () => {
  sendUnAuthorizedError(
    'Hello! please proceed to activate your account or contact admin for assistance π'
  )
}

export const sendRequestCouldNotBeCompletedError = () => {
  sendInternalServerError('Request could not be completed πplease try again!')
}

// export const sendAccountAlreadyVerifiedError = () => {
//   return new AppError([], 422);
// };
