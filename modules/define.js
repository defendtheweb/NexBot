var Define = function() {
	//Constructor
	this.apiEndpoint = 'http://api.wordnik.com:80/v4/word.json/'+
					'{word}/definitions?'+
					'limit=200'+
					'&includeRelated=true'+
					'&useCanonical=false'+
					'&includeTags=false'+
					'&api_key={apiKey}';
	this.words = {};
	// keep words in cache for 2 minutes.
	this.wordTimeout = 120000;
	this.noMatchForWordMsg = 'I can\'t find a definition for this word :/';
};

Define.prototype = {
	http: require('http'),
	debug: global.config.get('debug'),
	apiKey: global.config.get('wordnik_api'),
	handle: function(from, chan, message) {
		var irc = global.irc;
		var matches;
		if (matches = message.trimRight().match(/^!([\S]*) (.*)$/i)) {
			if (matches[1] === 'define') {
				var self = this;
				this.getWordDefinition(matches[2].toLowerCase(),
				function(wordDefinition){
					irc.client.say(chan, wordDefinition.word + ': ' + wordDefinition.definition);
				},
				function(error){
					if (self.debug){
						console.log('[\033[31mDefine Module\033[0m]: ' + error);
					}
					irc.client.say(chan, self.noMatchForWordMsg);
				});
			}
		}
	},
	getWordDefinitionFromCache: function(word, onSuccess)
	{
		if (this.words[word] === undefined){
			return (false);
		}
		onSuccess({word: word, definition:this.words[word]["definition"][this.words[word]["i"]]});
		this.words[word]["i"] += this.words[word]["i"] >= (this.words[word]["definition"].length-1) ? -this.words[word]["i"] : 1;
		return (true);
	},
	getWordDefinitionFromAPI: function(word, onSuccess, onError)
	{
		var self = this;
		this.http.get(this.apiEndpoint.replace("{word}", word.trim()).replace("{apiKey}", this.apiKey), function(res) {
			res.setEncoding('utf8');
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			});

			res.on('end', function(){
				var definitions = {};
				try {
					definitions = JSON.parse(body);
				} catch (ex) {
					onError(ex);
					return;
				}
				if (definitions.length === 0){
					onError('No match for: ' + word);
				} else {
					self.setWordDefinitions(word, definitions);
					self.getWordDefinitionFromCache(word, onSuccess);
				}
			});

		}).on('error', function(error) {
				onError(error);
			});
	},
	getWordDefinition: function(word, onSuccess, onError){
		//Check if words is in the list otherwise get it from API.
		if (!this.getWordDefinitionFromCache(word, onSuccess)){
			this.getWordDefinitionFromAPI(word, onSuccess, onError);
		}
	},
	setWordDefinitions: function(word, definitions)
	{
		var self = this;
		this.words[word] = {};
		this.words[word]['definition'] = [];
		this.words[word]['i'] = 0;

		for (var i = 0; i < definitions.length; ++i){
			this.words[word]['definition'][i] = definitions[i].text;
		}
		//Cleanup the dictionary to avoid unnecessary memory occupation
		setTimeout(function(){
			delete self.words[word];
		}, this.wordTimeout);
	}
};

module.exports = new Define();
