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
const uriParser = /^(?:(?![^:@]+:[^:@/]*@)([^:/?#.]+:))?(?:\/\/)?(?:([^:@/]*)(?::([^:@/]*))?@)?(\[[0-9a-fA-F.]+]|[^:/?#]*)(?::(\d+|(?=:)))?((?:[^?#])*\/?)?[^?#/]*(?:(\?[^#]*))?(?:(#.*))?/;
function _parseUri(str) {
    const parserKeys = [ 'href', 'protocol', 'username', 'password', 'hostname', 'port', 'pathname', 'search', 'hash' ];
    const m = uriParser.exec(str);
    const parts = {};
    parserKeys.forEach(function(key, i) {
        parts[key] = m[i];
    });
    return parts;
}
function _searchStringToParams(search) {
    const params = [];
    const queryEntries = search.split('&');
    queryEntries.forEach((entry) => {
        let kvp = entry.split('=');
        params.push([ kvp[0], kvp[1] ]);
    });
    return params;
}
export class UriSearchParams {
    constructor(searchString) {
        this._params = [];
        if(searchString && searchString !== '') {
            if(searchString[0] === '?') {
                searchString = searchString.slice(1);
            }
            this._params = _searchStringToParams(searchString);
        }
    }
    append(name, value) {
        this._params.push([ name, value ]);
    }
    delete(name) {
        const newParams = [];
        this._params.forEach((pair) => {
            if(pair[0] !== name) {
                newParams.push(pair);
            }
        });
        this._params = newParams;
    }
    get(name) {
        let found = null;
        for(let i = 0; i < this._params.length; i++) {
            if(this._params[i][0] === name) {
                found = this._params[i][1];
                break;
            }
        }
        return found;
    }
    getAll(name) {
        const found = [];
        this._params.forEach((param) => {
            if(param[0] === name) {
                found.push(param[1]);
            }
        });
        return found;
    }
    has(name) {
        let found = false;
        for(let i = 0; i < this._params.length; i++) {
            if(this._params[i][0] === name) {
                found = true;
                break;
            }
        }
        return found;
    }
    set(name, value) {
        let found = false;
        const result = [];
        this._params.forEach((pair) => {
            if(pair[0] === name && !found) {
                pair[1] = value;
                result.push(pair);
                found = true;
            } else if(pair[0] !== name) {
                result.push(pair);
            }
        });
        this._params = result;
    }
    get entries() {
        return this._params;
    }
    get count() {
        return this._params.length;
    }
    toString() {
        return this._params.reduce((previous, current, index) => {
            return `${previous}${index === 0 ? '' : '&'}${current[0]}=${current[1]}`;
        }, '');
    }
}

export class UriParser {
    constructor(urlString = '') {
        if(typeof urlString !== 'string') {
            throw new TypeError('Failed to construct \'URL\': The supplied URL must be a string');
        }
        this._parts = _parseUri(urlString);
        const protocolExists = typeof this._parts.protocol !== 'undefined' && this._parts.protocol !== '';
        const hostExists = typeof this._parts.hostname !== 'undefined' && this._parts.hostname !== '';
        if((protocolExists && !hostExists) || (!protocolExists && hostExists)) {
            throw new TypeError('Failed to construct \'URL\': Protocol and hostname must be supplied together');
        }
        this._hostless = !protocolExists && !hostExists;
        this._params = new UriSearchParams(this._parts.search);
    }

    // Properties that come directly from the regex
    get params() {
        return this._params;
    }
    get protocol() {
        return typeof this._parts.protocol !== 'undefined' ? this._parts.protocol.toLowerCase() : '';
    }
    set protocol(val) {
        if(!val) {

            // removing the protocol means converting url to a `hostless` url
            this._parts.hostname = null;
            this._parts.protocol = null;
            this._hostless = true;
            return;
        }
        this._parts.protocol = val;
    }
    get hostname() {
        return this._parts.hostname || '';
    }
    set hostname(val) {
        if(!val) {

            // removing the hostname means converting url to a `hostless` url
            this._parts.hostname = null;
            this._parts.protocol = null;
            this._hostless = true;
            return;
        }
        this._parts.hostname = val;
    }
    get port() {
        return this._parts.port || '';
    }
    set port(val) {
        this._parts.port = val;
    }
    get pathname() {
        return this._parts.pathname || '/';
    }
    set pathname(val) {
        this._parts.pathname = val;
    }
    get search() {
        return this._params.entries.length === 0 ? '' : `?${this._params.toString()}`;
    }
    set search(val) {
        this._parts.search = val;
        this._params = new UriSearchParams(val);
    }
    get hash() {
        return this._parts.hash || '';
    }
    set hash(val) {
        this._parts.hash = val;
    }
    get username() {
        return this._parts.username || '';
    }
    set username(val) {
        this._parts.username = val;
    }
    get password() {
        return this._parts.password || '';
    }
    set password(val) {
        this._parts.password = val;
    }

    // Properties computed from various regex parts
    get href() {
        return this.toString();
    }
    set href(val) {
        this._parts = _parseUri(val);
        this.search = this._parts.search;
    }
    get host() {
        let host = this.hostname.toLowerCase();
        if(host !== '' && this.port) {
            host = `${host}:${this.port}`;
        }
        return host;
    }
    set host(val) {
        const hostParts = val.split(':');
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
        return this._params;
    }
    set searchParams(val) {
        this._params = val;
        this._parts.search = `?${val.toString()}`;
    }
    toString() {
        let hrefString = '';
        if(!this._hostless) {
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
