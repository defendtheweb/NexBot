// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var admin = require("../../modules/admin/admin");

describe('Module Admin', function () {

    before(function(){
        global.irc = {
            'client': {
                'say': function(){},
                'join': function(){},
                'part': function(){},
                'send': function(){}
            }
        };
        global.config = {
            'get': function(){}
        };
    });

    after(function(){
        delete global.irc;
        delete global.config;
    });

    var stubIrcSay, stubIrcJoin, stubIrcPart, stubIrcSend;
    beforeEach(function(){
        // Stub the client.say method for each test
        stubIrcSay = sinon.stub(global.irc.client, 'say');
        stubIrcJoin = sinon.stub(global.irc.client, 'join');
        stubIrcPart = sinon.stub(global.irc.client, 'part');
        stubIrcSend = sinon.stub(global.irc.client, 'send');
    });

    afterEach(function(){
        stubIrcSay.restore();
        stubIrcJoin.restore();
        stubIrcPart.restore();
        stubIrcSend.restore();
        nock.cleanAll();
    });

    describe('#handlePM()', function () {
        it('should not do anything if user is not admin', function () {
            var mockConfigGet = sinon.stub(global.config, 'get');
            mockConfigGet.withArgs("admin").returns([]);

            admin.handlePM('testUser', 'join #testChan');
            admin.handlePM('testUser', 'leave #testChan');
            admin.handlePM('testUser', 'nick NexBot');

            mockConfigGet.restore();

            assert.equal(stubIrcJoin.callCount, 0);
            assert.equal(stubIrcPart.callCount, 0);
            assert.equal(stubIrcSend.callCount, 0);
        });

        it('should allow admin to tell bot to join/leave a channel', function () {
            var mockConfigGet = sinon.stub(global.config, 'get');
            mockConfigGet.withArgs("admin").returns(['testUser']);

            admin.handlePM('testUser', 'join #testChan');
            admin.handlePM('testUser', 'leave #testChan');

            mockConfigGet.restore();

            assert.isTrue(stubIrcJoin.calledOnce);
            assert.isTrue(stubIrcPart.calledOnce);

            // [0][0] - First call, first argument (the channel to join/leave)
            assert.equal(stubIrcJoin.args[0][0], '#testChan');
            assert.equal(stubIrcPart.args[0][0], '#testChan');
        });

        it('should allow admin to tell bot to change nick', function(){
            var mockConfigGet = sinon.stub(global.config, 'get');
            mockConfigGet.withArgs("admin").returns(['testUser']);

            admin.handlePM('testUser', 'nick newNick');

            mockConfigGet.restore();

            assert.isTrue(stubIrcSend.calledOnce);
            assert.deepEqual(stubIrcSend.args[0], ['NICK', 'newNick']);
        });
    });
});
