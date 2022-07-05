## Common Application Login

Almost every application requires the login as the entrance point.  This node project provides the bare mininum implmementation of node-epress-passport employing local strategy.

Note, your .env file should contain the following defines:

```
PORT=####
NODE_ENV=development
SESSION_SECRET=your secret
```

Read file *package.json* to find out how to start the application.  Currently, it is `npm run dev`.

Note also, this template requires further database implementation if you wish to save session data on the server side.  Currently, session data is wiped out if you restarted the server.

### Modules and dependencies

The followings modules are some essential components for implementing the usual application login.  It can be used as a template for those who wish to not start from scratch.  These module can be found listed in package.json file.  It is recommended that you should check with the NPM registry for throurough details on each named modules bellow.

* [express](https://www.npmjs.com/package/express) module is a light weight server that is fast, unopinionated, web framework for node.  Together with nodejs is made up the popular framework by which additional modules can be extended.

* [dotenv](https://www.npmjs.com/package/dotenv) module is used to store and retrieve secrets in .env file

* [ejs](https://www.npmjs.com/package/ejs) module is an embedded javascript template used to simplify express views.  Files create under views folder should be named *.ejs

* [express-flash](https://www.npmjs.com/package/express-flash) is an extension of connect-flash with the ability to define a flash message and render it without redirecting the request.  Implement in views/*.ejs files.

* [express-session](https://www.npmjs.com/package/express-session) is used to create session middleware in the cookie retaining just the session ID.  The full session object must be saved on the server side and compared with client session ID for authentication.

* [passport](https://www.npmjs.com/package/passport) is Express-compatible authentication middleware for nod.js.  Its sole purpose is to authenticate requests via an extensible set of plugins known as strategies. Passport does not mount routes or assume any particular database schema, which maximizes flexibility and allows application-level decisions to be made by the developer. The API is simple: you provide Passport a request to authenticate, and Passport provides hooks for controlling what occurs when authentication succeeds or fails.

* [passport-local](https://www.npmjs.com/package/passport-local) is one of the  strategies for authenticating with a username and password.  This module lets you authenticate using a username and password in your Node.js applications. By plugging into Passport, local authentication can be easily and unobtrusively integrated into any application or framework that supports Connect-style middleware, including Express.

