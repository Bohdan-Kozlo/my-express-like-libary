import RouteMatcher from "./RouteMatcher.js";

class Router {
    #endpoints;

    constructor() {
        this.#endpoints = [];
    }

    get endpoints() {
        return this.#endpoints;
    }

    request(method, path, handler) {
        const matcher = new RouteMatcher(path);

        this.#endpoints.push({
            method: method.toUpperCase(),
            path,
            matcher,
            handler
        });
    }

    get(path, handler) {
        this.request("GET", path, handler);
    }

    post(path, handler) {
        this.request("POST", path, handler);
    }

    put(path, handler) {
        this.request("PUT", path, handler);
    }

    delete(path, handler) {
        this.request("DELETE", path, handler);
    }
}

export default Router;
