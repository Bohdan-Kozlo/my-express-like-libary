import http from 'http';
import {EventEmitter} from "events";
import Request from './Request.js';
import Response from './Response.js';
import MiddlewareManager from './MiddlewareManager.js';

class Application {
    #emitter;
    #server;
    #middlewareManager;

    constructor() {
        this.#emitter = new EventEmitter();
        this.#server = this.#createServer();
        this.#middlewareManager = new MiddlewareManager();
    }

    use(middleware) {
        this.#middlewareManager.use(middleware);
    }

    addRouter(router) {
        Object.keys(router.endpoints).forEach((path) => {
            this.#registerRouteEndpoints(path, router.endpoints[path]);
        });
    }

    #registerRouteEndpoints(path, endpoint) {
        Object.keys(endpoint).forEach((method) => {
            const routeHandler = endpoint[method];
            const eventName = this.#getRouteMask(path, method);
            
            this.#emitter.on(eventName, async (nativeReq, nativeRes) => {
                await this.#handleRequest(nativeReq, nativeRes, routeHandler);
            });
        });
    }

    #handleRequest(nativeReq, nativeRes, routeHandler) {
        return new Promise(async (resolve, reject) => {
            const req = new Request(nativeReq);
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
                res.status(500).send({error: error.message || 'Internal Server Error'});
                resolve();
            } catch (sendError) {
                // Fallback if res.send fails
                res.res.statusCode = 500;
                res.res.end('Internal Server Error');
                resolve();
            }
        });
    }

    listen(port, callback) {
        this.#server.listen(port, callback);
    }

    #createServer() {
        return http.createServer((req, res) => {
            const pathOnly = (req.url || '').split('?')[0];
            const emitted = this.#emitter.emit(this.#getRouteMask(pathOnly, req.method), req, res);
            if (!emitted) {
                res.statusCode = 404;
                res.end(`Cannot ${req.method} ${req.url}`);
            }
        })
    }

    #getRouteMask(path, method) {
        return `[${path}]:[${method}]`
    }
}

export default Application;