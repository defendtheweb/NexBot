var ModuleManager = function() {
	//Constructor
};

ModuleManager.prototype = {
	path: require('path'),
	irc: global.irc,
	init: function(){
		this.appDir = this.path.dirname(require.main.filename);
		var self = this;
		this.actions =
		{
			'load': function(noticeTo, moduleInfo){
				self._load(moduleInfo);
				console.log("\033[32m[Module] \033[0m" + moduleInfo.moduleName + " loaded");
				self.irc.client.say(noticeTo, "Module loaded: " + moduleInfo.moduleName);
			},
			'unload': function(noticeTo, moduleInfo){
				self._unload(moduleInfo);
				console.log("\033[32m[Module] \033[0m" + moduleInfo.moduleName + " unloaded");
				self.irc.client.say(noticeTo, "Module unloaded: " + moduleInfo.moduleName);
			}
		};
	},
	// private message received
	handlePM: function(from, message) {
		//check if user is admin
		if (this._isAdmin(from)) {
			/* 2 part */
			var matches = message.match(/^([\S]*) (.*)$/i);
			if (matches) {
				this.exec(matches[1], matches[2], from);
			}
		}
	},
	_isAdmin: function(nick){
		var config = global.config;
		return (config.get('admin').indexOf(nick) >= 0);
	},
	resolveModule: function(moduleName, next){
		var moduleInfo = {
			moduleName: moduleName,
			modulePath: this.path.join(
				this.appDir,
				'/modules/' + moduleName + '/' + moduleName + '.js')
		};
		var fs = require('fs');
		fs.stat(moduleInfo.modulePath, function(err) {
			moduleInfo.resolved = !err;
			next(moduleInfo);
		});
	},
	_clearCache: function(moduleInfo){
		delete require.cache[require.resolve(moduleInfo.modulePath)];
	},
	_load: function(moduleInfo){
		var modules = global.modules;
		//Delete module cache before reloading, forces complete reload
		this._clearCache(moduleInfo);
		modules[moduleInfo.moduleName] = require(moduleInfo.modulePath);
		//ensure module's init method is executed if needed
		if (typeof(modules[moduleInfo.moduleName].init) === 'function'){
			modules[moduleInfo.moduleName].init();
		}
	},
	_unload: function(moduleInfo){
		var modules = global.modules;
		delete modules[moduleInfo.moduleName];
		this._clearCache(moduleInfo);
	},
	exec: function(action, moduleName, noticeTo){
		if (typeof(this.actions[action]) === 'function'){
			var self = this;
			this.resolveModule(moduleName, function(moduleInfo){
				if (moduleInfo.resolved){
					self.actions[action](noticeTo, moduleInfo);
				} else {
					self.irc.client.say(noticeTo, "Module not found: " + moduleInfo.modulePath);
				}
			});
		}
	}
};

module.exports = new ModuleManager();
