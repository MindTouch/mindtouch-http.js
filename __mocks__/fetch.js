/* eslint-env node */
class Headers {
    constructor(headers = {}) {
        this._headers = {};
        for(let header in headers) {
            if(headers.hasOwnProperty(header)) {
                this.set(header, headers[header]);
            }
        }
    }
    get(key) {
        let values = this.getAll(key);
        return values.length ? values.join(',') : null;
    }
    set(key, value) {
        key = key.toLowerCase();
        this._headers[key] = this._headers[key] || [];
        this._headers[key].push(value);
    }
    has(key) {
        return typeof this._headers[key.toLowerCase()] !== 'undefined';
    }
    getAll(key) {
        key = key.toLowerCase();
        if(!(key in this._headers)) {
            return [];
        }
        return this._headers[key];
    }
}
class Request {
    constructor(url = 'https://www.example.com', {
        method = 'GET',
        redirect = 'follow',
        credentials = 'include',
        headers = new Headers()
    } = {}) {
        this._url = url;
        this._method = method;
        this._redirect = redirect;
        this._credentials = credentials;
        this._headers = headers;
    }
    get url() {
        return this._url;
    }
    get method() {
        return this._method;
    }
    get redirect() {
        return this._redirect;
    }
    get credentials() {
        return this._credentials;
    }
    get headers() {
        return this._headers;
    }
}
class Response {
    constructor(body = '', {
        status = 200,
        headers = new Headers(),
        url = 'https://www.example.com'
    } = {}) {
        this._body = body;
        this._status = status;
        this._headers = headers;
        this._url = url;
    }
    get url() {
        return this._url;
    }
    get ok() {
        return this._status >= 200 && this._status < 300;
    }
    get status() {
        return this._status;
    }
    get statusText() {
        return '';
    }
    get headers() {
        return this._headers;
    }
    text() {
        return Promise.resolve(this._body);
    }
    json() {
        try {
            return Promise.resolve(JSON.parse(this._body));
        } catch(e) {
            return Promise.reject(e);
        }
    }
}
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
