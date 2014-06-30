// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var imgur = require("../../src/modules/imgur/imgur");

describe('Module Imgur', function () {

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
        // Clear imgur cache
        imgur._cachedResults = [];
    });

    describe('#handle()', function () {
        it('should display a random image when called without arguments', function(done) {
            var imgurReq = nock('https://api.imgur.com')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    'data': [{
                        'is_album': false, 
                        'link': 'http://imgur.com/',
                        'title': 'testTitle', 
                        'ups': 2, 
                        'downs': 3
                    }]
                });


            imgur.handle('testUser', 'testChannel', '!imgur');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce, 'Should have sent one message');
                // [0][1] - First call, message sent
                assert.include(stubIrcSay.args[0][1], 'testTitle');
                imgurReq.done();
                done();
            }, 10);
        });

        it('should not display NSFW images if includeNSFW is false', function(done) {
            var imgurReq = nock('https://api.imgur.com')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    'data': [{
                        'is_album': false,
                        'link': 'http://imgur.com/',
                        'title': 'testNSFW',
                        'nsfw': true,
                        'ups': 2, 
                        'downs': 3
                    }]
                });

            var prevIncludeNSFW = imgur.includeNSFW;
            imgur.includeNSFW = false;
            imgur.handle('testUser', 'testChannel', '!imgur');
            imgur.includeNSFW = prevIncludeNSFW;

            setTimeout(function() {
                // If any calls to say was made, make sure they do not
                // include the nsfw image
                for(var i = 0; i < stubIrcSay.args.length; i++) {
                    assert.notInclude(stubIrcSay.args[i][1], 'testNSFW');
                }
                
                imgurReq.done();
                done();
            }, 10);
        });

        it('should handle non-200 responses', function(done) {
            var imgurReq = nock('https://api.imgur.com')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(500, '')
                .get('/')
                .reply(200, '{[INVALID_JSON*/')
                .get('/')
                .reply(200, '{}');

            // Prevent error spam to console.
            var _consoleLog = console.log;
            console.log = function(){};

            imgur.handle('testUser', 'testChannel', '!imgur');
            imgur.handle('testUser', 'testChannel', '!imgur');
            imgur.handle('testUser', 'testChannel', '!imgur');

            setTimeout(function() {
                console.log = _consoleLog;
                imgurReq.done();
                done();
            }, 10);
        });
    });

});