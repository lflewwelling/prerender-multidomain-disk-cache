var fs = require('node-fs');
var url = require('url');
var os = require('os')
var path = require('path');
var sanitize = require('sanitize-filename');

var writeCacheFile = function(key, value, callback) {
  /*
  * write the file to the corresponding cache directory
  */
  var pathObject = resolvePath(key);
  var exists = fs.existsSync(pathObject.path);

  if (!exists) {
    fs.mkdirSync(pathObject.path, '0777', true);
  }

  var file = path.join(pathObject.path, pathObject.filename);
  fs.writeFile(file, value, callback || function () {});
};

var readCacheFile = function(key, callback) {
  /*
   * set the cache_live_time to the env variable or a default
   */
  var cacheLifeTime = process.env.CACHE_LIVE_TIME || 3600;
  var pathObject = resolvePath(key);
  var file = path.join(pathObject.path, pathObject.filename);

  var exists = fs.existsSync(file);

  if (!exists) {
    return callback(false, null);
  }

  var date = new Date();

  if (date.getTime() - fs.statSync(file).mtime.getTime() > cacheLifeTime * 1000) {
    return callback(false, null);
  }

  fs.readFile(file, callback || function () {});
};

var getCachePath = function() {
  return process.env.CACHE_ROOT_DIR || path.join(os.tmpdir(), 'prerender-cache');
};

var resolvePath = function (requestUrl) {
  var parserRequestUrl = url.parse(requestUrl);

  var filePath = path.join(getCachePath(), reqUrl.host);
  var fileName = 'prerender.cache.html';

  if (parserRequestUrl.pathname && parserRequestUrl.pathname !== '/') {
    /*
    * parse the URL path and join it with the cache base path
    */
    filePath = path.join(filePath, path.format(path.parse(parserRequestUrl.pathname)));
    if (parserRequestUrl.query) {
      /*
      * a query is set, join this as well
      */
      filePath = path.join(filePath, sanitize(parserRequestUrl.query));
    }
  }

  return {
    path: filePath,
    filename: fileName
  };
};

module.exports = {
  getCachePath: getCachePath,
  resolvePath: resolvePath,
  readCacheFile: readCacheFile,
  writeCacheFile: writeCacheFile,

  DiskCache: {
    get: readCacheFile,
    set: writeCacheFile
  }

}
