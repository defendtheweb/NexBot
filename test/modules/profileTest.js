
global.config = {
	get: function(){return'';}
};

// Import the module to test
var profile = require("../../src/modules/profile/profile");

delete global.config;