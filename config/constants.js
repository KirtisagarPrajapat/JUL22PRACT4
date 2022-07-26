
var path = require("path")

module.exports = {
    path : {
        model : path.join(__dirname, '../model/'),
        uploads : path.join(__dirname, '../uploads/'),
    },
    msg : {
        resSucc : "Responded successfully.",
        gotData : "Got data successfully.",
        noData : "No data found.",
        serverErr : "Internal server error.",
        invalidRoute : "Invalid route.",
        mailVerifySub : "Verify Account",
        mailForgetSub : "Forgot Password",
        mailVerifyHtml : "<h3>Hello {{NAME}}, Otp to verify your accout is <b>{{OTP}}</b>.</h3>",
        mailForgetHtml : "<h3>Hello {{NAME}}, Otp to reset your password is <b>{{OTP}}</b>.</h3>",
        registerSuccess : "You are registered successfully, an OTP is sent to your email and contact no. for verify you accout.",
        otpForgotSent : "Otp sent for reset password to your registered email and contact no. successfully.",
        otpSent : "Otp sent successfully.",
        verifiedSucc : "You are verified successfully.",
        wrongCredentials : "Incorrect email or password.",
        unvarified : "Your account is not verified.",
        loginSucc : "You are logged in successfully.",
        verifiedForgotPassOtpSucc : "You are verified successfully. Please enter new password to reset it.",
        passwordResetSuccess : "Password reset successful.",
        tokenAuthFailed : "Token authorization failed, Please login again.",
        profileUpdated : "Your profile updated successfully.",
    },
}