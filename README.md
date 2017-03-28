# MindTouch HTTP (mindtouch-http.js)

A JavaScript library to construct URLs and make HTTP requests using the fetch API.

To use the Uri inteface, construct a new Uri and manipulate the resulting object:

```
const uri = new Uri('http://www.example.com');
uri.addSegments('foo', 'bar');
uri.setQueryParam('abc', 123);
uri.addQueryParam('multi', 'one');
uri.addQueryParam('multi', 'two');

const newUri = uri.toString();
// newUri is "http://www.example.com/foo/bar?abc=123&multi=one&multi=two"
```

To use the Plug interface, construct a new
Plug and use it to build up the request URI and perform HTTP requests:

```
const plug = new Plug('http://www.example.com');
plug.at('users').withParam('filter', 'abc').get().then((response) => {
    // response is a fetch API Response object
    return response.json();
}).then((usersList) => {
    // usersList is the parsed respose from the HTTP body
});
```