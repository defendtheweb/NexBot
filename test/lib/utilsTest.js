// Make sure jsHint allows the use of Mocha-globals
/* global describe, it */

// Get the assert module from chai.
var assert = require('chai').assert;

// Import our module we want to test
var utils = require("../../lib/utils.js");

describe('Lib utils', function () {
    describe('#addCommas()', function () {
        it('Should add commas to a pure number string', function () {
            var number = "123456.7891";
            var result = utils.addCommas(number);

            assert.isString(result, "The return value should be a string");
            assert.equal(result, "123,456.7891", "The value should be formatted with commas every 3rd value digit.");
        });

        it('Should add commas to a js Number', function () {
            var number = 123456.7891;
            var result = utils.addCommas(number);

            assert.isString(result, "The return value should be a string");
            assert.equal(result, "123,456.7891", "The value should be formatted with commas every 3rd value digit.");
        });

        it('Should not parse strings that already contain commas', function () {
            var number = "123,456.7891";
            var result = utils.addCommas(number);

            assert.isString(result, "The return value should be a string");
            assert.equal(result, "123,456.7891", "There should not be additional commas if string already has commas.");
        });

        it('Should remove unnecessary zeroes', function() {
            var number = "0123456.78910";
            var result = utils.addCommas(number);

            assert.isString(result, "The return value should be a string");
            assert.equal(result, "123,456.7891", "The string should have unnecessary zeroes trimmed.");
        });
    });
});
