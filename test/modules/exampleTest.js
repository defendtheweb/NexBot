// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Get the assert module from chai.
var assert = require('chai').assert;

// Create global.irc object, as it is used by the module
global.irc = {};

// Create a mock irc client
var mockIrcClient = new (require('./../mock').MockIrcClient)();

// Import our module we want to test
var Example = require("../../modules/example/example.js");

describe('Module Example', function () {
    describe('#handle()', function () {
        it('should send "Hello channel" to the channel', function () {
            global.irc.client = mockIrcClient.reset();

            // Fake a message to the channel testChan
            Example.handle('testFrom', 'testChan', 'testMsg');

            assert.deepEqual(mockIrcClient.getMethodCalls("say"), [
                [
                    'testChan',
                    'Hello channel'
                ]
            ]);
        });
    });

    describe('#handlePM', function () {
        it('should send "Hello <user>" to the user', function () {
            global.irc.client = mockIrcClient.reset();

            // Fake a PM from 'testUser'
            Example.handlePM('testUser', 'testMsg');

            assert.deepEqual(mockIrcClient.getMethodCalls("say"), [
                [
                    'testUser',
                    'Hello testUser'
                ]
            ]);
        });
    });
});
