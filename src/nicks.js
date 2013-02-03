var fs = require('fs');
var file = undefined;
var data = {};

module.exports.set = function(key, value) {
	this.data[key] = value;
}

module.exports.get = function(key) {
	return this.data[key];
}

module.exports.load = function(file) {
	this.file = file;
	this.data = JSON.parse(fs.readFileSync(file, 'utf8'));
	console.log(this.data);
}

module.exports.save = function() {
	if (!this.file) console.log("Error, no nicks file set");
	
	console.log(this.data);
	var config_tmp = JSON.stringify(this.data);
	console.log(config_tmp);
	fs.writeFile(this.file, config_tmp, function(err) {
	    if(err) {
		    console.log(err);
		} else {
		    console.log("Data file saved");
		}
	});
}

