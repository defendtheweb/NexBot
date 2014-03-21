var irc = require('irc');
var Mock = require('./mock');

/**
 * A mock implementation of the irc.Client class.
 * @constructor
 */
function MockIrcClient() {
}
MockIrcClient.prototype = new Mock(irc.Client.prototype);

module.exports = MockIrcClient;
