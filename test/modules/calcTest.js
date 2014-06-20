// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects


// Import the module to test
var issues = require('../../modules/issues/issues.js');

// Import the module to test
var calculator = require("../../modules/calc/calc");

describe('Module calculator', function () {

    before(function(){
        // Force all http(s) connections to be mocked
        nock.disableNetConnect();
        // We need to provide an irc client, an empty one will do
        global.irc = {
            'client': {
                'say': function(){}
            }
        };
    });

    after(function(){
        // Cleanup
        nock.enableNetConnect();
        delete global.irc;
    });

    var stubIrcSay;
    beforeEach(function(){
        // Stub the client.say method for each test
        stubIrcSay = sinon.stub(global.irc.client, 'say');
    });

    afterEach(function(){
        stubIrcSay.restore();
        nock.cleanAll();
    });


    describe('#handle()', function () {
        it('should calculate the result of a math expression if prepended by !calc', function () {

            calculator.handle('testFrom', 'testChan', '!calc 2+2');
            assert.isTrue(stubIrcSay.calledWith('testChan', '2+2 = 4'));

        });


        it('should not run if message not prepended by !calc', function () {

            // Fake a message to the channel testChan
            calculator.handle('testFrom', 'testChan', '!notCalc 2+2');
            assert.equal(stubIrcSay.callCount, 0);

        });

        it('should not crash if input is not a math expression', function () {
            // Prevent error spam to console.
            var _consoleLog = console.log;
            console.log = function(){};

            // Fake some invalid message to the channel testChan
            calculator.handle('testFrom', 'testChan', '!calc .^&%¤3');
            calculator.handle('testFrom', 'testChan', '!calc a=this; a*2');
            calculator.handle('testFrom', 'testChan', '!calc ');

            console.log = _consoleLog;

            assert.equal(stubIrcSay.callCount, 0);
        });
    });
});
