// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var example = require("../../modules/example/example");

describe('Module Example', function () {

    before(function(){
        // We need to provide an irc client, an empty one will do
        global.irc = {
            'client': {
                'say': function(){}
            }
        };
    });

    after(function(){
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
        it('should send "Hello channel" to the channel', function () {

            // Fake a message to the channel testChan
            example.handle('testFrom', 'testChan', 'testMsg');

            assert.isTrue(stubIrcSay.calledOnce);
            assert.deepEqual(stubIrcSay.args[0], ['testChan', 'Hello channel']);
        });
    });

    describe('#handlePM()', function () {
        it('should send "Hello <user>" to the user', function () {

            // Fake a PM from 'testUser'
            example.handlePM('testUser', 'testMsg');

            assert.isTrue(stubIrcSay.calledOnce);
            assert.deepEqual(stubIrcSay.args[0], ['testUser', 'Hello testUser']);
        });
    });
});
