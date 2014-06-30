

global.config = {
	get: function(){return'';}
};
global.modules = {
	'lastfm': true
};

// Import the module to test
var grooveshark = require("../../src/modules/grooveshark/grooveshark");

delete global.modules;
delete global.config;