var Replace = function() { //Constructor
	
	// Private storage of last entered message per user
	// and channel
	var latestMsgs = [[]];

	// handle is called when a message is sent to a channel by a user
	this.handle = function(from, chan, message) {
		var irc = global.irc,
			matches = message.match(/^s\/(.*?)\/(.*?)(\/(.+))?$/i);
		
		if (matches) {
			var search = matches[1],
				replace = matches[2],
				user = matches[4] || from;

			if (latestMsgs[user] && latestMsgs[user][chan]) {
				message = latestMsgs[user][chan];
				try {
					var re = new RegExp(search, "ig"),
						msg = message.replace(re, replace);
					irc.client.say(chan, msg);
				} catch(e) {
					console.log('replace error: ' + e)
				}
			}
		}
			
		// Store in user array. If message was used for replace it is 
		// overwritten to make sure we are not replacing on replace strings.
		if(!latestMsgs[from]) latestMsgs[from] = Array();
		latestMsgs[from][chan] = message;
	}
}

module.exports = new Replace();