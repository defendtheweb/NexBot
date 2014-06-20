// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var issues = require('../../modules/issues/issues');

describe('Module Issues', function () {

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

        it('should respond to the same channel as the command was said to', function(done){
            var channel = '#testChannel';

            var githubReq = nock('https://api.github.com')
                .get('/repos/HackThis/NexBot/issues')
                .reply(200, "[{}]");

            issues.handle('testUser', channel, '!issues');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledWith(channel));
                githubReq.done();
                done();
            }, 10);
        });

        it('should by default return the number of issues for Hackthis/NexBot', function(done){
            var githubReq = nock('https://api.github.com')
                .get('/repos/HackThis/NexBot/issues')
                .reply(200, "[{}]");

            issues.handle('testUser', '#testChannel', '!issues');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce);
                githubReq.done();
                done();
            }, 10);
        });

        it('should set a User-Agent for requests', function(done){
            var githubReq = nock('https://api.github.com')
                .get('/repos/HackThis/NexBot/issues')
                .matchHeader('User-Agent', function(val){return !!val;})
                .reply(200, "[{}]");

            issues.handle('testUser', '#testChannel', '!issues');

            setTimeout(function() {
                githubReq.done();
                done();
            }, 10);
        });

        it('should lookup another repo if one is provided', function(done){
            var testRepo = 'test/testRepo';

            var githubReq = nock('https://api.github.com')
                .get('/repos/' + testRepo + '/issues')
                .reply(200, "[{}]");

            issues.handle('testUser', '#testChannel', '!issues ' + testRepo);

            setTimeout(function() {
                githubReq.done();
                done();
            }, 10);
        });

        it('should handle non-200 responses', function(done){
            var githubReq = nock('https://api.github.com')
                .get('/repos/HackThis/NexBot/issues') // 404 response
                .reply(404, "[{}]")
                .get('/repos/HackThis/NexBot/issues') // Malformed response
                .reply(200, "[{INVALID_JSON*/");

            // Prevent error spam to console.
            var _consoleLog = console.log;
            console.log = function(){};

            issues.handle('testUser', '#testChannel', '!issues');
            issues.handle('testUser', '#testChannel', '!issues');

            setTimeout(function() {
                console.log = _consoleLog;
                githubReq.done();
                done();
            }, 10);
        });

    });
});



