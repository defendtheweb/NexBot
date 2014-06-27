// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var apiLogger = require('../../src/modules/apiLogger/apiLogger');

describe('Module APILogger', function () {

    before(function () {
        // Force all http(s) connections to be mocked
        nock.disableNetConnect();

        global.config = {
            'get': function () {
                return 'API_KEY';
            }
        };
    });

    after(function () {
        // Cleanup
        nock.enableNetConnect();
        delete global.config;
    });

    afterEach(function () {
        nock.cleanAll();
    });

    describe('#handle()', function () {

        it('should log all messages sent', function (done) {
            var apiReq = nock('https://www.hackthis.co.uk')
                .post('/?key=API_KEY&api&action=irc.log')
                .reply(200, '');

            // Prevent error spam to console.
            var _consoleLog = console.log;
            console.log = function(){};

            apiLogger.handle('testUser', 'testChannel', 'testMessage');

            setTimeout(function() {
                console.log = _consoleLog;
                apiReq.done();
                done();
            }, 10);
        });

    });

});