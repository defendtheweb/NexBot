var _irc = require('irc');
var irc = {};
global.irc = irc;

var Loader = require('./loader.js');
var config = new Loader();
config.load('data/config.js');
global.config = config;

var nicks = new Loader();
nicks.load('data/nicks.js');
global.nicks = nicks;

var fs = require('fs');
var stream = fs.createWriteStream("main.log");

var tmpModules = config.get('modules');
var modules = [];
global.modules = modules;

//create modules and add to array of loaded modules
for (var i in tmpModules) {
	var moduleName = tmpModules[i];
	var tmp = require('./modules/' + moduleName + '.js');
	modules[moduleName] = tmp;
	console.log("\033[32m[Module] \033[0m" + moduleName + " loaded");
}


irc.nick = [];

/* Setup IRC */
irc.connect = function(channels) {
	irc.client = new _irc.Client(config.get('server'), config.get('nick'), {
		channels: channels,
		userName: config.get('nick'),
		realName: config.get('nick'),
		port: config.get('port'),

		secure: config.get('secure'),
		certExpired: config.get('certExpired'),
		selfSigned: config.get('selfSigned'),

		debug: config.get('debug')
	});

	irc.client.addListener('error', function(error) {
		console.log("ERROR: " + error.command);
	});

	/* Setup listeners */
	irc.client.addListener('message', function (from, chan, message) {
		if (chan === config.get('nick')) {
			return;
		}

		message.replace(/(^\s*)|(\s*$)/g, ' ');

		//pass on to modules
		for (var i in modules) {
			if (typeof modules[i].handle === 'function') {
				modules[i].handle(from, chan, message);
			}
		}
	});
	
	irc.client.addListener('join', function (chan, nick, message) {
		//pass on to modules
		for (var i in modules) {
			if (typeof modules[i].join === 'function') {
				modules[i].join(chan, nick, message);
			}
		}
	});

	/* PRIVATE */
	irc.client.addListener('pm', function (from, message) {
		for (var i in modules) {
			if (typeof modules[i].handlePM === 'function') {
				modules[i].handlePM(from, message);
			}
		}
		
		//check if user is authenticated
		if (config.get('admin').indexOf(from) >= 0) {
			/* 2 part */
			var matches;
			if (matches = message.match(/^([\S]*) (.*)$/i)) {
				if (matches[1] === "load") {

					var moduleName = matches[2];
					var modulePath = './modules/' + moduleName + '.js';
					fs.stat(modulePath, function(err, stat) {
						if (!err) {
							//Delete module cache before reloading, forces complete reload
							var name = require.resolve(modulePath);
							delete require.cache[name];

							tmp = require(modulePath);
							modules[moduleName] = tmp;
							console.log("\033[32m[Module] \033[0m" + moduleName + " loaded");
							irc.client.say(from, "Module loaded: " + moduleName);
						} else {
							irc.client.say(from, "Module not found: " + modulePath);
						}
					});
				}
			}
		}
	});
	
	irc.client.once('registered', function(){
		var moduleName;
		for (moduleName in modules){
			if (typeof (modules[moduleName].init) === 'function'){
				modules[moduleName].init();
			}
		}
	});
};

irc.connect(config.get('channels'));
