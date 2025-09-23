import {parse as parseQueryString} from 'querystring';

class Request {
    constructor(nativeReq) {
        this.native = nativeReq;
        this.method = nativeReq.method;
        this.url = nativeReq.url;
        this.headers = nativeReq.headers || {};
        this.body = null;
        this.rawBody = '';
        const rawUrl = this.url;
        const [pathOnly, queryString = ''] = rawUrl.split('?', 2);
        this.path = pathOnly || '/';
        this.query = queryString ? parseQueryString(queryString) : {};
    }

    async parseBody() {
        const method = (this.method || '').toUpperCase();
        if (!this.#canHaveBody(method)) return;

        if (this.#isEmptyBodyByContentLength()) {
            this.body = null;
            this.rawBody = '';
            return;
        }

        const { buffer, raw } = await this.#readRequestBody();
        this.rawBody = raw;

        const contentType = this.#getContentType();

        try {
            this.#parseBasedOnType(contentType, raw, buffer);
        } catch (e) {
            this.body = null;
            this.bodyParseError = e;
        }
    }

    #canHaveBody(method) {
        return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    }

    #isEmptyBodyByContentLength() {
        const contentLength = Number(this.headers['content-length'] || 0);
        return !Number.isNaN(contentLength) && contentLength === 0;
    }

    async #readRequestBody() {
        const chunks = [];
        await new Promise((resolve, reject) => {
            this.native.on('data', chunk => chunks.push(Buffer.from(chunk)));
            this.native.on('end', () => resolve());
            this.native.on('error', err => reject(err));
        });
        const buffer = Buffer.concat(chunks);
        const raw = buffer.toString('utf8');
        return { buffer, raw };
    }

    #getContentType() {
        const contentTypeHeader = (this.headers['content-type'] || '').toString();
        return contentTypeHeader.split(';')[0].trim().toLowerCase();
    }

    #parseBasedOnType(contentType, raw, buffer) {
        if (contentType === 'application/json') {
            this.body = raw.length ? JSON.parse(raw) : null;
            return;
        }

        if (contentType === 'application/x-www-form-urlencoded') {
            this.body = parseQueryString(raw);
            return;
        }

        if (contentType === 'text/plain' || contentType.startsWith('text/')) {
            this.body = raw;
            return;
        }

        this.body = raw;
        this.rawBuffer = buffer;
    }
}

export default Request;
