NexBot
======

Node.js IRC bot

[![Build Status](https://travis-ci.org/HackThis/NexBot.png?branch=master)](https://travis-ci.org/HackThis/NexBot)
[![Coverage Status](https://coveralls.io/repos/HackThis/NexBot/badge.png?branch=master)](https://coveralls.io/r/HackThis/NexBot?branch=master)

## Install and Setup

### 1 Install Node.JS
```bash
git clone https://github.com/joyent/node
cd node
./configure
make
make install
```

### 2 Install Dependencies
1. Go to the root folder and install the required packages for NexBot
```bash
npm install
```

### 3 setup the database
If you plan on using the dbLogger module
```bash
mysql -u <user> -p <database> < db.sql
```

### 4 Edit configuration files
1. Edit the data/example.config.js file to match your details and rename it to config.js.

2. Rename the data/example.nicks.js file to nicks.js.

## Usage

Start the bot by running `node main.js`. 
Once the bot is running you can use the following commands:

* ```!last.fm``` Output the last listened track from last.fm
* ```!last.fm <user>``` Will get the last track listened to by the user"
* ```!groove``` Output the last listened track from last.fm in the form of a grooveshark URL.
* ```!groove <song>``` Will get the first result from Grooveshark which matches
* ~~```!remember foo``` ```!save foo``` ```!note foo``` Will add "foo" to the database~~
* ```s/foo/bar``` Last line you wrote will replace "foo" with "bar"
* ```s/foo/bar/user``` Last line written by "user" will replace "foo" with "bar"
* ```!lastseen user``` Returns the date the user was last heard from
* ```!define chicken``` Will return a definition, multiple calls will cycle through definitions
* ```!mustachify``` http://free-textures.got3d.com/natural/free-character-references/free-character-texture-references-woman-4/images/free-character-texture-references-woman-401.jpg - If a url pointing at an image with one or more faces will return a url with added mustaches
* ```!imgur``` Will return a random imgur image e.g. "Voldebean (xpost from r/funny) - http://i.imgur.com/qQQAJ.jpg 330⤴ 27⤵"
* ```@<shout>``` Returns an image, see PM commands to get list of current shouts
* ```!poll <title>``` Starts a poll. Members can vote using !vote and OP can end the poll using ```!poll end```
* ```!vote <answer>``` Cast your vote on the current poll
* ```!shorten stats <goo.gl url>``` Get full url and stats for shortened url
* ```!profile <username>``` Get user profile details from HackThis!!
* ```!imdb <term>``` Lookup film on IMDB


### Private messaging the bot
* ~~```!remember``` ```!save``` ```!note``` Output all records.~~
* ```set last.fm <user>``` Will map the IRC nick to the Last.fm user "foo"
* ```shout list``` Will return a list of all available shout commands
* ```shorten <url> [<channel>]``` Shorten URL and optionally send to channel
