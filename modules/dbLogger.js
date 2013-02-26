var DB = function() {
	//Constructor
	var _mysql = require('mysql');
	this.squel = require("squel");
	this.mysql = _mysql.createConnection({
	    user: global.config.get('mysql_user'),
	    password: global.config.get('mysql_pass'),
	    host: global.config.get('mysql_host'),
	    database: global.config.get('mysql_db'),
	    insecureAuth: true
	});

	this.mysql.connect(function(err) {
		if (err)
			console.log(err);
	});
}

DB.prototype = {
	irc: global.irc,
	handle: function(from, chan, message) {
		//Check connection is still alive
		this.mysql.ping();

		time = Math.round(new Date().getTime() / 1000);
		chars = message.length;
		words = message.split(' ').length;
		
		user = this.mysql_real_escape_string(from);
		chan = this.mysql_real_escape_string(chan);
		message = this.mysql_real_escape_string(message);
		
		// Log message in raw_logs
		sql = this.squel.insert()
		  .into("raw_logs")
		  .set("action", "1")
		  .set("user", from)
		  .set("channel", chan)
		  .set("log", message)
		  .set("time", time).toString();

		this.mysql.query(sql, function (error) {
			if (error) {
				console.log("MySQL Error [43]: " + error);
			}
		});
		
		// Update user stats
		sql = "INSERT INTO user_stats (`user`, `lines`, `words`, `chars`, `time`) VALUES ('"+from+"', '1', '"+words+"', '"+chars+"', '"+time+"') \
			ON DUPLICATE KEY UPDATE `lines`=`lines`+1, words=words+"+words+", chars=chars+"+chars+", `time`='"+time+"'";

		this.mysql.query(sql, function (error) {
			if (error) {
				console.log("MySQL Error [52]: " + error);
			}
		});
	},
	mysql_real_escape_string: function(str) {
		return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
			switch (char) {
				case "\0":
				return "\\0";
				case "\x08":
				return "\\b";
				case "\x09":
				return "\\t";
				case "\x1a":
				return "\\z";
				case "\n":
				return "\\n";
				case "\r":
				return "\\r";
				case "\"":
				case "'":
				case "\\":
				case "%":
				return "\\"+char; // prepends a backslash to backslash, percent,
				// and double/single quotes
			}
		});
	}
};

module.exports = new DB();
