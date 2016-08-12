/* eslint-env node */
const tough = require('tough-cookie');
const _cookieJar = new tough.CookieJar();
module.exports = {
    getCookies(url) {
        return new Promise((resolve) => {
            _cookieJar.getCookies(url, (err, cookies) => {
                resolve(cookies);
            });
        });
    },
    getCookieString(url) {
        return new Promise((resolve) => {
            _cookieJar.getCookieString(url, (err, cookie) => {
                resolve(cookie);
            });
        });
    },
    storeCookies(url, cookies) {
        if(!Array.isArray(cookies)) {
            cookies = [ cookies ];
        }
        return Promise.all(cookies.map((cookie) => {
            return new Promise((setResolve) => {
                _cookieJar.setCookie(cookie, url, () => setResolve());
            });
        }));
    }
};
