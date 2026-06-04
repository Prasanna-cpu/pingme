import client from "prom-client";
import {Request, Response, NextFunction} from "express";

const httpRequestCounter = new client.Counter({
    name : "http_requests_total",
    help : "Total number of HTTP requests",
    labelNames : ["method", "route", "status"]
})

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.5, 1, 2, 5],
});


const httpMetricRecorder = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        let finished = false;

        const record = () => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route?.path || req.path;

            httpRequestCounter.inc({
                method: req.method,
                route,
                status: res.statusCode,
            });

            httpRequestDuration.observe(
                {
                    method: req.method,
                    route,
                    status: res.statusCode,
                },
                duration
            );
        };

        res.on("finish", () => {
            finished = true;
            record();
        });

        res.on("close", () => {
            if (!finished) {
                //client disconnected early
                record();
            }
        });

        next();
    };
};

export default httpMetricRecorder