/**
 * Martian - Core JavaScript API for MindTouch
 *
 * Copyright (c) 2015 MindTouch Inc.
 * www.mindtouch.com  oss@mindtouch.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Uri } from './uri.js';
function _handleHttpError(response) {
    return new Promise((resolve, reject) => {

        // Throw for all non-2xx status codes, except for 304
        if(!response.ok && response.status !== 304) {
            response.text().then((text) => {
                reject({
                    message: response.statusText,
                    status: response.status,
                    responseText: text
                });
            });
        } else {
            resolve(response);
        }
    });
}
function _readCookies(request) {
    if(this._cookieManager !== null) {
        return this._cookieManager.getCookieString(request.url).then((cookieString) => {
            if(cookieString !== '') {
                request.headers.set('Cookie', cookieString);
            }
        }).then(() => request);
    }
    return Promise.resolve(request);
}
function _handleCookies(response) {
    if(this._cookieManager !== null) {
        return this._cookieManager.storeCookies(response.url, response.headers.getAll('Set-Cookie')).then(() => response);
    }
    return Promise.resolve(response);
}
function _doFetch({ method, headers, body = null }) {
    let requestHeaders = new Headers(headers);
    let requestData = { method: method, headers: requestHeaders, credentials: 'include' };
    if(body !== null) {
        requestData.body = body;
    }
    let request = new Request(this._url.toString(), requestData);
    return _readCookies.call(this, request).then(fetch).then(_handleHttpError).then(_handleCookies.bind(this));
}
export class Plug {
    constructor(url = '/', { uriParts = {}, headers = {}, timeout = null, beforeRequest = (params) => params, cookieManager = null } = {}) {

        // Initialize the url for this instance
        this._url = new Uri(url);
        if('segments' in uriParts) {
            this._url.addSegments(uriParts.segments);
        }
        if('query' in uriParts) {
            this._url.addQueryParams(uriParts.query);
        }
        if('excludeQuery' in uriParts) {
            this._url.removeQueryParam(uriParts.excludeQuery);
        }

        this._beforeRequest = beforeRequest;
        this._timeout = timeout;
        this._headers = headers;
        this._cookieManager = cookieManager;
    }
    get url() {
        return this._url.toString();
    }
    get headers() {
        return new Headers(this._headers);
    }
    at(...segments) {
        var values = [];
        segments.forEach((segment) => {
            values.push(encodeURIComponent(segment.toString()));
        });
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { segments: values },
            cookieManager: this._cookieManager
        });
    }
    withParam(key, value) {
        let params = {};
        params[key] = value;
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { query: params },
            cookieManager: this._cookieManager
        });
    }
    withParams(values = {}) {
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { query: values },
            cookieManager: this._cookieManager
        });
    }
    withoutParam(key) {
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { excludeQuery: key },
            cookieManager: this._cookieManager
        });
    }
    withHeader(key, value) {
        let newHeaders = Object.assign({}, this._headers);
        newHeaders[key] = value;
        return new this.constructor(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders,
            cookieManager: this._cookieManager
        });
    }
    withHeaders(values) {
        let newHeaders = Object.assign({}, this._headers);
        Object.keys(values).forEach((key) => {
            newHeaders[key] = values[key];
        });
        return new this.constructor(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders,
            cookieManager: this._cookieManager
        });
    }
    withoutHeader(key) {
        let newHeaders = Object.assign({}, this._headers);
        delete newHeaders[key];
        return new this.constructor(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders,
            cookieManager: this._cookieManager
        });
    }
    get(method = 'GET') {
        let params = this._beforeRequest({ method: method, headers: Object.assign({}, this._headers) });
        return _doFetch.call(this, params);
    }
    post(body, mime, method = 'POST') {
        if(mime) {
            this._headers['Content-Type'] = mime;
        }
        let params = this._beforeRequest({ method: method, body: body, headers: Object.assign({}, this._headers) });
        return _doFetch.call(this, params);
    }
    put(body, mime) {
        return this.post(body, mime, 'PUT');
    }
    head() {
        return this.get('HEAD');
    }
    options() {
        return this.get('OPTIONS');
    }
    delete() {
        return this.post(null, null, 'DELETE');
    }
}
