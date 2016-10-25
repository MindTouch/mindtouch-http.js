/* eslint-env node, jasmine, jest */
const cj = require('../lib/cookieJar');
describe('Cookie Jar tests', () => {
    const cookieUrl = 'https://www.example.com';
    it('can get all of the cookies', () => {
        return cj.getCookies(cookieUrl);
    });
    it('can get the cookies as a header string', () => {
        return cj.getCookieString(cookieUrl);
    });
    it('can store an array of cookies', () => {
        return Promise.all([
            cj.storeCookies(cookieUrl, 'c1=foo'),
            cj.storeCookies(cookieUrl, [ 'c1=foo', 'c2=bar' ])
        ]);
    });
});
