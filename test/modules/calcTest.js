// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Get the assert module from chai.
var assert = require('chai').assert;

// Create global.irc object, as it is used by the module
global.irc = {};

// Create a mock irc client
var mockIrcClient = new (require('./../mock').MockIrcClient)();

// Import our module we want to test
var Calculator = require("../../modules/calc/calc");

describe('Module Calculator', function () {
    describe('#handle()', function () {
        it('should calculate the result of a math expression if prepended by !calc', function () {

            global.irc.client = mockIrcClient.reset();

            // Fake a message to the channel testChan
            Calculator.handle('testFrom', 'testChan', '!calc 2+2');

            assert.deepEqual(mockIrcClient.getMethodCalls("say"), [
                [
                    'testChan',
                    '2+2 = 4'
                ]
            ]);
        });

        it('should not run if message not prepended by !calc', function () {
            global.irc.client = mockIrcClient.reset();

            // Fake a message to the channel testChan
            Calculator.handle('testFrom', 'testChan', '!notCalc 2+2');

            assert.deepEqual(mockIrcClient.getMethodCalls("say"), []);

        });

        it('should not crash if input is not a math expression', function () {
            global.irc.client = mockIrcClient.reset();

            // Fake some invalid message to the channel testChan
            Calculator.handle('testFrom', 'testChan', '!calc .^&%¤3');
            Calculator.handle('testFrom', 'testChan', '!calc a=this; a*2');
            Calculator.handle('testFrom', 'testChan', '!calc ');

            assert.deepEqual(mockIrcClient.getMethodCalls("say"), []);
        });
    });
});
