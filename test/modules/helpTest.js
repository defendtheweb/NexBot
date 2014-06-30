// Make sure jsHint allows the use of Mocha-globals
/* global describe, it, before, after, beforeEach, afterEach */

var assert = require('chai').assert;
var nock = require('nock'); // nock allows for mocking http(s) requests
var sinon = require('sinon'); // SinonJS creates stubs/mocks/spies on js objects

// See beforeTest for why this is included
var fs = require("fs");

// Import the module to test
var help = require("../../src/modules/help/help");

describe('Module Help', function () {

    before(function(){
        // We need to provide an irc client, an empty one will do
        global.irc = {
            'client': {
                'say': function(){}
            }
        };
    });

    after(function(){
        delete global.irc;
    });

    var stubIrcSay, stubReadFile;
    beforeEach(function(){
        // Stub the client.say method for each test
        stubIrcSay = sinon.stub(global.irc.client, 'say');
        
        // Hackis way to stub the readFile method. require's are cached
        // so the same object will be returned in the module under test.
        // meaning we can overwrite methods here first...
        stubReadFile = sinon.stub(fs, 'readFile');

    });

    afterEach(function(){
        stubIrcSay.restore();
        stubReadFile.restore();
        nock.cleanAll();
    });

    describe('#handlePM()', function () {
        it('should list loaded modules when said without arguments', function(){
            global.modules = {'testModule': true};
            
            help.handlePM('testUser', 'help');

            delete global.modules;

            assert.isTrue(stubIrcSay.calledOnce);
            // [0][1] - First call, message sent
            assert.include(stubIrcSay.args[0][1], 'testModule');

        });

        it('should print an error if help for module was not found', function(){
            stubReadFile.callsArgWith(1, new Error(), '');
            
            help.handlePM('testUser', 'help NonExistingModuleName');

            assert.isTrue(stubIrcSay.calledOnce, 'Should have sent one message');
            // [0][1] - First call, message sent
            assert.include(stubIrcSay.args[0][1], 'Help not found');
            
        });

        it('should print the usage info from the module\'s readme file.', function(){
            stubReadFile.callsArgWith(1, false, 'HelpFileContents');
            
            help.handlePM('testUser', 'help ExistingModuleName');

            assert.isTrue(stubIrcSay.calledOnce, 'Should have sent one message');
            // [0][1] - First call, message sent
            assert.include(stubIrcSay.args[0][1], 'HelpFileContents');
        });

        it('should not match module names containing path traversal characters', function(){
            // https://www.owasp.org/index.php/Testing_for_Path_Traversal_(OWASP-AZ-001)
            help.handlePM('testUser', 'help ./');
            help.handlePM('testUser', 'help ../');
            help.handlePM('testUser', 'help /');
            help.handlePM('testUser', 'help test/./test');
            help.handlePM('testUser', 'help test/../test');
            help.handlePM('testUser', 'help /test');
            help.handlePM('testUser', 'help %2e%2e%2f'); // ../
            help.handlePM('testUser', 'help %2e%2e/'); // ../
            help.handlePM('testUser', 'help ..%2f'); // ../
            help.handlePM('testUser', 'help \\\\');

            assert.deepEqual(stubReadFile.args, []);

        });
    });

});