// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Get the assert module from chai.
var assert = require('chai').assert;

// Override the global irc with a mock implementation that writes
// calls to global.irc.client.say to the saidMessages array.
// NOTE: This function must be called before every call to a method that 
// uses global.irc as the order which tests are run is not know and we 
// have to make sure we are writing to the correct saidMessages array.
var saidMessages = [];
var overrideIRC = function() {
	global.irc = {
		client: {
			say: function(chan, msg) {
				saidMessages.push({
					chan: chan,
					msg: msg
				});
			}
		}
	};
};

// Override global objects used by the Greeting module
var overrideGlobals = function() {
	global.config = {
		get: function(what) {
			if (what === 'greeting') {
				return 'testGreeting';
			} else if (what === 'nick') {
				return 'testNick';
			} else if (what === 'greeting-ignore') {
				return ['ignoredTestNick'];
			}
		}
	};
};

// Import our module we want to test
overrideGlobals();
var Greeting = require("../../modules/greeting.js");


describe('Module Greeting', function() {
	describe('#join()', function() {
		it('should send a greeting to users joining the channel', function() {
			saidMessages = [];
			overrideIRC();
			overrideGlobals();

			// Fake a join to the channel testChan
			Greeting.join('testChan', 'testUser', 'testMsg');

			assert.deepEqual(saidMessages, [{
				chan: 'testChan',
				msg: 'testGreeting testUser'
			}]);
		});

		it('should not send greeting to itself when joining the channel', function() {
			saidMessages = [];
			overrideIRC();
			overrideGlobals();

			// Fake a join of itself to the channel testChan
			Greeting.join('testChan', 'testNick', 'testMsg');

			assert.deepEqual(saidMessages, []);
		});

		it('should not send greeting to a user if the user is on the greeting-ignore list', function() {
			saidMessages = [];
			overrideIRC();
			overrideGlobals();

			// Fake a join of itself to the channel testChan
			Greeting.join('testChan', 'ignoredTestNick', 'testMsg');

			assert.deepEqual(saidMessages, []);
		});
	});
});