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
import { UriParser } from './lib/uriParser.js';

/**
 * A class for parsing and manipulating URIs.
 */
export class Uri {

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
