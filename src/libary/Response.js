class Response {
    constructor(res) {
        this.res = res;
        this.statusCode = 200;
    }

    status(code) {
        this.statusCode = code;
        this.res.statusCode = code;
        return this;
    }

    json(data) {
        this.setHeader("Content-Type", "application/json");
        this.res.end(JSON.stringify(data));
    }

    setHeader(name, value) {
        this.res.setHeader(name, value);
    }

    send(data) {
        if (typeof data === "object") {
            this.json(data);
        } else {
            this.res.end(String(data));
        }
    }

    redirect(url) {
        this.status(302);
        this.setHeader("Location", url);
        this.res.end();
    }
}

export default Response;