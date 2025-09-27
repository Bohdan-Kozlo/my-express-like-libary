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
            const endpoint = router.endpoints[path];
            Object.keys(endpoint).forEach((method) => {
                this.#emitter.on(this.#getRouteMask(path, method), async (nativeReq, nativeRes) => {
                    const req = new Request(nativeReq);
                    const res = new Response(nativeRes);
                    try {
                        await req.parseBody();
                        await this.#middlewareManager.run(req, res, async (req, res) => {
                            return await Promise.resolve(endpoint[method](req, res));
                        });
                    } catch (err) {
                       res.statusCode(500).send({error: err.message || 'Internal Server Error'});
                    }
                });
            });
        })
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