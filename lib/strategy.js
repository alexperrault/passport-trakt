/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , Profile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Trakt authentication strategy authenticates requests by delegating to
 * Trakt using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Trakt application's Client ID
 *   - `clientSecret`  your Trakt application's Client Secret
 *   - `callbackURL`   URL to which Trakt will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new TraktStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/trakt/callback'
 *       },
 *       function(accessToken, refreshToken, params, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://api.trakt.tv/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://api.trakt.tv/oauth/token';
  options.customHeaders = options.customHeaders || {};

  if (!options.customHeaders['trakt-api-version']) {
    options.customHeaders['trakt-api-version'] = options.traktApiVersion || '2';
  }

  if (!options.customHeaders['trakt-api-key']) {
    options.customHeaders['trakt-api-key'] = options.traktApiKey || options.clientID;
  }

  OAuth2Strategy.call(this, options, verify);
  this.name = 'trakt';
  this._userProfileURL = options.userProfileURL || 'https://api.trakt.tv/users/me';
  this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Trakt.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `trakt`
 *   - `id`               the user's Trakt ID
 *   - `username`         the user's Trakt username
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    var json;
    
    if (err) {
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }
    
    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }
    
    var profile = Profile.parse(json);
    profile.provider  = 'trakt';
    profile._raw = body;
    profile._json = json;
    
    done(null, profile);
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
