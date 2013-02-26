var DB = function() {
	//Constructor
	var _mysql = require('mysql');
	this.squel = require("squel");

	var connectionObject = {
		user: global.config.get('mysql_user'),
		password: global.config.get('mysql_pass'),
		host: global.config.get('mysql_host'),
		database: global.config.get('mysql_db'),
		insecureAuth: true
	};

	this.mysql = _mysql.createConnection(connectionObject);

	this.mysql.connect(function(err) {
		if (err)
			console.log(err);
	});

	this.mysql.on('error', function(err) {
		if (!err.fatal) {
			return;
		}

		if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
			throw err;
		}

		this.mysql = _mysql.createConnection(connectionObject);

		this.mysql.connect(function(err) {
			if (err)
				console.log(err);
		});
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
		
		user = this.mysql.escape(from);
		chan = this.mysql.escape(chan);
		message = this.mysql.escape(message);
		
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
		// Should be replaced by squel, but I am not sure how it handles complex statements
		sql = "INSERT INTO user_stats (`user`, `lines`, `words`, `chars`, `time`) VALUES ('"+from+"', '1', '"+words+"', '"+chars+"', '"+time+"') \
			ON DUPLICATE KEY UPDATE `lines`=`lines`+1, words=words+"+words+", chars=chars+"+chars+", `time`='"+time+"'";

		this.mysql.query(sql, function (error) {
			if (error) {
				console.log("MySQL Error [52]: " + error);
			}
		});
	}
};

module.exports = new DB();
