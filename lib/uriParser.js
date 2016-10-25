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
const uriParser = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+:))?(?:\/\/)?(?:([^:@\/]*)(?::([^:@\/]*))?@)?(\[[0-9a-fA-F.]+\]|[^:\/?#]*)(?::(\d+|(?=:)))?((?:[^?#](?![^?#\/]*\.(?:[?#]|$)))*\/?)?[^?#\/]*(?:(\?[^#]*))?(?:(#.*))?/;
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
export class UriSearchParams {
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
    toString() {
        return this.params.reduce((previous, current, index) => {
            return `${previous}${index === 0 ? '' : '&'}${current[0]}=${current[1]}`;
        }, '');
    }
}
export class UriParser {
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
