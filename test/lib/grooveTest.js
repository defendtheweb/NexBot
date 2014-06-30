// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var Groove = require('../../src/lib/groove');

describe('Lib Groove', function () {

    before(function () {
        // Force all http(s) connections to be mocked
        nock.disableNetConnect();
    });

    after(function () {
        // Cleanup
        nock.enableNetConnect();
    });

    afterEach(function () {
        nock.cleanAll();
    });

    describe('#shorten', function() {
        it('should return a short url to a song name', function(done){
            var tinysongReq = nock('http://tinysong.com')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    'song': 'testSong',
                    'url': "http:\/\/tinysong.com\/6OAB"
                });

            var groove = new Groove('API_KEY');
            groove.shorten('testSong', function(err, result) {
                if(err) {
                    return done(err);
                }

                assert.propertyVal(result, 'song', 'testSong');
                tinysongReq.done();
                done();
            });
        });

        it('should set error for bad responses', function(done) {
            var tinysongReq = nock('http://tinysong.com')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(500, '');

            var groove = new Groove('API_KEY');
            groove.shorten('testSong', function(err, result) {
                assert.isNotNull(err,
                    'should have set error flag on invalid response');
                done();
            });
        });
    });
});
