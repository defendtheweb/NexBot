var http = require('http');
var Calculator = function() {
	//Constructor
}

Calculator.prototype = {
	handle: function(from, chan, message) {
		var irc = global.irc;
		
		if (matches = message.match(/^!calc (.*)$/i)) {
			var input = matches[1].trim();
			var callback = function(response) {
				var str = '';
			
				response.on('data', function (chunk) {
					str += chunk;
				});
				
				response.on('end', function () {
					/* var data = JSON.parse(str);
					
					if (data['error']) irc.client.say(chan, input + ': Error');
					else irc.client.say(chan, input + ' = ' + data['rhs']); */

					if (result = str.match(/rhs: "([^"]+)"/i))
						irc.client.say(chan, input + ' = ' + result[1]);
					else
						irc.client.say(chan, "Error: " + input);
				});
			}
			
			http.request({ host: 'www.google.com', path: '/ig/calculator?hl=en&q=' + encodeURIComponent(input) }, callback).end();
		}
	}
};

module.exports = new Calculator();