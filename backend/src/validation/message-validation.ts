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
}).custom((value, helpers) => {
    if(!value.text && !value.image){
        return helpers.error('any.required', { message: 'A message must have either text or image' });
    }
    return value
})