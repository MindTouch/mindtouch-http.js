/* eslint-env jasmine, jest */
import { Uri } from '../uri.js';
describe('URI', () => {
    describe('constructor tests', () => {
        it('can construct a plain URI', () => {
            let uri = new Uri('http://www.example.com');
            expect(uri).toBeDefined();
        });
        it('can construct an empty URI', () => {
            let uri = new Uri();
            expect(uri).toBeDefined();
        });
        it('can fail if the constructor is not called correctly', () => {
            expect(() => Uri()).toThrow();
        });
    });
    describe('functionality', () => {
        var uri = null;
        beforeEach(() => {
            uri = new Uri('https://www.example.com/foo/bar?dog=cat&llama=goat#abcd=1234&defg=5678');
        });
        afterEach(() => {
            uri = null;
        });
        describe('read tests', () => {
            it('can convert to a string', () => {
                expect(uri.toString()).toBe('https://www.example.com/foo/bar?dog=cat&llama=goat#abcd=1234&defg=5678');
            });
            it('can fetch the URI path', () => {
                expect(uri.path).toBe('/foo/bar');
            });
            it('can fetch the protocol', () => {
                expect(uri.protocol).toBe('https:');
            });
            it('can fetch the hostname', () => {
                expect(uri.hostname).toBe('www.example.com');
            });
            it('can fetch the origin', () => {
                expect(uri.origin).toBe('https://www.example.com');
            });
            it('can fetch a query param', () => {
                expect(uri.getQueryParam('dog')).toBe('cat');
            });
            it('can fetch the search string', () => {
                expect(uri.search).toBe('?dog=cat&llama=goat');
            });
            it('can fetch the hash string', () => {
                expect(uri.hash).toBe('#abcd=1234&defg=5678');
            });
        });
        describe('manipulation tests', () => {
            it('can set the protocol', () => {
                uri.protocol = 'http:';
                expect(uri.toString()).toBe('http://www.example.com/foo/bar?dog=cat&llama=goat#abcd=1234&defg=5678');
            });
            it('can set the hostname', () => {
                uri.hostname = 'mtway.mindtouch.us';
                expect(uri.toString()).toBe('https://mtway.mindtouch.us/foo/bar?dog=cat&llama=goat#abcd=1234&defg=5678');
            });
            it('can add path segments', () => {
                uri.addSegments('new', 'segment');
                expect(uri.toString()).toBe('https://www.example.com/foo/bar/new/segment?dog=cat&llama=goat#abcd=1234&defg=5678');
            });
            it('can add path segments (complex)', () => {
                uri.addSegments('new', [ 'segment', '/with' ], '/array', [ 'arguments' ]);
                expect(uri.toString()).toBe('https://www.example.com/foo/bar/new/segment/with/array/arguments?dog=cat&llama=goat#abcd=1234&defg=5678');
            });
            it('can add query parameters', () => {
                uri.addQueryParam('new', 'param');
                uri.addQueryParam('new2', 'Bling $$');
                expect(uri.toString()).toBe('https://www.example.com/foo/bar?dog=cat&llama=goat&new=param&new2=Bling%20%24%24#abcd=1234&defg=5678');
            });
            it('can batch-add query params', () => {
                uri.addQueryParams({ a: '1', b: '2', c: '3' });
                expect(uri.toString()).toBe('https://www.example.com/foo/bar?dog=cat&llama=goat&a=1&b=2&c=3#abcd=1234&defg=5678');
            });
            it('can remove query parameters', () => {
                uri.removeQueryParam('llama');
                expect(uri.toString()).toBe('https://www.example.com/foo/bar?dog=cat#abcd=1234&defg=5678');
            });
            it('can try to remove non-existent query parameters', () => {
                uri.removeQueryParam('132465798');
                expect(uri.toString()).toBe('https://www.example.com/foo/bar?dog=cat&llama=goat#abcd=1234&defg=5678');
            });
            it('can set query parameters', () => {
                uri.addQueryParam('qux', 'bar');
                uri.setQueryParam('qux', 'baz');
                expect(uri.toString()).toBe('https://www.example.com/foo/bar?dog=cat&llama=goat&qux=baz#abcd=1234&defg=5678');
            });
        });
    });
});
