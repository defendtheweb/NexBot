// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Get the assert module from chai.
var assert = require('chai').assert;

// Create global.irc object, as it is used by the module
global.irc = {};

// Create a mock irc client
var mockIrcClient = new (require('./../mock').MockIrcClient)();

// Import our module we want to test
var Issues = require("../../modules/issues");

describe('Module Issues', function () {
    describe('#handle()', function () {
        it('should return the number of issues when a user enters the message "!issues"', function (done) {

            global.irc.client = mockIrcClient.reset();

            // Set up a listener for when a "say" arrives
            mockIrcClient.registerMethodCallListener({
                onMethodCall: function(methodName, methodArgs){
                    if(methodName === 'say') {
                        assert.match(
                            methodArgs[1],
                            /NexBot has \d+ open issues?/,
                            "Wrong message said for num open issues"
                        );

                        done();
                    }
                }
            });

            // Fake an !issues message
            Issues.handle('testFrom', 'testChan', '!issues');

        });
    });
});
