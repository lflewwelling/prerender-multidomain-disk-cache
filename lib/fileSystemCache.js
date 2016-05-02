var cache_manager = require('cache-manager');
var fs = require('node-fs');
var url = require('url');
var os = require('os')
var jsonPrune = require('json-prune');
var pathTool = require('path');

module.exports = {
  init: function() {
    this.cache = cache_manager.caching({
      store: fileSystemCache
    });
  },

  beforePhantomRequest: function(req, res, next) {
    if (req.method !== 'GET') {
      return next();
    }

    /*
     *
     */
    this.cache.get(req.prerender.url, function (err, result) {
      if (!err && result) {
        var now = new Date();
        console.info(now.toDateString() +' '+ now.toTimeString() + ' cache hit');
        req.prerender.fileSystemCached = true;
        res.send(200, result);
      }
      else {
        return next();
      }
    });
  },

  afterPhantomRequest: function(req, res, next) {
    if (!req.prerender.fileSystemCached) {
      /*
      * we are only getting here if the cache was not there
      */
      this.cache.set(req.prerender.url, req.prerender.documentHTML);
    }
    next();
  }
};

function getCachePath() {
  return process.env.CACHE_ROOT_DIR || os.tmpdir();
}

function resolvePath(request_url) {
  var reqUrl = url.parse(request_url);

  var path = getCachePath();
  var filename = 'perendered.cache.html';

  if (reqUrl.pathname) {
    /*
    * parse the URL path and join it with the cache base path
    */
    path = pathTool.join(path, pathTool.format(pathTool.parse(reqUrl.pathname)));
    if (reqUrl.query) {
      /*
      * a query is set, join this as well
      */
      path = pathTool.join(path, reqUrl.query);
    }
  } else {
    /*
    * fallback for root/index pages
    */
    path = pathTool.join(path, filename);
  }

  return {"path": path, "filename": filename};
}

function constructFileName(pathObject) {
  return pathTool.join(pathObject.path, pathObject.filename);
}

var fileSystemCache = {
  get: function(key, callback) {
    /*
     * set the cache_live_time to the env variable or a default
     */
    var cacheLifeTime = process.env.CACHE_LIVE_TIME || 3600;
    var pathObject = resolvePath(key);

    fs.exists(constructFileName(pathObject), function(exists){
      if (exists === false) {
        return callback(null);
      }

      var date = new Date();

      if (date.getTime() - fs.statSync(constructFileName(pathObject)).mtime.getTime()
            > cacheLifeTime * 1000) {
        return callback(null);
      }

      fs.readFile(constructFileName(pathObject), callback);

    });

  },
  set: function(key, value, callback) {
    /*
    * write the file to the corresponding cache directory
    */
    var pathObject = resolvePath(key);

    fs.exists(pathObject.path, function(exists){
      if (exists === false) {
        console.trace("creating subdirectory: "+ pathObject.path);
        fs.mkdirSync(pathObject.path, '0777',true);
      }

      var fn = constructFileName(pathObject);
      console.trace("writing file: "+ fn);
      fs.writeFile(fn, value, callback);
    });

  }
};
