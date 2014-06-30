// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var imdb = require("../../src/modules/imdb/imdb");

describe('Module Imbd', function () {

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
    });

    describe('#handle()', function () {
        it('should return information about the specified movie', function(done){
            var omdbReq = nock('http://www.omdbapi.com')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    Title: "TestMovie",
                    imdbRating: "10.0",
                    Plot: "TestPlot"
                });

            imdb.handle('testUser', 'testChannel', '!imdb testMovie');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce, 'Should have sent one message');
                // [0][1] - First call, message sent
                assert.include(stubIrcSay.args[0][1], 'TestMovie');
                omdbReq.done();
                done();
            }, 10);
        });

        it('should handle non-ok responses', function(done){
            var omdbReq = nock('http://www.omdbapi.com')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(404, '')
                .get('/')
                .reply(200, '{[INVALID_JSON*/')
                .get('/')
                .reply(200, '{}');

            imdb.handle('testUser', 'testChannel', '!imdb testMovie'); 
            imdb.handle('testUser', 'testChannel', '!imdb testMovie'); 
            imdb.handle('testUser', 'testChannel', '!imdb testMovie'); 

            setTimeout(function() {
                omdbReq.done();
                done();
            }, 10);
        });

        it('should URI encode the search term', function(){
            var http = require('http');
            var httpRequestStub = sinon.stub(http, 'request');
            httpRequestStub.returns({end: function(){}, on: function(){}});
            
            imdb.handle('testUser', 'testChannel', '!imdb test&param=val');
            
            var reqUrl = '';
            if(httpRequestStub.callCount > 0) {
                reqUrl = httpRequestStub.args[0][0];
            }
            httpRequestStub.restore();

            assert.notInclude(reqUrl, '&param=val');
        });
    });
});
