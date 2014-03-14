var mathjs = require("mathjs")();

var Calculator = function() {
	//Constructor
};

Calculator.prototype = {
	handle: function(from, chan, message) {
		var irc = global.irc;
		
		var matches = message.match(/^!calc (.*)$/i);
		if (matches && matches.length >= 1) {
			var input = matches[1].trim();
			
			if(input === '') {
				return;
			}

			try {
				// jsHint tags mathjs.eval as eval, which it is not. 
				// see https://github.com/josdejong/mathjs/blob/master/docs/expressions.md#eval
				/* jshint evil: true */
				var result = mathjs.eval(input);

				irc.client.say(chan, input + ' = ' + result);
			} catch(e) {
				console.log("Calculator Error: " + e);
			}
		}
	}
};

module.exports = new Calculator();