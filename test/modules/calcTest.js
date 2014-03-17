// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Get the assert module from chai.
var assert = require('chai').assert;

require('./testUtil.js');

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
var Calculator = require("../../modules/calc.js");


describe('Module Calculator', function() {

	describe('#handle()', function() {
		it('should calculate the result of a math expression if prepended by !calc', function() {
			saidMessages = [];
			overrideIRC();
			
			// Fake a message to the channel testChan
			Calculator.handle('testFrom', 'testChan', '!calc 2+2');

			assert.deepEqual(saidMessages, [{
				chan: 'testChan',
				msg: '2+2 = 4'
			}]);
		});

		it('should not run if message not prepended by !calc', function() {
			saidMessages = [];
			overrideIRC();
			
			// Fake a message to the channel testChan
			Calculator.handle('testFrom', 'testChan', '!notCalc 2+2');

			assert.deepEqual(saidMessages, []);

		});

		it('should not crash if input is not a math expression', function() {
			saidMessages = [];
			overrideIRC();
			
			// Fake some invalid message to the channel testChan
			Calculator.handle('testFrom', 'testChan', '!calc .^&%¤3');
			Calculator.handle('testFrom', 'testChan', '!calc a=this; a*2');
			Calculator.handle('testFrom', 'testChan', '!calc ');

			assert.deepEqual(saidMessages, []);
		});
	});
});