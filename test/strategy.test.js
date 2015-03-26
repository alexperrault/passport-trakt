/* global describe, it, expect */
/* jshint expr: true */

var TraktStrategy = require('../lib/strategy');


describe('Strategy', function() {
    
  var strategy = new TraktStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    },
    function() {});
    
  it('should be named trakt', function() {
    expect(strategy.name).to.equal('trakt');
  });
});
