'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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
const uriParser = /^(?:(?![^:@]+:[^:@/]*@)([^:/?#.]+:))?(?:\/\/)?(?:([^:@/]*)(?::([^:@/]*))?@)?(\[[0-9a-fA-F.]+]|[^:/?#]*)(?::(\d+|(?=:)))?((?:[^?#](?![^?#/]*\.(?:[?#]|$)))*\/?)?[^?#/]*(?:(\?[^#]*))?(?:(#.*))?/;
function _parseUri(str) {
    var parserKeys = [ 'href', 'protocol', 'username', 'password', 'hostname', 'port', 'pathname', 'search', 'hash' ];
    var m = uriParser.exec(str);
    var parts = {};
    parserKeys.forEach(function(key, i) {
        parts[key] = m[i];
    });
    return parts;
}
function _searchStringToParams(search) {
    let params = [];
    let queryEntries = search.split('&');
    queryEntries.forEach((entry) => {
        let kvp = entry.split('=');
        params.push([ kvp[0], kvp[1] ]);
    });
    return params;
}
class UriSearchParams {
    constructor(searchString) {
        this.params = [];
        if(searchString && searchString !== '') {
            if(searchString[0] === '?') {
                searchString = searchString.slice(1);
            }
            this.params = _searchStringToParams(searchString);
        }
    }
    append(name, value) {
        this.params.push([ name, value ]);
    }
    delete(name) {
        let newParams = [];
        this.params.forEach((pair) => {
            if(pair[0] !== name) {
                newParams.push(pair);
            }
        });
        this.params = newParams;
    }
    get(name) {
        let found = null;
        for(let i = 0; i < this.params.length; i++) {
            if(this.params[i][0] === name) {
                found = this.params[i][1];
                break;
            }
        }
        return found;
    }
    getAll(name) {
        let found = [];
        this.params.forEach((param) => {
            if(param[0] === name) {
                found.push(param[1]);
            }
        });
        return found;
    }
    has(name) {
        let found = false;
        for(let i = 0; i < this.params.length; i++) {
            if(this.params[i][0] === name) {
                found = true;
                break;
            }
        }
        return found;
    }
    set(name, value) {
        let found = false;
        let result = [];
        this.params.forEach((pair) => {
            if(pair[0] === name && !found) {
                pair[1] = value;
                result.push(pair);
                found = true;
            } else if(pair[0] !== name) {
                result.push(pair);
            }
        });
        this.params = result;
    }
    get entries() {
        return this.params;
    }
    get count() {
        return this.params.length;
    }
    toString() {
        return this.params.reduce((previous, current, index) => {
            return `${previous}${index === 0 ? '' : '&'}${current[0]}=${current[1]}`;
        }, '');
    }
}
class UriParser {
    constructor(urlString = '') {
        if(typeof urlString !== 'string') {
            throw new TypeError('Failed to construct \'URL\': The supplied URL must be a string');
        }
        let parts = _parseUri(urlString);
        let protocolExists = typeof parts.protocol !== 'undefined' && parts.protocol !== '';
        let hostExists = typeof parts.hostname !== 'undefined' && parts.hostname !== '';
        if((protocolExists && !hostExists) || (!protocolExists && hostExists)) {
            throw new TypeError('Failed to construct \'URL\': Protocol and hostname must be supplied together');
        }
        if(!protocolExists && !hostExists) {
            this.hostless = true;
        }
        this.parts = parts;
        this.params = new UriSearchParams(this.parts.search);
    }

    // Properties that come directly from the regex
    get protocol() {
        return this.parts.protocol.toLowerCase();
    }
    set protocol(val) {
        this.parts.protocol = val;
    }
    get hostname() {
        return this.parts.hostname;
    }
    set hostname(val) {
        this.parts.hostname = val;
    }
    get port() {
        return this.parts.port || '';
    }
    set port(val) {
        this.parts.port = val;
    }
    get pathname() {
        return this.parts.pathname || '/';
    }
    set pathname(val) {
        this.parts.pathname = val;
    }
    get search() {
        return this.params.entries.length === 0 ? '' : `?${this.params.toString()}`;
    }
    set search(val) {
        this.parts.search = val;
        this.params = new UriSearchParams(val);
    }
    get hash() {
        return this.parts.hash || '';
    }
    set hash(val) {
        this.parts.hash = val;
    }
    get username() {
        return this.parts.username || '';
    }
    set username(val) {
        this.parts.username = val;
    }
    get password() {
        return this.parts.password || '';
    }
    set password(val) {
        this.parts.password = val;
    }

    // Properties computed from various regex parts
    get href() {
        return this.toString();
    }
    set href(val) {
        this.parts = _parseUri(val);
        this.search = this.parts.search;
    }
    get host() {
        let host = this.hostname.toLowerCase();
        if(this.port) {
            host = `${host}:${this.port}`;
        }
        return host;
    }
    set host(val) {
        let hostParts = val.split(':');
        this.hostname = hostParts[0];
        if(hostParts.length > 1) {
            this.port = hostParts[1];
        } else {
            this.port = '';
        }
    }
    get origin() {
        return `${this.protocol}//${this.host}`;
    }
    get searchParams() {
        return this.params;
    }
    set searchParams(val) {
        this.params = val;
        this.parts.search = `?${val.toString()}`;
    }
    toString() {
        var hrefString = '';
        if(!this.hostless) {
            hrefString = `${this.protocol}//`;
            if(this.username && this.username !== '') {
                hrefString = `${hrefString}${this.username}`;
                if(this.password && this.password !== '') {
                    hrefString = `${hrefString}:${this.password}`;
                }
                hrefString = `${hrefString}@`;
            }
        }
        hrefString = `${hrefString}${this.host}${this.pathname}`;
        if(this.search && this.search !== '') {
            hrefString = `${hrefString}${this.search}`;
        }
        if(this.hash && this.hash !== '') {
            hrefString = `${hrefString}${this.hash}`;
        }
        return hrefString;
    }
}

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
/**
 * A class for parsing and manipulating URIs.
 */
class Uri {

    /**
     * Construct a Uri from a supplied string.
     * @param {String} [url] The URI string to parse. If not supplied, an empty URI will be initialized.
     */
    constructor(url = '') {
        this.parsedUrl = new UriParser(url);
    }

    /**
     * Get the protocol portion of the Uri.
     */
    get protocol() {
        return this.parsedUrl.protocol;
    }

    /**
     * Set the protocol for the Uri.
     * @param {String} protocol The new protocol for the Uri. Must be one of `http:` or `https:`.
     */
    set protocol(protocol) {
        this.parsedUrl.protocol = protocol;
    }

    /**
     * Get the hostname portion of the Uri.
     */
    get hostname() {
        return this.parsedUrl.hostname;
    }

    /**
     * Set the hostname for the Uri.
     * @param {String} hostname The new hostname for the Uri.
     */
    set hostname(hostname) {
        this.parsedUrl.hostname = hostname;
    }

    /**
     * Get the origin portion of the Uri.
     */
    get origin() {
        return this.parsedUrl.origin;
    }

    /**
     * Get the path portion of the Uri.
     */
    get path() {
        return this.parsedUrl.pathname;
    }

    /**
     * Get the search portion of the Uri detailing the query parameters as a string.
     */
    get search() {
        return this.parsedUrl.params.count === 0 ? '' : `?${this.parsedUrl.params.toString()}`;
    }

    /**
     * Get the hash portion of the Uri.
     */
    get hash() {
        return this.parsedUrl.hash;
    }

    /**
     * Get a query parameter value.
     * @param {String} key The key of the query string value to fetch.
     * @returns {String} The value of the query parameter.
     */
    getQueryParam(key) {
        return this.parsedUrl.searchParams.get(key);
    }

    /**
     * Remove a query string parameter from the Uri.
     * @param {String} key The key of the query parameter to remove.
     */
    removeQueryParam(key) {
        this.parsedUrl.searchParams.delete(key);
    }

    /**
     * Additively sets a query string parameter. It is possible to add multiple query parameter values with the same key using this function.
     * @param {String} key The key of the query parameter to add.
     * @param {String|Number|Boolean} value The value of the added query parameter.
     */
    addQueryParam(key, value) {
        const paramVal = value === null || typeof value === 'undefined' ? '' : encodeURIComponent(value);
        this.parsedUrl.searchParams.append(key, paramVal);
    }

    /**
     * Add a batch of query parameters.
     * @param {Object} queryMap A list of key-value pairs to add as query parameters. It is possible to add multiple query parameter values with the same key using this function.
     */
    addQueryParams(queryMap) {
        Object.keys(queryMap).forEach((key) => {
            this.addQueryParam(key, queryMap[key]);
        });
    }

    /**
     * Set the value of an existing query parameter, or add it if it does not exist.
     * @param {String} key The key of the query parameter to add.
     * @param {String|Number|Boolean} value The value of the added query parameter.
     */
    setQueryParam(key, value) {
        this.removeQueryParam(key);
        this.addQueryParam(key, value);
    }

    /**
     * Set a batch of query parameters.
     * @param {Object} queryMap A list of key-value pairs to set as query parameters. If any of the keys of this input object conflict with existing query parameter keys, they will be replaced.
     */
    setQueryParams(queryMap) {
        Object.keys(queryMap).forEach((key) => {
            this.setQueryParam(key, queryMap[key]);
        });
    }

    /**
     * Add path segments to the Uri.
     * @param {...String} segments The segments to be added to the Uri.
     */
    addSegments(...segments) {
        let path = '';
        segments.forEach((segment) => {
            if(Array.isArray(segment)) {
                segment.forEach((arraySegment) => {
                    if(arraySegment[0] === '/') {
                        arraySegment = arraySegment.slice(1);
                    }
                    path = `${path}/${arraySegment}`;
                });
            } else {
                if(segment[0] === '/') {
                    segment = segment.slice(1);
                }
                path = `${path}/${segment}`;
            }
        });
        let pathName = this.parsedUrl.pathname;
        if(pathName === '/') {
            pathName = '';
        }
        this.parsedUrl.pathname = `${pathName}${path}`;
    }

    /**
     * Get a string representation of the current state of the Uri.
     * @returns {String} The Uri string.
     */
    toString() {
        return this.parsedUrl.toString();
    }
}

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

/**
 * A class for building URIs and performing HTTP requests.
 */
class Plug {

    /**
     *
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
     */
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

    /**
     * Get a new Plug, based on the current one, with the specified header removed.
     * @param {String} key The name of the header in the current Plug to remove.
     * @returns {Plug} A new Plug instance with the header excluded.
     */
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

    /**
     * Perform an HTTP GET Request.
     * @param {String} [method=GET] The HTTP method to set as part of the GET logic.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    get(method = 'GET') {
        let params = this._beforeRequest({ method: method, headers: Object.assign({}, this._headers) });
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
        let params = this._beforeRequest({ method: method, body: body, headers: Object.assign({}, this._headers) });
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

exports.Plug = Plug;
exports.Uri = Uri;
