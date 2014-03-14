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

// Import our module we want to test
var Example = require("../../modules/example.js");


describe('Module Example', function() {

	describe('#handle()', function() {
		it('should send "Hello channel" to the channel', function() {
			saidMessages = [];
			overrideIRC();

			// Fake a message to the channel testChan
			Example.handle('testFrom', 'testChan', 'testMsg');

			assert.deepEqual(saidMessages, [{
				chan: 'testChan',
				msg: 'Hello channel'
			}]);
		});
	});

	describe('#handlePM', function() {
		it('should send "Hello <user>" to the user', function() {
			saidMessages = [];
			overrideIRC();

			// Fake a PM from 'testUser'
			Example.handlePM('testUser', 'testMsg');
			
			assert.deepEqual(saidMessages, [{
				chan: 'testUser',
				msg: 'Hello testUser'
			}]);
		});
	});
});