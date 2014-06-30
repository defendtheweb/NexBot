
global.config = {
	get: function(){return'';}
};

// Import the module to test
var youtube = require("../../src/modules/youtube/youtube");

delete global.config;