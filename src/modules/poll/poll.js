var Poll = function() {
    //Constructor
};

Poll.prototype = {
    bars: require("bars"),
    active: [],
    irc: global.irc,
    handle: function(from, chan, message) {
        var matches;
        if (matches = message.match(/^!([\S]*) (.+)$/i)) {
            var subject = matches[2].trim();
            if (matches[1] === "poll") {

                // are they trying to end a poll?
                if (subject === "end") {
                    this.finish(from, chan);
                } else {
                    this.start(subject, from, chan);
                }
            } else if (matches[1] === "vote") {
                this.vote(subject, from, chan);
            }
        }
    },
    start: function(subject, user, chan) {
        if (this.active[chan]) {
            this.irc.client.say(chan, "Poll already in progress: " + this.active[chan].subject);
            return;
        }

        this.active[chan] = { subject: subject, chan: chan, author: user, votes: [] };

        this.irc.client.say(chan, "Poll started: " + this.active[chan].subject);
        this.irc.client.say(chan, "Use !vote <vote> to cast your vote!");
    },
    finish: function(user, chan) {
        // check current user started poll
	if (!this.active[chan] || (this.active[chan].author !== user && global.config.get('admin').indexOf(user) < 0)) {
            return;
        }

        this.irc.client.say(chan, "Poll ended: " + this.active[chan].subject);

        var votes = this.active[chan].votes;
        if (votes) {
            // build results from users votes
            var data = {};

            console.log(votes);
            console.log(votes.length);

            for (var n in votes) {
                var k = votes[n].trim().toLowerCase();

                if (data[k]) {
                    data[k]++;
                } else {
                    data[k] = 1;
                }
            }

            console.log(chan, data);
            this.irc.client.say(chan, this.bars(data, {bar: "=", width: 20, sort: true }));
        } else {
            this.irc.client.say(chan, "No votes were cast");
        }

        // clear data
        this.active[chan] = null;
    },
    vote: function(vote, user, chan) {
        if (!this.active[chan]) {
            return;
        }

        // record vote
        this.active[chan].votes[user] = vote;
        console.log(this.active);
    }
};

module.exports = new Poll();
