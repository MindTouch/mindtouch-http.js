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
import { Uri } from './uri';
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
function _doFetch({ method, headers, body = null }) {
    let requestHeaders = new Headers(headers);
    let requestData = { method: method, headers: requestHeaders, credentials: 'include' };
    if(body !== null) {
        requestData.body = body;
    }
    let request = new Request(this._url.toString(), requestData);
    return fetch(request).then(_handleHttpError);
}
function _cloneHeaders() {
    let cloned = {};
    Object.keys(this._headers).forEach((key) => {
        cloned[key] = this._headers[key];
    });
    return cloned;
}
export class Plug {
    constructor(url = '/', { uriParts = {}, headers = {}, timeout = null, beforeRequest = (params) => params } = {}) {

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
    }
    get url() {
        return this._url.toString();
    }
    get headers() {
        return new Headers(this._headers);
    }
    at(...segments) {
        var values = [];
        segments.forEach(function(segment) {
            values.push(segment.toString());
        });
        return new Plug(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { segments: values }
        });
    }
    withParam(key, value) {
        let params = {};
        params[key] = value;
        return new Plug(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { query: params }
        });
    }
    withParams(values = {}) {
        return new Plug(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { query: values }
        });
    }
    withoutParam(key) {
        return new Plug(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { excludeQuery: key }
        });
    }
    withHeader(key, value) {
        let newHeaders = _cloneHeaders.call(this);
        newHeaders[key] = value;
        return new Plug(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders
        });
    }
    withHeaders(values) {
        let newHeaders = _cloneHeaders.call(this);
        Object.keys(values).forEach((key) => {
            newHeaders[key] = values[key];
        });
        return new Plug(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders
        });
    }
    withoutHeader(key) {
        let newHeaders = _cloneHeaders.call(this);
        delete newHeaders[key];
        return new Plug(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders
        });
    }
    get(method = 'GET') {
        let params = this._beforeRequest({ method: method, headers: _cloneHeaders.call(this) });
        return _doFetch.call(this, params);
    }
    post(body, mime, method = 'POST') {
        this._headers['Content-Type'] = mime;
        let params = this._beforeRequest({ method: method, body: body, headers: _cloneHeaders.call(this) });
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
