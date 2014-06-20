// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects


describe('Module Greeting', function () {

    before(function(){
        // Force all http(s) connections to be mocked
        nock.disableNetConnect();
        // We need to provide an irc client, an empty one will do
        global.irc = {
            'client': {
                'say': function(){}
            }
        };
        // We also need a config object
        global.config = {
            'get': function(){}
        };
    });

    after(function(){
        // Cleanup
        nock.enableNetConnect();
        delete global.config;
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

    describe('#join()', function () {
        it('should send a greeting to users joining the channel', function () {

            var mockConfigGet = sinon.stub(global.config, 'get');
            mockConfigGet.withArgs("greeting").returns("testGreeting");
            mockConfigGet.withArgs("nick").returns("NexBot");
            mockConfigGet.withArgs("greeting-ignore").returns([]);

            var greeting = require('../../modules/greeting/greeting');
            greeting.join('testChan', 'testUser', 'testMsg');

            mockConfigGet.restore();

            assert.isTrue(stubIrcSay.calledWith('testChan', 'testGreeting testUser'));
        });

        it('should not send greeting to itself when joining the channel', function () {
            var selfName = 'NexBot';
            var mockConfigGet = sinon.stub(global.config, 'get');
            mockConfigGet.withArgs("greeting").returns("testGreeting");
            mockConfigGet.withArgs("nick").returns(selfName);
            mockConfigGet.withArgs("greeting-ignore").returns([]);

            var greeting = require('../../modules/greeting/greeting');
            greeting.join('testChan', selfName, 'testMsg');

            mockConfigGet.restore();

            assert.equal(stubIrcSay.callCount, 0);
        });

        it('should not send greeting to a user on the ignored list', function () {
            var ignoredName = 'flabby';
            var mockConfigGet = sinon.stub(global.config, 'get');
            mockConfigGet.withArgs("greeting").returns("testGreeting");
            mockConfigGet.withArgs("nick").returns("NexBot");
            mockConfigGet.withArgs("greeting-ignore").returns([ignoredName]);

            var greeting = require('../../modules/greeting/greeting');
            greeting.join('testChan', ignoredName, 'testMsg');

            mockConfigGet.restore();

            assert.equal(stubIrcSay.callCount, 0);
        });

        it('should handle arrays of greetings', function () {

            var mockConfigGet = sinon.stub(global.config, 'get');
            mockConfigGet.withArgs("greeting").returns(["testGreeting"]);
            mockConfigGet.withArgs("nick").returns("NexBot");
            mockConfigGet.withArgs("greeting-ignore").returns([]);

            var greeting = require('../../modules/greeting/greeting');
            greeting.join('testChan', 'testUser', 'testMsg');

            mockConfigGet.restore();

            assert.isTrue(stubIrcSay.calledWith('testChan', 'testGreeting testUser'));
        });
    });
});
