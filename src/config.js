var fs = require('fs');
var file = undefined;
var config = {};

module.exports.set = function(key, value) {
	this.config[key] = value;
	this.save();
}

module.exports.get = function(key) {
	return this.config[key];
}

module.exports.load = function(file) {
	this.file = file;
	this.config = JSON.parse(fs.readFileSync(file, 'utf8'));
}

module.exports.save = function() {
	if (!this.file) console.log("Error, no config file set");
	
	var config_tmp = JSON.stringify(this.config);
	fs.writeFile(this.file, config_tmp, function(err) {
	    if(err) {
		    console.log(err);
		} else {
		    console.log("Config file saved");
		}
	});
}

