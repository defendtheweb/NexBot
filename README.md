NexBot
======

Node.js IRC bot

[![Build Status](https://travis-ci.org/HackThis/NexBot.png?branch=master)](https://travis-ci.org/HackThis/NexBot)

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

* !last.fm - Output the last listened track from last.fm
* !last.fm \<user> - Will get the last track listened to by the user"
* !groove - Output the last listened track from last.fm in the form of a grooveshark URL.
* !groove \<song> - Will get the first result from Grooveshark which matches
* ~~!remember foo | !save foo | !note foo - Will add "foo" to the database~~
* s/foo/bar - Last line you wrote will replace "foo" with "bar"
* s/foo/bar/user - Last line written by "user" will replace "foo" with "bar"
* !lastseen user - Returns the date the user was last heard from
* !define chicken - Will return a definition, multiple calls will cycle through definitions
* !mustachify http://free-textures.got3d.com/natural/free-character-references/free-character-texture-references-woman-4/images/free-character-texture-references-woman-401.jpg - If a url pointing at an image with one or more faces will return a url with added mustaches
* !imgur - Will return a random imgur image e.g. "Voldebean (xpost from r/funny) - http://i.imgur.com/qQQAJ.jpg 330⤴ 27⤵"

### Private messaging the bot
* ~~!remember | !save | !note - Output all records.~~
* set last.fm \<user> - Will map the IRC nick to the Last.fm user "foo"
* @list - Will return a list of all available shout commands

Packages
---------
* node-irc https://github.com/martynsmith/node-irc
* lastfm-node https://github.com/jammus/lastfm-node
* node-bitly https://github.com/tanepiper/node-bitly

Install them via npm using:
```bash
npm install mysql irc lastfm bitly 
```


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/HackThis/nexbot/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

