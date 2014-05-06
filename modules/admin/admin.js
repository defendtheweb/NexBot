var Admin = function() {

};

Admin.prototype = {
    // public message received
    handlePM: function(from, message) {
        var irc = global.irc;

        //check if user is authenticated
        if (global.config.get('admin').indexOf(from) >= 0) {
            /* 2 part */
            var matches;
            if (matches = message.trimRight().match(/^!([\S]*) (.*)$/i)) {
                if (matches[1] === 'join') {
                    irc.join(matches[2], function() {
                        irc.say(matches[2], "Hello " + matches[2]);
                    });
                } else if (matches[1] === 'leave') {
                    irc.part(matches[2], "Goodbye cruel world");
                } else if (matches[1] === 'nick') {
                    irc..send('NICK', matches[2]);
                }
            }
        }
    }
};

module.exports = new Admin();
