# Passport-Trakt

[Passport](http://passportjs.org/) strategy for authenticating with [Trakt](http://trakt.tv/)
using the OAuth 2.0 API.

This module lets you authenticate using Trakt in your Node.js applications.
By plugging into Passport, Trakt authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-trakt

## Usage

#### Configure Strategy

The Trakt authentication strategy authenticates users using a Trakt account
and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a client ID, client secret, and callback URL.

    passport.use(new TraktStrategy({
        clientID: TRAKT_CLIENT_ID,
        clientSecret: TRAKT_CLIENT_SECRET,
        callbackURL: "https://127.0.0.1:3000/auth/trakt/callback"
      },
      function(accessToken, refreshToken, params, profile, done) {
        User.findOrCreate({ traktId: profile.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'trakt'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/trakt',
      passport.authenticate('trakt'));

    app.get('/auth/trakt/callback', 
      passport.authenticate('trakt', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/alexperrault/passport-trakt/tree/master/examples/login).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/alexperrault/passport-trakt.png)](http://travis-ci.org/alexperrault/passport-trakt)

## Credits

  - [Alexandre Perrault](http://github.com/alexperrault)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015 Alexandre Perrault <[http://perrau.lt/](http://perrau.lt/)>

