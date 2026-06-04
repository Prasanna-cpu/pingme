import rateLimit from "express-rate-limit";

const standardRateLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    standardHeaders : true,
    legacyHeaders : false,
    max: 1000
})

export default standardRateLimiter;