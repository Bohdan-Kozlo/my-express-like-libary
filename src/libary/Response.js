class Response {
    constructor(res) {
        this.nativeRes = res;
        this.statusCode = 200;
    }

    status(code) {
        this.statusCode = code;
        this.nativeRes.statusCode = code;
        return this;
    }

    json(data) {
        this.setHeader("Content-Type", "application/json");
        this.nativeRes.end(JSON.stringify(data));
    }

    setHeader(name, value) {
        this.nativeRes.setHeader(name, value);
    }

    send(data) {
        if (typeof data === "object") {
            this.json(data);
        } else {
            this.nativeRes.end(String(data));
        }
    }

    redirect(url) {
        this.status(302);
        this.setHeader("Location", url);
        this.nativeRes.end();
    }
}

export default Response;