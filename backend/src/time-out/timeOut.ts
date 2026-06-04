import express , {Request, Response, NextFunction} from "express";

export const requestTimeout = (ms : number) => {
    return (req: Request, res : Response, next : NextFunction) => {
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                res.status(503).json({ error: "Request timed out" });
            }
        }, ms as number);

        // Clear timeout when response finishes
        res.on("finish", () => clearTimeout(timer));
        res.on("close", () => clearTimeout(timer));

        next();
    }
}