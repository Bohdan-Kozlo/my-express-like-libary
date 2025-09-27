import http from "http";
import { EventEmitter } from "events";
import Request from "./Request.js";
import Response from "./Response.js";
import MiddlewareManager from "./MiddlewareManager.js";

class Application {
    #emitter;
    #server;
    #middlewareManager;
    #routes;

    constructor() {
        this.#emitter = new EventEmitter();
        this.#server = this.#createServer();
        this.#middlewareManager = new MiddlewareManager();
        this.#routes = [];
    }

    use(middleware) {
        this.#middlewareManager.use(middleware);
    }

    addRouter(router) {
        router.endpoints.forEach((endpoint) => {
            this.#routes.push(endpoint);

            const eventName = this.#getRouteMask(endpoint.path, endpoint.method);
            this.#emitter.on(eventName, async (nativeReq, nativeRes, params) => {
                await this.#handleRequest(nativeReq, nativeRes, endpoint.handler, params);
            });
        });
    }

    #handleRequest(nativeReq, nativeRes, routeHandler, params = {}) {
        return new Promise(async (resolve) => {
            const req = new Request(nativeReq);
            req.params = params;
            const res = new Response(nativeRes);

            try {
                await this.#processRequest(req, res, routeHandler);
                resolve();
            } catch (err) {
                await this.#handleRequestError(res, err);
                resolve();
            }
        });
    }

    #processRequest(req, res, routeHandler) {
        return new Promise(async (resolve, reject) => {
            try {
                await req.parseBody();
                await this.#middlewareManager.run(req, res, async (req, res) => {
                    return await Promise.resolve(routeHandler(req, res));
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    #handleRequestError(res, error) {
        return new Promise((resolve) => {
            try {
                res.status(500).send({ error: error.message || "Internal Server Error" });
                resolve();
            } catch {
                res.nativeRes.statusCode = 500;
                res.nativeRes.end("Internal Server Error");
                resolve();
            }
        });
    }

    listen(port, callback) {
        this.#server.listen(port, callback);
    }

    #createServer() {
        return http.createServer((req, res) => {
            const pathOnly = (req.url || "").split("?")[0];
            const method = req.method.toUpperCase();

            for (const route of this.#routes) {
                if (route.method !== method) continue;
                const params = route.matcher.match(pathOnly);
                if (params) {
                    const eventName = this.#getRouteMask(route.path, method);
                    this.#emitter.emit(eventName, req, res, params);
                    return;
                }
            }

            res.statusCode = 404;
            res.end(`Cannot ${method} ${req.url}`);
        });
    }

    #getRouteMask(path, method) {
        return `[${path}]:[${method}]`;
    }
}

export default Application;
