var SearchLink = function() { //Constructor

	/* list of available search engines, each item is a map
	 * with one or many trigger word(s) and a url.
	 * 
	 * The trigger is a string or a list of trigger word(s), 
	 * a name of "google" will be triggered by "!google <query>", 
	 * and ["ht", "hackthis"] would be triggered by both 
	 * "!ht <query>" and "!hackthis <query>"
	 * 
	 * The url for the search engine, where %query% is
	 * replaced by the string entered by the user.
	 */
	var searchEngines = [
		{
			'trigger': ['google'],
			'url': 'https://google.com/search?q=%query%'
		},
		{
			'trigger': 'ht',
			'url': 'https://www.hackthis.co.uk/search.php?q=%query%'
		},
		{
			'trigger': 'lmgtfy',
			'url': 'http://lmgtfy.com/?q=%query%'
		},
		{
			'trigger': ['search', 'ddg', 'DDG', 'duck'],
			'url': 'https://duckduckgo.com/?q=\\%query%&kp=-1'
		}
	];

	/**
	 * Regex for finding "!<trigger> <query>"
	 */
	var searchRegex = new RegExp(/^!([\S]+) (.+)$/i);

	/**
	 * Takes a trigger string and returns the associated
	 * search engine, or false if non-existing.
	 */
	var getUrlByTrigger = function(src_trigger) {
		for(var i = 0; i < searchEngines.length; i++) {
			var trigger = searchEngines[i].trigger,
				url = searchEngines[i].url;

			if(trigger === src_trigger) {
				return url;
			} else if(typeof(trigger) === "object") {
				for(var j=0; j < trigger.length; j++) {
					if(trigger[j] === src_trigger) { 
						return url;
					}
				}
			}
		}
		return false;
	};

	/**
	 * handle is called when a message is sent to a channel by a user.
	 */ 
	this.handle = function(from, chan, message) {
		var matches = searchRegex.exec(message);

		if(matches !== null) {
			var trigger =  matches[1],
				query = escape(matches[2]);

			var url = getUrlByTrigger(trigger);
			
			if(url) {
				var irc = global.irc;
				url = url.replace('%query%', query);
				
				try {
					irc.client.say(chan, url);
				} catch(e) {
					console.log('searchLink error: ' + e);
				}
			}
		}
	};
};

module.exports = new SearchLink();
