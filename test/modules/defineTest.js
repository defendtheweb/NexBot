// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// The module to test. Can not be imported here as it requires
// global.config to exist.
var define;

describe('Module Define', function () {

    before(function () {
        // Force all http(s) connections to be mocked
        nock.disableNetConnect();

        global.irc = {
            'client': {
                'say': function () {
                }
            }
        };
        global.config = {
            get: function () {
                return '';
            }
        };

        define = require('../../src/modules/define/define');
    });

    after(function () {
        // Cleanup
        nock.enableNetConnect();
        delete global.irc;
        delete global.config;
    });

    var stubIrcSay;
    beforeEach(function () {
        // Stub the client.say method for each test
        stubIrcSay = sinon.stub(global.irc.client, 'say');
    });

    afterEach(function () {
        // Cache is no good when testing
        define.words = {};
        stubIrcSay.restore();
        nock.cleanAll();
    });

    describe('#handle()', function () {
        it('should return a definition for a word', function (done) {
            var wordnikReq = nock('http://api.wordnik.com')
                .filteringPath(function(path){
                    return '/'; // Don't care about the api path
                })
                .get('/')
                .reply(200, [{"text":"testDef"}]);

            define.handle('testUser', 'testChannel', '!define test');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce);
                assert.deepEqual(stubIrcSay.args[0],
                    ['testChannel', 'test: testDef']);
                wordnikReq.done();
                done();
            }, 10);
        });

        it('should return the first definition if more than one', function (done) {
            var wordnikReq = nock('http://api.wordnik.com')
                .filteringPath(function(path){
                    return '/'; // Don't care about the api path
                })
                .get('/')
                .reply(200, [{"text":"testDef"}, {"text":"Nope"}]);

            define.handle('testUser', 'testChannel', '!define test');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce);
                assert.deepEqual(stubIrcSay.args[0],
                    ['testChannel', 'test: testDef']);
                wordnikReq.done();
                done();
            }, 10);
        });

        it('should print an error if no definitions could be found', function (done) {
            var wordnikReq = nock('http://api.wordnik.com')
                .filteringPath(function(path){
                    return '/'; // Don't care about the api path
                })
                .get('/')
                .reply(200, '[]');

            define.handle('testUser', 'testChannel', '!define test');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce);
                wordnikReq.done();
                done();
            }, 10);
        });
    });
});
