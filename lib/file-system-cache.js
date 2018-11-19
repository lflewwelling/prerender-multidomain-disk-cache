var cacheManager = require('cache-manager');
var cacheUtils = require('./cache-utils');

module.exports = {

  init: function() {
    this.cache = cacheManager.caching({
      store: cacheUtils.fileSystemCache
    });
  },

  requestReceived: function(req, res, next) {
    if (req.method !== 'GET') {
      return next();
    }

    /*
     * check the local cache if we have a copy available
     */
    this.cache.get(req.prerender.url, function (err, result) {
      if (!err && result) {
        console.info('cache hit for: '+req.prerender.url);
        req.prerender.fileSystemCached = true;
        res.send(200, result);
      }
      else {
        return next();
      }
    });
  },

  beforeSend: function(req, res, next) {
    if (!req.prerender.fileSystemCached) {
      /*
      * we are only getting here if the cache was not there
      */
     console.info('rendered', req.prerender);
      this.cache.set(req.prerender.url, req.prerender.content);
    }
    next();
  }
};
