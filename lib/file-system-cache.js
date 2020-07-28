var cacheManager = require('cache-manager');
var cacheUtils = require('./cache-utils');

module.exports = {

  init: function() {
    this.cache = cacheManager.caching({
      store: cacheUtils.DiskCache
    });
  },

  requestReceived: function(request, response, next) {
    if (request.method !== 'GET') {
      return next();
    }

    this.cache.get(request.prerender.url, function (error, result) {
      if (!error && result) {
        console.info(new Date().toISOString() + ' cache hit for ' + request.prerender.url);

        request.prerender.cached = true;
        response.send(200, result);
      } else {
        return next();
      }
    });
  },

  beforeSend: function(request, response, next) {
    if (!request.prerender.cached) {
      if (request.prerender.statusCode === 200) {
        this.cache.set(request.prerender.url, request.prerender.content);
      }
    }

    next();
  }
};
