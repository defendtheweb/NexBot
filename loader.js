var fs = require('fs');
var Loader = function() { }

Loader.prototype = {
	file: undefined,
	data: {},

	set: function(key, value) {
		this.data[key] = value;
		this.save();
	},

	get: function(key) {
		return this.data[key];
	},

	load: function(file) {
		this.file = file;
		this.data = JSON.parse(fs.readFileSync(file, 'utf8'));
	},

	save: function() {
		if (!this.file) console.log("Error, no file set");
		
		var config_tmp = JSON.stringify(this.data);
		fs.writeFile(this.file, config_tmp, function(err) {
		    if(err) {
			    console.log(err);
			} else {
			    console.log("Config file saved");
			}
		});
	}
};

module.exports = Loader;