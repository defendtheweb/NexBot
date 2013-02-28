var DB = function() {
	//Constructor
	var _mysql = require('mysql');

	this.connectionObject = {
		user: global.config.get('mysql_user'),
		password: global.config.get('mysql_pass'),
		host: global.config.get('mysql_host'),
		database: global.config.get('mysql_db'),
		insecureAuth: true
	};

	var self = this;

	this.connection = _mysql.createConnection(this.connectionObject);

	this.connection.connect(function(err) {
		if (err)
			console.log(err);
	});

	function handleDisconnect(connection) {
	  connection.on('error', function(err) {
	    if (!err.fatal) {
	      return;
	    }

	    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
	      throw err;
	    }

	    self.connection = _mysql.createConnection(self.connectionObject);
	    handleDisconnect(self.connection);
	    self.connection.connect();
	  });
	}

	handleDisconnect(this.connection);
}

DB.prototype = {
	irc: global.irc,
	handle: function(from, chan, message) {
		time = Math.round(new Date().getTime() / 1000);
		chars = message.length;
		words = message.split(' ').length;

		user = this.connection.escape(from);
		chan = this.connection.escape(chan);
		message = this.connection.escape(message);

		sql = "INSERT INTO raw_logs (`action`, `user`, `channel`, `log`, `time`) VALUES ('1', "+user+", "+chan+", "+message+", '"+time+"')";

		this.connection.query(sql, function (error) {
			if (error) {
				console.log("MySQL Error [1]: " + error);
			}
		});

		// Update user stats
		// Should be replaced by squel, but I am not sure how it handles complex statements
		sql = "INSERT INTO user_stats (`user`, `lines`, `words`, `chars`, `time`) VALUES ("+user+", '1', '"+words+"', '"+chars+"', '"+time+"') \
			ON DUPLICATE KEY UPDATE `lines`=`lines`+1, words=words+"+words+", chars=chars+"+chars+", `time`='"+time+"'";

		this.connection.query(sql, function (error) {
			if (error) {
				console.log("MySQL Error [2]: " + error);
			}
		});
	},

	handlePM: function(from, message) {
		time = Math.round(new Date().getTime() / 1000);

		user = this.connection.escape(from);
		message = this.connection.escape(message);

		sql = "INSERT INTO raw_logs (`action`, `user`, `log`, `time`) VALUES ('2', "+user+", "+message+", '"+time+"')";

		this.connection.query(sql, function (error) {
			if (error) {
				console.log("MySQL Error [3]: " + error);
			}
		});
	},

	join: function(chan, from, message) {
		time = Math.round(new Date().getTime() / 1000);

		user = this.connection.escape(from);
		chan = this.connection.escape(chan);

		sql = "INSERT INTO raw_logs (`action`, `user`, `channel`, `time`) VALUES ('3', "+user+", "+chan+", '"+time+"')";

		this.connection.query(sql, function (error) {
			if (error) {
				console.log("MySQL Error [4]: " + error);
			}
		});
	}
};

module.exports = new DB();

