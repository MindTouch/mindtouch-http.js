/* eslint-env node, jasmine, jest */
/* global Response:false */
import 'fetch';
import { Plug } from '../plug.js';
describe('Plug JS', () => {
    beforeEach(() => {
        global.fetch = jest.genMockFunction();
    });
    describe('constructor', () => {
        it('can construct a Plug with defaults', () => {
            let p = new Plug();
            expect(p.url).toBe('/');
        });
        it('can construct a Plug with all possible params', () => {
            let params = {
                uriParts: {
                    segments: [ 'dog', 'cat', 123 ],
                    query: { foo: 'bar', abc: 123, def: 456 },
                    excludeQuery: 'abc'
                },
                headers: {
                    'X-Deki-Token': 'abcd1234'
                },
                timeout: 200,
                cookieLib: {}
            };
            let p = new Plug('http://www.example.com', params);
            expect(p.url).toBe('http://www.example.com/dog/cat/123?foo=bar&def=456');
            let h = p.headers;
            expect(h instanceof Headers).toBe(true);
            expect(h.get('X-Deki-Token')).toBe('abcd1234');
        });
    });
    describe('whatwg/fetch implementation', () => {
        beforeEach(() => {
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response()));
        });
        it('is global', () => {
            const plug = new Plug('http://example.com');
            return plug.get().then(() => {
                expect(global.fetch).toBeCalled();
            });
        });
        it('is dependency injected', () => {
            const fetchMock = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response()));
            const plug = new Plug('http://example.com', {
                fetchImpl: fetchMock
            });
            return plug.get().then(() => {
                expect(global.fetch).not.toBeCalled();
                expect(fetchMock).toBeCalled();
            });
        });
    });
    describe('URI construction', () => {
        let plug = null;
        beforeEach(() => {
            plug = new Plug('http://www.example.com');
        });
        afterEach(() => {
            plug = null;
        });
        it('can add segments', () => {
            let p2 = plug.at('@api', 'foo', 'bar');
            expect(p2.url).toBe('http://www.example.com/@api/foo/bar');
            expect(plug.url).toBe('http://www.example.com/');
        });
        it('can add no query params', () => {
            let newPlug = plug.withParams();
            expect(newPlug.url).toBe('http://www.example.com/');
            expect(plug.url).toBe('http://www.example.com/');
        });
        it('can add a single query param', () => {
            let newPlug = plug.withParam('dog', 123);
            expect(newPlug.url).toBe('http://www.example.com/?dog=123');
            expect(plug.url).toBe('http://www.example.com/');
        });
        it('can add multiple query params', () => {
            let newPlug = plug.withParams({ dog: 123, cat: 'def' });
            expect(newPlug.url).toBe('http://www.example.com/?dog=123&cat=def');
            expect(plug.url).toBe('http://www.example.com/');
        });
        it('can remove query params', () => {
            let newPlug = plug.withParams({ dog: 123, cat: 'def' }).withoutParam('dog');
            expect(newPlug.url).toBe('http://www.example.com/?cat=def');
            expect(plug.url).toBe('http://www.example.com/');
        });
    });
    describe('headers handling', () => {
        let plug = null;
        beforeEach(() => {
            plug = new Plug('http://www.example.com');
        });
        afterEach(() => {
            plug = null;
        });
        it('can add a single header', () => {
            let newPlug = plug.withHeader('Content-Type', 'application/json');
            expect(newPlug.headers.get('Content-Type')).toBe('application/json');
            expect(plug.headers.get('Content-Type')).toBeNull();
        });
        it('can add multiple headers', () => {
            let newPlug = plug.withHeaders({
                'Content-Type': 'application/json',
                'X-Deki-Token': 'abcd1234'
            });
            expect(newPlug.headers.get('Content-Type')).toBe('application/json');
            expect(newPlug.headers.get('X-Deki-Token')).toBe('abcd1234');
            expect(plug.headers.get('Content-Type')).toBeNull();
        });
        it('can remove headers', () => {
            let newPlug = plug.withHeaders({
                'Content-Type': 'application/json',
                'X-Deki-Token': 'abcd1234'
            }).withoutHeader('Content-Type');
            expect(newPlug.headers.get('Content-Type')).toBe(null);
            expect(newPlug.headers.get('X-Deki-Token')).toBe('abcd1234');
            expect(plug.headers.get('Content-Type')).toBeNull();
        });
    });
    describe('HTTP operations', () => {
        let p = null;
        beforeEach(() => {
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response()));
            p = new Plug('http://example.com/');
        });
        afterEach(() => {
            p = null;
        });
        describe('GET', () => {
            it('can do a basic GET request', () => {
                return p.get();
            });
            it('can do a basic HEAD request', () => {
                return p.head();
            });
            it('can do a basic OPTIONS request', () => {
                return p.options();
            });
        });
        describe('POST', () => {
            it('can do a basic POST request', () => {
                return p.post('{"foo": "BAZ"}', 'application/json');
            });
            it('can do a basic PUT request', () => {
                return p.put('{"foo": "BAZ"}', 'application/json');
            });
            it('can do a basic DELETE request', () => {
                return p.delete();
            });
        });
    });
    describe('beforeRequest handler', () => {
        let p = null;
        let mockBeforeRequest = jest.genMockFunction().mockReturnValueOnce({ method: 'GET' });
        beforeEach(() => {
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response()));
            p = new Plug('http://example.com/', { beforeRequest: mockBeforeRequest });
        });
        afterEach(() => {
            p = null;
        });
        it('can hook into the beforeRequest handler', () => {
            return p.at('foo', 'bar').withParam('dog', 'cat').withHeaders({ 'X-Some-Custom-Header': 'Hello' }).get().then(() => {
                expect(mockBeforeRequest).toBeCalled();
            });
        });
    });
    describe('HTTP codes', () => {
        it('can fail with a 5xx error', () => {
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response('', { status: 500 })));
            const p = new Plug('http://example.com/');
            return p.get().catch((e) => expect(e).toBeDefined());
        });
        it('can pass with a 304 status', () => {
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response('', { status: 304 })));
            const p = new Plug('http://example.com/');
            return p.get();
        });
    });
    describe('Following Redirects', () => {
        it('can fail if not following redirects and HTTP 3xx without location header', () => {
            global.fetch = jest.genMockFunction();
            global.fetch.mockReturnValueOnce(Promise.resolve(new Response('', { status: 302 })));
            const p = new Plug('http://example.com', {
                followRedirects: false
            });
            return p.get().catch((e) => expect(e).toBeDefined());
        });
        it('can allow a HTTP 301 redirect with location header if not following redirects', () => {
            global.fetch = jest.genMockFunction();
            global.fetch.mockReturnValueOnce(Promise.resolve(new Response('', {
                status: 301,
                headers: new Headers({
                    location: 'https://bar.foo.com'
                })
            })));
            const p = new Plug('http://example.com', {
                followRedirects: false
            });
            return p.get();
        });
        it('can follow a HTTP 302 redirect with location header if not following redirects', () => {
            global.fetch = jest.genMockFunction();
            global.fetch.mockReturnValueOnce(Promise.resolve(new Response('', {
                status: 302,
                headers: new Headers({
                    location: 'https://bar.foo.com'
                })
            })));
            const p = new Plug('http://example.com', {
                followRedirects: false
            });
            return p.get();
        });
        it('can follow a HTTP 303 redirect with location header if not following redirects', () => {
            global.fetch = jest.genMockFunction();
            global.fetch.mockReturnValueOnce(Promise.resolve(new Response('', {
                status: 303,
                headers: new Headers({
                    location: 'https://bar.foo.com'
                })
            })));
            const p = new Plug('http://example.com', {
                followRedirects: false
            });
            return p.get();
        });
        it('can follow a redirect and set cookie', () => {
            global.fetch = jest.genMockFunction();
            const url = 'http://example.com/';
            const location = 'https://bar.foo.com'; 
            const redirect = new Response('', {
                url,
                status: 302,
                headers: new Headers({
                    location,
                    'set-cookie': 'authtoken="123"'
                })
            });
            global.fetch.mockReturnValueOnce(Promise.resolve(redirect));
            const resolved = new Response();
            global.fetch.mockReturnValueOnce(Promise.resolve(resolved));
            const cookieManager = require('../lib/cookieJar');
            const p = new Plug(url, {
                followRedirects: true,
                cookieManager
            });
            return p.get().then((r) => {
                expect(global.fetch.mock.calls.length).toBe(2);
                const request1 = global.fetch.mock.calls[0][0];
                expect(request1.url).toBe(url);
                const request2 = global.fetch.mock.calls[1][0];
                expect(request2.url).toBe(location);
                expect(r).toBe(resolved);
                return cookieManager.getCookieString(url);
            }).then((cookie) => {
                expect(cookie).toBe('authtoken="123"');
            });
        });
    });
    describe('Cookie Jar', () => {
        let p = null;
        beforeEach(() => {
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response()));
        });
        afterEach(() => {
            p = null;
            global.fetch = null;
        });
        it('can do requests with a cookie jar in place', () => {
            const cookieJar = require('../lib/cookieJar');
            cookieJar.getCookieString = jest.genMockFunction().mockReturnValueOnce(Promise.resolve('value=this is a cookie value'));
            p = new Plug('http://example.com/', { cookieManager: cookieJar });
            return p.get();
        });
        it('can do requests with a cookie jar in place (empty cookie)', () => {
            const cookieJar = require('../lib/cookieJar');
            cookieJar.getCookieString = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(''));
            p = new Plug('http://example.com/', { cookieManager: cookieJar });
            return p.get();
        });
    });
});
