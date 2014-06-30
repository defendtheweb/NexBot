global.config = {
	get: function(){return'';}
};

// Import the module to test
var lastfm = require("../../src/modules/lastfm/lastfm");

delete global.config;