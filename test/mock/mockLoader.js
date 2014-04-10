var Mock = require('./mock');
var Loader = require('./../../loader');

/**
 * A mock of the Loader class.
 * @param initialData An object containing initial data to hold.
 * @param allowSet Boolean indicating if the set method can change the initial data.
 * @constructor
 */
function MockLoader(initialData, allowSet) {
    var data = (typeof initialData === 'object') ? initialData : {};
    allowSet = !!allowSet;

    this.get = function get(key) {
        this.registerMethodCall('get', arguments);
        return data[key];
    };

    this.set = function set(key, value) {
        this.registerMethodCall('set', arguments);
        if (allowSet) {
            data[key] = value;
        }
        this.save();
    };
}

MockLoader.prototype = new Mock(Loader.prototype);

module.exports = MockLoader;
