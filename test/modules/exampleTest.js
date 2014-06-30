// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// Import the module to test
var example = require("../../src/modules/example/example");

// Each module should be encapsulated in a describe call, making
// each module a seperate "test-suite", or group of tests that
// belongs togheter.  
describe('Module Example', function () {

    // Before is run once before any tests in this suite.
    before(function(){
        // We need to provide an irc client, an empty one will do.
        // This function is later stubbed by sinon, see the 
        // beforeEach method.
        global.irc = {
            'client': {
                'say': function(){}
            }
        };
    });

    // After is run once after all tests in this suite
    after(function(){
        // Clean-up after our suite. Since we defined a
        // global object in before, delete it here
        delete global.irc;
    });

    // BeforeEach is run before each test in the suite
    var stubIrcSay;
    beforeEach(function(){
        // Stub the client.say method for each test
        stubIrcSay = sinon.stub(global.irc.client, 'say');
    });

    // AfterEach is run after each test in the suite
    afterEach(function(){
        // Restore the stub so that calls in one test does
        // not live on untill the next test
        stubIrcSay.restore();
        // Removes any pending nock mocks (expected url calls)
        nock.cleanAll();
    });

    // Each method tested is also made into a suite/group
    // as to make the formatting of the output clearer.
    describe('#handle()', function () {

        // it defines a test case. The string should describe what
        // the test is testing, and should most likely start with
        // "should". The function is the test to be executed.
        // Keep each test as specific as possible.
        it('should send "Hello channel" to the channel', function () {

            // Fake a message to the channel testChan
            example.handle('testFrom', 'testChan', 'testMsg');

            // The conditions are checked using Chai asserts.
            // The test will complete only if all the asserts
            // pass. The conditions here are both using the sinon
            // stub/spy api.
            assert.isTrue(stubIrcSay.calledOnce);
            assert.deepEqual(stubIrcSay.args[0], ['testChan', 'Hello channel']);
        });

        // It is also possible to test async operations, this is
        // done by providing a function(done){} to it. Note that if
        // you do this, you also have to call done() when you have
        // completed the test.
        it('Should have sent "Hello channel" to the channel after some time', function(done) {
            // Fake a message to the channel testChan
            example.handle('testFrom', 'testChan', 'testMsg');

            // Wait some time...
            setTimeout(function(){
                assert.isTrue(stubIrcSay.calledOnce);
                assert.deepEqual(stubIrcSay.args[0], ['testChan', 'Hello channel']);
                // Note the call to done when we have are done
                done();
            }, 1);
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
