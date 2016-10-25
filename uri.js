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
import { UriParser } from './lib/uriParser.js';

export class Uri {
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
