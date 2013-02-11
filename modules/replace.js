var Replace = function() {
	//Constructor
}

Replace.prototype = {
	msgs: [[]],
	handle: function(from, chan, message) {
		var irc = global.irc;

		//check there is an array for this user
		if (!this.msgs[from])
			this.msgs[from] = Array();

		if (matches = message.match(/^s\/(.+)\/(.+)\/(.+)$/i)) {
			var target = matches[3];
			if (this.msgs[target] && this.msgs[target][chan]) {
				msg = this.msgs[target][chan];
				try {
					re = new RegExp(matches[1], "ig");
					message = msg.replace(re, matches[2]);
					irc.client.say(chan, message);

					message = msg;
				} catch(e) { console.log(e) }
			}
		} else if (matches = message.match(/^s\/(.+)\/(.+)$/i)) {
			if (msg = this.msgs[from][chan]) {
      			 try {
					re = new RegExp(matches[1], "ig");
					message = msg.replace(re, matches[2]);
					irc.client.say(chan, message);
		
					message = msg;
       			 } catch(e) { console.log(e) }
			}
		}

		//store in user array
		this.msgs[from][chan] = message;
	}
};

module.exports = new Replace();