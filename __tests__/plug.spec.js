/* eslint-env node, jasmine, jest */
/* global Response:false */
jest.unmock('../src/plug');
jest.unmock('../src/uri');
jest.unmock('../src/uriParser');
import 'fetch';
import { Plug } from '../src/plug';
describe('Plug JS', () => {
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
    describe('URI construction', () => {
        let plug = null;
        beforeEach(() => {
            plug = new Plug('http://www.example.com');
        });
        afterEach(() => {
            plug = null;
        });
        it('can add segments', () => {
            let p2 = plug.at('foo', 'bar');
            expect(p2.url).toBe('http://www.example.com/foo/bar');
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
            pit('can do a basic GET request', () => {
                return p.get();
            });
            pit('can do a basic HEAD request', () => {
                return p.head();
            });
            pit('can do a basic OPTIONS request', () => {
                return p.options();
            });
        });
        describe('POST', () => {
            pit('can do a basic POST request', () => {
                return p.post('{"foo": "BAZ"}', 'application/json');
            });
            pit('can do a basic PUT request', () => {
                return p.put('{"foo": "BAZ"}', 'application/json');
            });
            pit('can do a basic DELETE request', () => {
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
        pit('can hook into the beforeRequest handler', () => {
            return p.at('foo', 'bar').withParam('dog', 'cat').withHeaders({ 'X-Some-Custom-Header': 'Hello' }).get().then(() => {
                expect(mockBeforeRequest).toBeCalled();
            });
        });
    });
    describe('HTTP codes', () => {
        let p = null;
        beforeEach(() => {
            p = new Plug('http://example.com/');
        });
        afterEach(() => {
            p = null;
        });
        pit('can fail with a 5xx error', () => {
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response('', { status: 500 })));
            return p.get().catch((e) => expect(e).toBeDefined());
        });
        pit('can pass with a 304 status', () => {
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response('', { status: 304 })));
            return p.get();
        });
    });
    describe('Cookie Jar', () => {
        jest.unmock('tough-cookie');
        jest.unmock('../src/cookieJar');
        let p = null;
        beforeEach(() => {
            const cookieJar = require('../src/cookieJar');
            cookieJar.getCookieString = jest.genMockFunction().mockReturnValueOnce(Promise.resolve('value=this is a cookie value'));
            global.fetch = jest.genMockFunction().mockReturnValueOnce(Promise.resolve(new Response()));
            p = new Plug('http://example.com/', { cookieManager: cookieJar });
        });
        afterEach(() => {
            p = null;
            global.fetch = null;
        });
        it('can do requests with a cookie jar in place', () => {
            return p.get();
        });
    });
});
