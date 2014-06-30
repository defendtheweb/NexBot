// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var hash = require('../../src/modules/hash/hash');

describe('Module Hash', function () {

    before(function () {
        // Force all http(s) connections to be mocked
        nock.disableNetConnect();
        // We need to provide an irc client, an empty one will do
        global.irc = {
            'client': {
                'say': function () {
                }
            }
        };
    });

    after(function () {
        // Cleanup
        nock.enableNetConnect();
        delete global.irc;
    });

    var stubIrcSay;
    beforeEach(function () {
        // Stub the client.say method for each test
        stubIrcSay = sinon.stub(global.irc.client, 'say');
    });

    afterEach(function () {
        stubIrcSay.restore();
        nock.cleanAll();
    });

    describe('#handle()', function () {

        it('should unhash hash', function(done){
            var leakdbReq = nock('https://api.leakdb.net')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    found: "true",
                    type: "HASH_TYPE",
                    hashes: [{
                        plaintext: "PLAINTEXT"
                    }]
                });

            hash.handle('testUser', 'testChannel', '!hash HASH');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce);
                // [0][1] - First call, message sent
                assert.include(stubIrcSay.args[0][1], 'PLAINTEXT');
                leakdbReq.done();
                done();
            }, 10);
        });

        it('should print an error if hash could not be unhashed', function(done){
            var leakdbReq = nock('https://api.leakdb.net')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    found: "false"
                });

            hash.handle('testUser', 'testChannel', '!hash HASH');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce);
                leakdbReq.done();
                done();
            }, 10);
        });

        it('should print hash type suggestions if hash could not be unhashed', function(done){
            var leakdbReq = nock('https://api.leakdb.net')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    found: "false",
                    type: ["HASHTYPE"]
                });

            hash.handle('testUser', 'testChannel', '!hash HASH');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce);
                // [0][1] - First call, message sent
                assert.include(stubIrcSay.args[0][1], 'HASHTYPE');
                leakdbReq.done();
                done();
            }, 10);
        });

        it('should hash text if type is supplied', function(done){
            var leakdbReq = nock('https://api.leakdb.net')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    found: "false",
                    type: ["HASHTYPE"]
                });

            hash.handle('testUser', 'testChannel', '!hash HASHTYPE HASH');

            setTimeout(function() {
                assert.isTrue(stubIrcSay.calledOnce);
                // [0][1] - First call, message sent
                assert.include(stubIrcSay.args[0][1], 'HASHTYPE');
                leakdbReq.done();
                done();
            }, 10);
        });

        it('should not allow type to trigger using slash commands', function(done){
            //(12:07:27 PM) verath: !hash /me abc
            //(12:07:29 PM) ***NexBot is not supported

            var leakdbReq = nock('https://api.leakdb.net')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    found: "true",
                    type: "plaintext",
                    hashes: [{}]
                });

            hash.handle('testUser', 'testChannel', '!hash /me abc');

            setTimeout(function() {
                // [0][1] - First call, message sent
                assert.notEqual(stubIrcSay.args[0][1].substr(0, 1), '/');
                leakdbReq.done();
                done();
            }, 10);
        });

        it('should not allow result to trigger using slash commands', function(done) {
            // (12:30:14 PM) verath: !hash 7e26c7463b1e75e9707d621cbf6da651
            // (12:30:16 PM) ***NexBot | md5

            var leakdbReq = nock('https://api.leakdb.net')
                .filteringPath(/.*/, '/') // Don't care for api path
                .get('/')
                .reply(200, {
                    found: "true",
                    type: "HASHTYPE",
                    hashes: [{plaintext: "/me"}]
                });

            hash.handle('testUser', 'testChannel', '!hash HASH');

            setTimeout(function() {
                // [0][1] - First call, message sent
                assert.notEqual(stubIrcSay.args[0][1].substr(0, 1), '/');
                leakdbReq.done();
                done();
            }, 10);
        });

    });
});
