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
class Uri {
    constructor(url = '') {
        this.parsedUrl = new UriParser(url);
    }
    get protocol() {
        return this.parsedUrl.protocol;
    }
    set protocol(protocol) {
        this.parsedUrl.protocol = protocol;
    }
    get hostname() {
        return this.parsedUrl.hostname;
    }
    set hostname(hostname) {
        this.parsedUrl.hostname = hostname;
    }
    get origin() {
        return this.parsedUrl.origin;
    }
    get path() {
        return this.parsedUrl.pathname;
    }
    get search() {
        return this.parsedUrl.params.count === 0 ? '' : `?${this.parsedUrl.params.toString()}`;
    }
    get hash() {
        return this.parsedUrl.hash;
    }
    getQueryParam(key) {
        return this.parsedUrl.searchParams.get(key);
    }
    removeQueryParam(key) {
        this.parsedUrl.searchParams.delete(key);
    }
    addQueryParam(key, value) {
        this.parsedUrl.searchParams.append(key, encodeURIComponent(value));
    }
    addQueryParams(queryMap) {
        Object.keys(queryMap).forEach((key) => {
            this.addQueryParam(key, queryMap[key]);
        });
    }
    setQueryParam(key, value) {
        this.removeQueryParam(key);
        this.addQueryParam(key, value);
    }
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
class Plug {
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

exports.Plug = Plug;
exports.Uri = Uri;
