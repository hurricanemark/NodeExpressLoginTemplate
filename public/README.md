# Passport.JS Local Session Strategy

Passport uses `serializeUser` function to persist user data (after successful authentication) into session. Function `deserializeUser` is used to retrieve user data from session.

* Where does user.id go after passport.serializeUser has been called?

The user id (provided as the second argument of the done function) is saved in the session and is later used to retrieve the whole object via the deserializeUser function.

`serializeUser` determines which data of the user object should be stored in the session. The result of the serializeUser method is attached to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide the user id as the key) req.session.passport.user = {id: 'xyz'}



* Calling passport.deserializeUser right after it where does it fit in the workflow?

The first argument of `deserializeUser` corresponds to the key of the user object that was given to the done function (see 1.). So the whole object is retrieved with the help of that key. That key here is the user id (key can be any key of the user object i.e. name,email etc). In deserializeUser that key is matched with the in memory array / database or any data resource.

The fetched object is attached to the request object as req.user.


```javascript
passport.serializeUser(function(user, done) {
    done(null, user.id);
});              │
                 │ 
                 │
                 └─────────────────┬──→ saved to session
                                   │    req.session.passport.user = {id: '..'}
                                   │
                                   ↓           
passport.deserializeUser(function(id, done) {
                   ┌───────────────┘
                   │
                   ↓ 
    User.findById(id, function(err, user) {
        done(err, user);
    });            └──────────────→ user object attaches to the request as req.user   
});
```

Both serializeUser and deserializeUser functions check first argument passed to them, and if it's of type function, serializeUser and deserializeUser do nothing, but put those functions in a stack of functions, that will be called, afterwards (when passed first arguments are not of type function). Passport needs the following setup to save user data after authentication in the session:

app.use(session({ secret: "cats" }));
app.use(passport.initialize());
app.use(passport.session());

The order of used middlewares matters. It's important to see, what happens, when a new request starts for authorization:

    session middleware creates session (using data from the sessionStore).

    passport.initialize assigns _passport object to request object, checks if there's a session object, and if it exists, and field passport exists in it (if not - creates one), assigns that object to session field in _passport. At the end, it looks, like this:

    req._passport.session = req.session['passport']

    So, session field references object, that assigned to req.session.passport.

    passport.session looks for user field in req._passport.session, and if finds one, passes it to deserializeUser function and calls it. deserializeUser function assigns req._passport.session.user to user field of request object (if find one in req._passport.session.user). This is why, if we set user object in serializeUser function like so:

    passport.serializeUser(function(user, done) {
      done(null, JSON.strignify(user)); 
    });

    We then need to parse it, because it was saved as JSON in user field:

     passport.deserializeUser(function(id, done) {
       // parsed user object will be set to request object field `user`
       done(err, JSON.parse(user));
     });

So, deserializeUser function firstly called, when you setup Passport, to put your callback in _deserializers function stack. Second time, it'll be called in passport.session middleware to assign user field to request object. That also triggers our callback (that we put in passport.deserializeUser()) before assigning user field.

serializeUser function called first, when you setup Passport (similarly to deserializeUser function), but it'll be used to serialize user object for saving in session. Second time, it'll be called, in login/logIn (alias) method, that attached by Passport, and used to save user object in session. serializeUser function also checks _serializers stack with already pushed to it functions (one of which added, when we set up Passport):

passport.serializeUser(function(user, done) ...

and calls them, then assigns user object (strignified) or user id to req._passport.session.user. It is important to remember that session field directly references passport field in req.session object. In that way user saved in session (because req._passport.session references object req.session.passport, and req._passport.session is modified in each incoming request by passport.initialize middleware). When request ends, req.session data will be stored in sessionStore.

What happens after successful authorization, when the second request starts:

    session middleware gets session from sessionStore, in which our user data already saved
    passport.initialize checks if there's session and assigns req.session.passport to req._passport.session
    passport.session checks req._passport.session.user and deserializes it. At this stage (if req._passport.session.user is truthy), we'll have req.user and req.isAuthenticated() returns true.
