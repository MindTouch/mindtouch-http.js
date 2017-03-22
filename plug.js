/**
 * mindtouch-http.js - A JavaScript library to construct URLs and make HTTP requests using the fetch API
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
function _isRedirectResponse(response) {
    if(!response.headers.has('location')) {
        return false;
    }
    const code = response.status;
    return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
}
function _handleHttpError(response) {
    return new Promise((resolve, reject) => {
        const isRedirectResponse = _isRedirectResponse(response);

        // a redirect response from fetch when a cookie manager is present is resolved later
        if(isRedirectResponse && this._followRedirects && this._cookieManager !== null) {
            resolve(response);
            return;
        }

        // a redirect response when follow redirects is false is valid
        if(isRedirectResponse && !this._followRedirects) {
            resolve(response);
            return;
        }

        // throw for all non-2xx status codes, except for 304
        if((!response.ok && response.status !== 304)) {
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

        // NOTE (@modethirteen, 20170321): Headers.getAll() is obsolete and will be removed: https://developer.mozilla.org/en-US/docs/Web/API/Headers/getAll
        // Headers.get() will cease to return first header of a key, and instead take on the same behavior of Headers.getAll()
        const cookies = response.headers.getAll ? response.headers.getAll('Set-Cookie') : response.headers.get('Set-Cookie').split(',');
        return this._cookieManager.storeCookies(response.url, cookies).then(() => response);
    }
    return Promise.resolve(response);
}
function _doFetch({ url, method, headers, body = null }) {
    const requestData = {
        method: method,
        headers: new Headers(headers),
        credentials: 'include',

        // redirect resolution when a cookie manager is set will be handled in plug, not fetch
        redirect: this._followRedirects && this._cookieManager === null ? 'follow' : 'manual'
    };
    if(body !== null) {
        requestData.body = body;
    }
    const request = new Request(url, requestData);
    return _readCookies.call(this, request)
        .then(this._fetch)
        .then(_handleHttpError.bind(this))
        .then(_handleCookies.bind(this))
        .then((response) => {
            if(this._followRedirects && _isRedirectResponse(response)) {
                return _doFetch.call(this, {
                    url: response.headers.get('location'),

                    // HTTP 307/308 maintain request method
                    method: (response.status !== 307 && response.status !== 308) ? 'GET' : request.method,
                    headers: request.headers,
                    body: request.body
                });
            }
            return response;
        });
}

/**
 * A class for building URIs and performing HTTP requests.
 */
export class Plug {

    /**
     * @param {String} [url=/] The initial URL to start the URL building from and to ultimately send HTTP requests to.
     * @param {Object} [options] Options to direct the construction of the Plug.
     * @param {Object} [options.uriParts] An object representation of additional URI construction parameters.
     * @param {Array} [options.uriParts.segments] An array of strings specifying path segments to be added to the URI.
     * @param {Object} [options.uriParts.query] A set of key-value pairs that specify query string entries to be added to the URI.
     * @param {String} [options.uriParts.excludeQuery] A query string key that will be removed from the URI if it was specified as part of the {@see uri} parameter or as an entry in {@see options.uriParts.query}.
     * @param {Object} [options.headers] A set of key-value pairs that specify headers that will be set for every HTTP request sent by this instance.
     * @param {Number} [options.timeout=null] The time, in milliseconds, to wait before an HTTP timeout.
     * @param {function} [options.beforeRequest] A function that is called before each HTTP request that allows per-request manipulation of the request headers and query parameters.
     * @param {Object} [options.cookieManager] An object that implements a cookie management interface. This should provide implementations for the `getCookieString()` and `storeCookies()` functions.
     * @param {Boolean} [options.followRedirects] Should HTTP redirects be auto-followed, or should HTTP redirect responses be returned to the caller (default: true)
     * @param {function} [options.fetchImpl] whatwg/fetch implementation (default: window.fetch)
     */
    constructor(url = '/', {
        uriParts = {},
        headers = {},
        timeout = null,
        beforeRequest = (params) => params,
        cookieManager = null,
        followRedirects = true,
        fetchImpl = fetch
    } = {}) {

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
        this._followRedirects = followRedirects;
        this._fetch = fetchImpl;
    }

    /**
     * Get a string representation of the URL used for HTTP requests.
     */
    get url() {
        return this._url.toString();
    }

    /**
     * Get a Headers instance as defined by the fetch API.
     */
    get headers() {
        return new Headers(this._headers);
    }

    /**
     * Get a new Plug, based on the current one, with the specified path segments added.
     * @param {...String} segments The segments to be added to the new Plug instance.
     * @returns {Plug} The Plug with the segments included.
     */
    at(...segments) {
        var values = [];
        segments.forEach((segment) => {
            values.push(segment.toString());
        });
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { segments: values },
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified query parameter added.
     * @param {String} key The key name of the query parameter.
     * @param {String|Number|Boolean} value A value that will be serialized to a string and set as the query parameter value.
     * @returns {Plug} A new Plug instance with the query parameter included.
     */
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

    /**
     * Get a new Plug, based on the current one, with the specified query parameters added.
     * @param {Object} values A key-value list of the query parameters to include.
     * @returns {Plug} A new Plug instance with the query parameters included.
     */
    withParams(values = {}) {
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { query: values },
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified query parameter removed.
     * @param {String} key The key name of the query parameter in the current Plug to remove.
     * @returns {Plug} A new Plug instance with the query parameter excluded.
     */
    withoutParam(key) {
        return new this.constructor(this._url.toString(), {
            headers: this._headers,
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            uriParts: { excludeQuery: key },
            cookieManager: this._cookieManager
        });
    }

    /**
     * Get a new Plug, based on the current one, with the specified header added.
     * @param {String} key The name of the header to add.
     * @param {String} value The value of the header.
     * @returns {Plug} A new Plug instance with the header included.
     */
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

    /**
     * Get a new Plug, based on the current one, with the specified headers added.
     * @param {Object} values A key-value list of the headers to include.
     * @returns {Plug} A new Plug instance with the headers included.
     */
    withHeaders(values) {
        const newHeaders = Object.assign({}, this._headers);
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

    /**
     * Get a new Plug, based on the current one, with the specified header removed.
     * @param {String} key The name of the header in the current Plug to remove.
     * @returns {Plug} A new Plug instance with the header excluded.
     */
    withoutHeader(key) {
        const newHeaders = Object.assign({}, this._headers);
        delete newHeaders[key];
        return new this.constructor(this._url.toString(), {
            timeout: this._timeout,
            beforeRequest: this._beforeRequest,
            headers: newHeaders,
            cookieManager: this._cookieManager
        });
    }

    /**
     * Perform an HTTP GET Request.
     * @param {String} [method=GET] The HTTP method to set as part of the GET logic.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    get(method = 'GET') {
        const params = this._beforeRequest({
            url: this._url.toString(),
            method: method,
            headers: Object.assign({}, this._headers)
        });
        return _doFetch.call(this, params);
    }

    /**
     * Perform an HTTP POST request.
     * @param {String} body The body of the POST.
     * @param {String} mime The mime type of the request, set in the `Content-Type` header.
     * @param {String} [method=POST] The HTTP method to use with the POST logic.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    post(body, mime, method = 'POST') {
        if(mime) {
            this._headers['Content-Type'] = mime;
        }
        const params = this._beforeRequest({
            url: this._url.toString(),
            method: method,
            body: body,
            headers: Object.assign({}, this._headers)
        });
        return _doFetch.call(this, params);
    }

    /**
     * Perform an HTTP PUT request.
     * @param {String} body The body of the PUT.
     * @param {String} mime The mime type of the request, set in the `Content-Type` header.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    put(body, mime) {
        return this.post(body, mime, 'PUT');
    }

    /**
     * Perform an HTTP HEAD request.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    head() {
        return this.get('HEAD');
    }

    /**
     * Perform an HTTP OPTIONS request.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    options() {
        return this.get('OPTIONS');
    }

    /**
     * Perform an HTTP DELETE request.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    delete() {
        return this.post(null, null, 'DELETE');
    }
}
