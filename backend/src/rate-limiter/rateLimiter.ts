import rateLimit from "express-rate-limit";
import {NextFunction, Response, Request} from "express";
import {trace} from "joi";

const blockedUserAgents = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /httpclient/i,
    /libwww-perl/i,
    /nikto/i,
    /sqlmap/i,
    /nmap/i,
    /masscan/i
];

const dangerousMongoOperators = new Set([
    "$eq",
    "$ne",
    "$gt",
    "$gte",
    "$lt",
    "$lte",
    "$in",
    "$nin",
    "$or",
    "$and",
    "$nor",
    "$not",
    "$exists",
    "$type",
    "$regex",
    "$expr",
    "$jsonSchema",
    "$mod",
    "$all",
    "$elemMatch",
    "$size",
    "$where",
    "$function",
    "$accumulator",
    "$lookup",
    "$graphLookup",
    "$merge",
    "$out",
    "$rename",
    "$set",
    "$unset",
    "$inc",
    "$mul",
    "$min",
    "$max",
    "$push",
    "$pull",
    "$pullAll",
    "$addToSet",
    "$pop"
]);

const suspiciousPatterns = [
    /\.\./,
    /<script/i,
    /union\s+select/i,
    /select\s+.*\s+from/i,
    /insert\s+into/i,
    /drop\s+table/i,
    /etc\/passwd/i,
    /wp-admin/i,
    /wp-login/i,
    /\.env/i,
    /phpmyadmin/i
];

const hasDangerousMongoKeys = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return false;
    }

    if (Array.isArray(value)) {
        return value.some((item) => hasDangerousMongoKeys(item));
    }

    if (typeof value !== "object") {
        return false;
    }

    return Object.entries(value as Record<string, unknown>).some(([key, nestedValue]) => {
        const normalizedKey = key.trim();

        if (
            normalizedKey.startsWith("$") ||
            normalizedKey.includes(".") ||
            dangerousMongoOperators.has(normalizedKey)
        ) {
            return true;
        }

        return hasDangerousMongoKeys(nestedValue);
    });
};

export const botUserAgentBlocker = (
    req : Request,
    res : Response,
    next : NextFunction
) => {
    const userAgent = req.get("user-agent")

    if(!userAgent || blockedUserAgents.some(pattern => pattern.test(userAgent))){
        return res.status(403).json({
            status : res.statusCode,
            message : "Forbidden: Bot user agents are not allowed"
        })
    }

    next();
}

export const suspiciousRequestBlocker = (
    req : Request,
    res : Response,
    next : NextFunction
) => {
    const target = `${req.originalUrl} ${JSON.stringify(req.body ?? {})}`;
    if(suspiciousPatterns.some(pattern => pattern.test(target))){
        return res.status(403).json({
            status : res.statusCode,
            message : "Forbidden access to suspicious request"
        })
    }

    if(hasDangerousMongoKeys(req.body) || hasDangerousMongoKeys(req.query) || hasDangerousMongoKeys(req.params)){
        return res.status(403).json({
            status : res.statusCode,
            message : "Forbidden access to request with dangerous MongoDB operators"
        })
    }

    next();
}

export const authRateLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    standardHeaders : true,
    legacyHeaders : false,
    skipSuccessfulRequests : true,
    limit : 10,
    message : {
        message: "Too many authentication attempts. Please try again later."
    }
})

export const sensitiveActionRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many sensitive requests. Please slow down."
    }
});


const standardRateLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    standardHeaders : true,
    legacyHeaders : false,
    max: 1000
})

export default standardRateLimiter;