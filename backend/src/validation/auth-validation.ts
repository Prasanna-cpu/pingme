import Joi from "joi"

export const registerSchema = Joi.object({
    fullName : Joi.string().required().messages({
        "any.required" : "fullName is required"
    }),
    email : Joi.string().email().required().messages({
        "any.required" : "email is required"
    }),
    password : Joi.string().min(5).required().messages({
        "any.required" : "Password is required",
        "string.min" : "Password must be at least 5 characters"
    }),
    confirmPassword : Joi.string().valid(Joi.ref("password")).required().messages({
        "any.only" : "Confirm password must match password",
        "any.required" : "Confirm password is required"
    }),
    profilePic : Joi.string().optional().uri().messages({
        "string.uri": "Profile picture must be a valid URL"
    })
})


export const loginSchema = Joi.object({
    email : Joi.string().email().required().messages({
        "any.required" : "email is required"
    }),
    password : Joi.string().min(5).required().messages({
        "any.required" : "Password is required",
    })
})
