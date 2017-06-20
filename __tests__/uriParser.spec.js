/* eslint-env jasmine, jest */
import { UriParser, UriSearchParams } from '../lib/uriParser.js';
describe('URI Parser', () => {
    describe('construction', () => {
        it('can construct a parser (simple)', () => {
            var p = new UriParser('https://www.google.com');
            expect(p).toBeDefined();
            expect(p.toString()).toBe('https://www.google.com/');
        });
        it('can construct a parser (no password)', () => {
            var p = new UriParser('http://user@www.google.com');
            expect(p).toBeDefined();
            expect(p.toString()).toBe('http://user@www.google.com/');
        });
        it('can construct a parser (complex)', () => {
            var p = new UriParser('http://user:password@www.google.com:9000/foo/bar?dog=cat&abc=123#hashhash');
            expect(p).toBeDefined();
            expect(p.toString()).toBe('http://user:password@www.google.com:9000/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can construct a URI with just a path initially', () => {
            let p = new UriParser('/@api');
            expect(p).toBeDefined();
            expect(p.toString()).toBe('/@api');
        });
        it('can fail when no URI is passed in', () => {
            let p = new UriParser();
            expect(p).toBeDefined();
            expect(p.toString()).toBe('/');
            let p2 = new UriParser('');
            expect(p2).toBeDefined();
            expect(p2.toString()).toBe('/');
        });
        it('can fail when an invalid URI is passed in', () => {
            expect(() => {
                let x = new UriParser('http://');
                expect(x).not.toBeDefined();
            }).toThrow();
            expect(() => {
                let x = new UriParser('foo');
                expect(x).not.toBeDefined();
            }).toThrow();
            expect(() => {
                let x = new UriParser(123);
                expect(x).not.toBeDefined();
            }).toThrow();
        });
        it('can fail if the constructor is not called correctly', () => {
            expect(() => UriParser()).toThrow();
        });
    });
    describe('URI operations', () => {
        let uri = null;
        beforeEach(() => {
            uri = new UriParser('http://user:password@www.google.com:9000/foo/bar?dog=cat&abc=123#hashhash');
        });
        afterEach(() => {
            uri = null;
        });
        it('can read the URI parts', () => {
            expect(uri.toString()).toBe('http://user:password@www.google.com:9000/foo/bar?dog=cat&abc=123#hashhash');
            expect(uri.href).toBe('http://user:password@www.google.com:9000/foo/bar?dog=cat&abc=123#hashhash');
            expect(uri.hash).toBe('#hashhash');
            expect(uri.host).toBe('www.google.com:9000');
            expect(uri.hostname).toBe('www.google.com');
            expect(uri.origin).toBe('http://www.google.com:9000');
            expect(uri.password).toBe('password');
            expect(uri.pathname).toBe('/foo/bar');
            expect(uri.port).toBe('9000');
            expect(uri.protocol).toBe('http:');
            expect(uri.search).toBe('?dog=cat&abc=123');
            expect(uri.username).toBe('user');
        });
        it('can manipulate the href', () => {
            uri.href = 'https://dev.derp.io:6/eat/my?thing=rad&fupa=hangdown#dskfjhsdkjhfskdjhf';
            expect(uri.toString()).toBe('https://dev.derp.io:6/eat/my?thing=rad&fupa=hangdown#dskfjhsdkjhfskdjhf');
        });
        it('can manipulate the protocol', () => {
            uri.protocol = 'https:';
            expect(uri.toString()).toBe('https://user:password@www.google.com:9000/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can remove the protocol', () => {
            uri.protocol = null;
            expect(uri.toString()).toBe('/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can manipulate the username', () => {
            uri.username = 'admin';
            expect(uri.toString()).toBe('http://admin:password@www.google.com:9000/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can manipulate the password', () => {
            uri.password = 'ee314271';
            expect(uri.toString()).toBe('http://user:ee314271@www.google.com:9000/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can manipulate the host', () => {
            uri.host = 'www.example.net:1234';
            expect(uri.toString()).toBe('http://user:password@www.example.net:1234/foo/bar?dog=cat&abc=123#hashhash');
            uri.host = 'www.example.org';
            expect(uri.toString()).toBe('http://user:password@www.example.org/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can manipulate the hostname', () => {
            uri.hostname = 'www.example.org';
            expect(uri.toString()).toBe('http://user:password@www.example.org:9000/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can remove the hostname', () => {
            uri.hostname = null;
            expect(uri.toString()).toBe('/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can manipulate the port', () => {
            uri.port = '7777';
            expect(uri.toString()).toBe('http://user:password@www.google.com:7777/foo/bar?dog=cat&abc=123#hashhash');
        });
        it('can manipulate the path', () => {
            uri.pathname = '/i/love/cats';
            expect(uri.toString()).toBe('http://user:password@www.google.com:9000/i/love/cats?dog=cat&abc=123#hashhash');
        });
        it('can manipulate the search', () => {
            uri.search = '?sweet=caroline';
            expect(uri.toString()).toBe('http://user:password@www.google.com:9000/foo/bar?sweet=caroline#hashhash');
            expect(uri.searchParams.entries).toEqual([ [ 'sweet', 'caroline' ] ]);
        });
        it('can manipulate the hash', () => {
            uri.hash = '#woooohoooo';
            expect(uri.toString()).toBe('http://user:password@www.google.com:9000/foo/bar?dog=cat&abc=123#woooohoooo');
        });
        it('can manipulate the search params', () => {
            uri.searchParams = new UriSearchParams('i=am&a=horse');
            expect(uri.toString()).toBe('http://user:password@www.google.com:9000/foo/bar?i=am&a=horse#hashhash');
        });
    });
    describe('Simple URI operations', () => {
        let uri = null;
        beforeEach(() => {
            uri = new UriParser('http://www.google.com');
        });
        afterEach(() => {
            uri = null;
        });
        it('can read the URI parts', () => {
            expect(uri.toString()).toBe('http://www.google.com/');
            expect(uri.href).toBe('http://www.google.com/');
            expect(uri.hash).toBe('');
            expect(uri.host).toBe('www.google.com');
            expect(uri.hostname).toBe('www.google.com');
            expect(uri.origin).toBe('http://www.google.com');
            expect(uri.password).toBe('');
            expect(uri.pathname).toBe('/');
            expect(uri.port).toBe('');
            expect(uri.protocol).toBe('http:');
            expect(uri.search).toBe('');
            expect(uri.username).toBe('');
        });
    });
    describe('Search params', () => {
        describe('construction', () => {
            it('can construct a search params object', () => {
                let sp = new UriSearchParams();
                expect(sp).toBeDefined();
                expect(sp.entries).toEqual([]);
            });
            it('can construct a params object with and without the leading ?', () => {
                let sp1 = new UriSearchParams('?hello=my&friend=hello');
                expect(sp1.entries.length).toBe(2);
                let sp2 = new UriSearchParams('?hello=my&friend=hello&neil=diamond');
                expect(sp2.entries.length).toBe(3);
            });
        });
        describe('functionality', () => {
            let uri = null;
            let params = null;
            beforeEach(() => {
                uri = new UriParser('http://www.example.com?foo=bar&x=dog&x=cat');
                params = uri.searchParams;
            });
            afterEach(() => {
                uri = null;
                params = null;
            });
            it('can add and delete paramters', () => {
                params.append('abc', '123');
                expect(params.entries).toEqual([ [ 'foo', 'bar' ], [ 'x', 'dog' ], [ 'x', 'cat' ], [ 'abc', '123' ] ]);
                expect(uri.search).toBe('?foo=bar&x=dog&x=cat&abc=123');
                params.delete('x');
                expect(params.entries).toEqual([ [ 'foo', 'bar' ], [ 'abc', '123' ] ]);
                expect(uri.search).toBe('?foo=bar&abc=123');
            });
            it('can get parameters', () => {
                expect(params.get('x')).toBe('dog');
                expect(params.getAll('x')).toEqual([ 'dog', 'cat' ]);
                expect(params.getAll('foo')).toEqual([ 'bar' ]);
            });
            it('can check if a parameter exists', () => {
                expect(params.has('foo')).toBe(true);
                expect(params.has('bar')).toBe(false);
            });
            it('can set a parameter name', () => {
                params.set('x', 'skunk');
                expect(params.getAll('x')).toEqual([ 'skunk' ]);
                expect(uri.search).toBe('?foo=bar&x=skunk');
            });
            it('can get the parameter string back', () => {
                expect(params.toString()).toBe('foo=bar&x=dog&x=cat');
            });
        });
    });
});
