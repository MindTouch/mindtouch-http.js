class Headers {
    constructor(obj) {
        this._headers = obj;
    }
    get(key) {
        if(!(key in this._headers)) {
            return null;
        }
        return this._headers[key];
    }
}
class Request {}
class Response {
    constructor(body = '', init = {}) {
        this._status = init.status || 200;
    }
    get ok() {
        return this._status >= 200 && this._status < 300;
    }
    get status() {
        return this._status;
    }
}
global.Headers = Headers;
global.Request = Request;
global.Response = Response;
