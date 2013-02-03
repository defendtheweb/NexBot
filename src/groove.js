var url = require('url');
var http = require('http');

var Groove = function(api_key) {
	this.config = {
		api_key: api_key
	};

	return this;
};

Groove.prototype._generateNiceUrl = function(song) {
	var result = url.parse(url.format({
		protocol: 'http',
		hostname: 'tinysong.com',
		pathname: '/b/' + encodeURIComponent(song),
		query: { format: 'json', key: this.config.api_key }
	}));
	// HACK: Fixes the redirection issue in node 0.4.x
	if (!result.path) { result.path = result.pathname + result.search; }

	return result;
};

Groove.prototype._doRequest = function(request_query, cb) {
  // Pass the requested URL as an object to the get request
  http.get(request_query, function(res) {
      var data = [];
      res
      .on('data', function(chunk) { data.push(chunk); })
      .on('end', function() {
          var urldata = data.join('').trim();
          var result;
          try {
            result = JSON.parse(urldata);
          } catch (exp) {
            result = {'status_code': 500, 'status_text': 'JSON Parse Failed'}
          }
          cb(null, result);
      });
  })
  .on('error', function(e) {
      cb(e);
  });
};

Groove.prototype.shorten = function(song, cb) {
  this._doRequest(this._generateNiceUrl(song), cb);
};

module.exports = Groove;
