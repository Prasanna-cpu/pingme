import Joi from "joi"

export const messageSchema = Joi.object({
    text: Joi.string().optional().messages({
        'string.base': 'Text must be a string',
        'string.empty': 'Text cannot be empty'
    }),
    image: Joi.string().uri().optional().messages({
        'string.base': 'Image must be a string',
        'string.uri': 'Image must be a valid URI'
    })
})