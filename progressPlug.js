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
import { Plug } from './plug.js';
function _doXhr({ xhr, body, progressInfo }) {
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4) {
                const status = xhr.status;
                if(status >= 200 && status <= 300) {
                    progressInfo.callback({ loaded: progressInfo.size, total: progressInfo.size });
                    resolve(xhr);
                } else {
                    reject({
                        message: xhr.statusText,
                        status: xhr.status,
                        responseText: xhr.responseText
                    });
                }
            }
        };
        xhr.onerror = () => {
            reject(new Error('An error occurred while initiating the file upload'));
        };
        xhr.send(body);
    });
}
function _readCookies(request) {
    if(this._cookieManager !== null) {
        return this._cookieManager.getCookieString(this.url).then((cookieString) => {
            if(cookieString !== '') {
                request.xhr.setRequestHeader('Cookie', cookieString);
            }
        }).then(() => request);
    }
    return Promise.resolve(request);
}
function _handleCookies(xhr) {
    if(this._cookieManager !== null) {
        return this._cookieManager.storeCookies(this.url, xhr.getResponseHeader('Set-Cookie')).then(() => xhr);
    }
    return Promise.resolve(xhr);
}
function _doRequest({ method, headers, body = null, progressInfo }) {
    const xhr = new XMLHttpRequest();  // eslint-disable-line no-undef
    xhr.open(method, this.url, true);
    xhr.upload.onprogress = (e) => {
        progressInfo.callback({ loaded: e.loaded, total: progressInfo.size });
    };
    for(const [ header, val ] of Object.entries(headers)) {
        xhr.setRequestHeader(header, val);
    }
    const request = { xhr: xhr, body: body, progressInfo: progressInfo };
    progressInfo.callback({ loaded: 0, total: progressInfo.size });
    return _readCookies.call(this, request).then(_doXhr).then(_handleCookies.bind(this));
}

/**
 * A class that performs HTTP POST and PUT requests, and allows for the progress of the uploaded data to be reported.
 */
export class ProgressPlug extends Plug {

    /**
     * Construct a ProgressPlug object.
     * @param {String} [url] The initial URL for the Plug.
     * @param {Object} params The parameters that direct the construction and behavior of the Plug. See {@see Plug} for details.
     */
    constructor(url, params) {
        super(url, params);
    }

    /**
     * Perform an HTTP POST request, enabling progress callback notifications.
     * @param {String} body The body of the POST.
     * @param {String} mime The mime type of the request, set in the `Content-Type` header.
     * @param {String} [method=POST] The HTTP method to use with the POST logic.
     * @param {Object} [progressInfo] An object containing parameters to receive the progress notifications.
     * @param {Number} [progressInfo.size] The Number of bytes that are uploaded before a notification callback occurs.
     * @param {function} [progressInfo.callback] A function that is called to notify about a progress event.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    post(body, mime, method = 'POST', progressInfo = { size: 0, callback: () => {} }) {
        if(mime) {
            this._headers['Content-Type'] = mime;
        }
        let params = this._beforeRequest({ method: method, body: body, headers: Object.assign({}, this._headers) });
        params.progressInfo = progressInfo;
        return _doRequest.call(this, params);
    }

    /**
     * Perform an HTTP PUT request, enabling progress callback notifications.
     * @param {String} body The body of the PUT.
     * @param {String} mime The mime type of the request, set in the `Content-Type` header.
     * @param {Object} [progressInfo] An object containing parameters to receive the progress notifications.
     * @param {Number} [progressInfo.size] The Number of bytes that are uploaded before a notification callback occurs.
     * @param {function} [progressInfo.callback] A function that is called to notify about a progress event.
     * @returns {Promise} A Promise that, when resolved, yields the {Response} object as defined by the fetch API.
     */
    put(body, mime, progressInfo) {
        return this.post(body, mime, 'PUT', progressInfo);
    }
}
