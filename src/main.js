var _irc = require('irc');
var irc = {};

var config = require('./config.js');
config.load('data/config.js');

var nicks = require('./nicks.js');
nicks.load('data/nicks.js');

var fs = require('fs');
var stream = fs.createWriteStream("main.log");

/* SETUP LAST.FM */
var LastFmNode = require('lastfm').LastFmNode;
var lastfm = new LastFmNode({
	api_key: config.get('lastfm_key'),
	secret: config.get('lastfm_secret')
});

var Bitly = require('bitly');
var bitly = new Bitly(config.get('bitly_user'), config.get('bitly_key'));

var Groove = require('./groove.js');
var groove = new Groove(config.get('groove'));

irc.nick = Array();

/* Connect to MySQL */
var _mysql = require('mysql');
var MYSQL_HOST = config.get('mysql_host');
var MYSQL_USER = config.get('mysql_user');
var MYSQL_PASS = config.get('mysql_pass');
var DATABASE = config.get('mysql_db');

var mysql = _mysql.createClient({
    user: MYSQL_USER,
    password: MYSQL_PASS,
    host: MYSQL_HOST,
    port: '3306',
    database: DATABASE,
});

/* Setup IRC */
irc.connect = function(channels) {
	irc.client = new _irc.Client(config.get('server'), config.get('nick'), {
		channels: channels,
	});

	irc.client.addListener('error', function(error) {
		stream.write("IRC error: " + error.command + "\n");
		console.log("ERROR: " + error.command);
	});
	
	mysql.addListener('error', function(error) {
		stream.write("MySQL error: " + error + "\n");
		console.log("MySQL ERROR: " + error);
		irc.client.say(chan, "MySQL Error");
	});

	/* Setup listeners */
	irc.client.addListener('message', function (from, chan, message) {
		//Check connection is still alive
		mysql.ping();
	
		message.replace(/(^\s*)|(\s*$)/g, ' ');
		/* Log interaction */
		logMessage(from, chan, message);

		/* PUBLIC actions */	
		/* 2 PARAMS */	
		if (matches = message.match(/^!([\S]*) (.*)$/Ui)) {
			if (matches[1] == "groove") {
				stream.write("Matched groove: " + message + "\n");
				groove.shorten(matches[2], function(err, response) {
					if (err)
						irc.client.say(from, "Groove error!");

					var url = response.Url;
					var artist = response.ArtistName;
					var song = response.SongName;
					irc.client.say(chan, artist + ' - ' + song + ' : '+url);
				});
			} else if (matches[1] == "last.fm") {
                                stream.write("Matched last.fm: " + message + "\n");
				var request = lastfm.request("user.getrecenttracks", {
					user: matches[2],
					handlers: {
						success: function(data) {
							irc.client.say(chan, data.recenttracks.track[0].artist['#text'] + " - " + data.recenttracks.track[0].name);
						},
						error: function(error) {
							irc.client.say(from, "Invalid last.fm username");
						}
					}
				});
			} else if (matches[1] == "note" || matches[1] == "save" || matches[1] == "remember") {		
				var msg = matches[2];
				msg = mysql_real_escape_string(msg);
				user = mysql_real_escape_string(from);
				mysql.query("INSERT INTO remember (`nick`, `message`) VALUES ('"+user+"', '"+msg+"')", function (error) {
					if (error) {
						irc.client.say(chan, "MySQL Error");
						stream.write("MySQL Error: " + error.sql + "\n");
					} else {
						irc.client.say(chan, "Message saved");
					}
				});
			}
		}
		
		/* 1 PARAM */
		if (matches = message.match(/^!([\S]*)$/Ui)) {
			if (matches[1] == "last.fm") {
                stream.write("Matched last.fm: " + message + "\n");
				if (nicks.data[from] && nicks.data[from]['lastfm']) {
					var request = lastfm.request("user.getrecenttracks", {
						user: nicks.data[from]['lastfm'],
						handlers: {
							success: function(data) {
								irc.client.say(chan, data.recenttracks.track[0].artist['#text'] + " - " + data.recenttracks.track[0].name);
							},
							error: function(error) {
								irc.client.say(chan, "Errors everywhere!!");
							}
						}
					});
				} else
					irc.client.say(from, "Please set your last.fm username. set last.fm <username>");	
			} else if (matches[1] == "groove") {
                                stream.write("Matched groove: " + message + "\n");
				if (nicks.data[from] && nicks.data[from]['lastfm']) {
					var request = lastfm.request("user.getrecenttracks", {
						user: nicks.data[from]['lastfm'],
						handlers: {
							success: function(data) {
								groove.shorten(data.recenttracks.track[0].artist['#text'] + ' ' + data.recenttracks.track[0].name, function(err, response) {
									if (err)
										irc.client.say(from, "Groove error!");

									var url = response.Url;
									var artist = response.ArtistName;
									var song = response.SongName;
									irc.client.say(chan, artist + ' - ' + song + ' : '+url);
								});
							},
							error: function(error) {
								irc.client.say(chan, "Errors everywhere!!");
							}
						}
					});
				} else
					irc.client.say(from, "Please set your last.fm username, type: set last.fm <username>");
			}
		}
		
		/* Replaces s/needle/replace */
		if (!irc.nick[from])
			irc.nick[from] = Array();


		if (matches = message.match(/^s\/(.+)\/(.+)\/(.+)$/Ui)) {
			msg = irc.nick[matches[3]][chan];
			try {
				re = new RegExp(matches[1], "ig");
				message = msg.replace(re, matches[2]);
				irc.client.say(chan, message);

				message = msg;
			} catch(e) { console.log(e) }
		} else if (matches = message.match(/^s\/(.+)\/(.+)$/Ui)) {
			if (msg = irc.nick[from][chan]) {
      			 try {
					re = new RegExp(matches[1], "ig");
					message = msg.replace(re, matches[2]);
					irc.client.say(chan, message);
		
					message = msg;
       			 } catch(e) { console.log(e) }
			}
		}

		//store in user array
		irc.nick[from][chan] = message;
	});
	
	irc.client.addListener('join', function (chan, nick, msg) {
		if (nick != 'NexBot')
			irc.client.say(chan, "Welcome " + nick);
	});

	/* PRIVATE */
	irc.client.addListener('pm', function (from, message) {
		console.log(from + ' => ME: ' + message);
                stream.write(from + " => ME: " + message + "\n");

		/* 3 parts */
		if (matches = message.match(/^([\S]*) (.*) (.*)$/Ui)) {
			if (!nicks.data[from])
				nicks.data[from] = {};
			if (matches[1] == "set") {
				if (matches[2] == "last.fm") {
					nicks.data[from]['lastfm'] = matches[3];
					nicks.save();
					irc.client.say(from, "Set last.fm user name as " + nicks.data[from]['lastfm']);	
				}
			} /*else if (matches[1] == "tinyurl" || matches[1] == "bit.ly" || matches[1] == "bitly") {
				bitly.shorten(matches[3], function(err, response) {
					if (err)
						irc.client.say(from, "Bit.ly error!");

					var short_url = response.data.url;
				  	irc.client.say(matches[2], from + ': ' + short_url);				
				});
			}*/
		}
		
		/* 2 part */
		if (matches = message.match(/^([\S]*) (.*)$/Ui)) {
			if (matches[1] == "note" || matches[1] == "save" || matches[1] == "remember") {		
				var msg = matches[2];
				msg = mysql_real_escape_string(msg);
				user = mysql_real_escape_string(from);
				mysql.query("INSERT INTO remember (`nick`, `message`) VALUES ('"+user+"', '"+msg+"')", function (error) {
					if (error) {
						irc.client.say('flabby', "MySQL Error 1");
						stream.write("MySQL Error: " + error.sql + "\n");
					} else {
						irc.client.say(from, "Message saved");
					}
				});
			}
		}

		/* 1 part */
		if (matches = message.match(/^([\S]*)$/Ui)) {
			if (matches[1] == "note" || matches[1] == "save" || matches[1] == "remember") {
				user = mysql_real_escape_string(from);
				mysql.query('SELECT r_id, message FROM remember WHERE nick = "'+user+'"', function selectCb(error, results, fields) {
					if (error) {
						stream.write("Error getting remember\n");
						console.log('Error getting remember: ' + error.message);
						irc.client.say('flabby', "MySQL Error 2");
						return;
					}

					if(results.length > 0) {
						results.forEach(function(row) {
							irc.client.say(from, row['r_id'] + ': ' + row['message']);
						});
					} else {
						irc.client.say(from, "You have nothing to remember");
					}
				});
			}
		}
	});
}

irc.connect(config.get('channels'));

logMessage = function(user, chan, msg) {
	mysql.query('use ' + DATABASE);
	
	stream.write(user + " [" + chan + "]: " + msg + "\n");
	console.log(user + ' [' + chan + ']: ' + msg);
	
	time = Math.round(new Date().getTime() / 1000);
	characters = msg.length;
	word_count = msg.split(' ').length;
	
	user = mysql_real_escape_string(user);
	chan = mysql_real_escape_string(chan);
	msg =mysql_real_escape_string(msg);
	
	mysql.query("INSERT INTO raw_logs (`action`, `user`, `channel`, `log`, `time`) VALUES ('1', '"+user+"', '"+chan+"', '"+msg+"', '"+time+"')", function (error) {
		if (error) {
			console.log("MySQL Error: " + error.sql);
			stream.write("MySQL Error: " + error.sql + "\n");
			irc.client.say('flabby', "MySQL Error 3");
		}
	});
	
	mysql.query("SELECT * FROM user_stats WHERE user = '"+user+"'", function (error, results, fields) {
		if(results.length > 0) {
			var lines = results[0]['lines'] + 1;
			var words = results[0]['words'] + word_count;
			var chars = results[0]['chars'] + characters;

			mysql.query("UPDATE user_stats SET `lines` = '"+lines+"', `words` = '"+words+"', `chars` = '"+chars+"', `time` = '"+time+"' WHERE user='"+user+"'", function (error) {
				if (error) {
					console.log("MySQL Error: " + error.sql);
					irc.client.say('flabby', "MySQL Error 4");
				}
			});
		} else {
			mysql.query("INSERT INTO user_stats (`user`, `lines`, `words`, `chars`, `time`) VALUES ('"+user+"', '1', '"+word_count+"', '"+characters+"', '"+time+"')", function selectCb(error, results, fields) {
                if (error) {
            		console.log("MySQL Error: " + error.sql);
            		stream.write("MySQL Error: " + error.sql + "\n");
            		irc.client.say('flabby', "MySQL Error 5");
        		}
			});	
		}
	});
	
	mysql.query("UPDATE user_stats SET `lines` =  `lines`+1, `words` = `words`+"+word_count+", `chars` = `chars`+"+characters+", `time` = '"+time+"' WHERE user='.'", function (error) {
                if (error) {
                    console.log("MySQL Error: " + error.sql);
                    stream.write("MySQL Error: " + error.sql + "\n");
                    irc.client.say('flabby', "MySQL Error 6");
                }
	});
}



function mysql_real_escape_string(str) {
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

