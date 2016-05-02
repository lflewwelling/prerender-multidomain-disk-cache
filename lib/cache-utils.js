var fs = require('node-fs');
var url = require('url');
var os = require('os')
var pathTool = require('path');
var sanitize = require("sanitize-filename");

module.exports = {

  getCachePath: function() {
    return process.env.CACHE_ROOT_DIR || pathTool.join(os.tmpdir(), "prerender-cache");
  },

  resolvePath: function (requestUrl) {
    var reqUrl = url.parse(requestUrl);

    var path = this.getCachePath();
    var filename = 'prerender.cache.html';

    if (reqUrl.pathname) {
      /*
      * parse the URL path and join it with the cache base path
      */
      path = pathTool.join(path, pathTool.format(pathTool.parse(reqUrl.pathname)));
      if (reqUrl.query) {
        /*
        * a query is set, join this as well
        */
        path = pathTool.join(path, sanitize(reqUrl.query));
      }
    } else {
      /*
      * fallback for root/index pages
      */
      path = pathTool.join(path, filename);
    }

    return {"path": path, "filename": filename};
  },

  constructFileName: function (pathObject) {
    return pathTool.join(pathObject.path, pathObject.filename);
  },

  readCacheFile: function(key, callback) {
    /*
     * set the cache_live_time to the env variable or a default
     */
    var cacheLifeTime = process.env.CACHE_LIVE_TIME || 3600;
    var pathObject = this.resolvePath(key);
    var self = this;

    fs.exists(this.constructFileName(pathObject), function(exists){
      if (exists === false) {
        return callback(null);
      }

      var date = new Date();

      if (date.getTime() - fs.statSync(self.constructFileName(pathObject)).mtime.getTime()
            > cacheLifeTime * 1000) {
        return callback(null);
      }

      fs.readFile(self.constructFileName(pathObject), callback);

    });

  },

  writeCacheFile: function(key, value, callback) {
    /*
    * write the file to the corresponding cache directory
    */
    var pathObject = this.resolvePath(key);
    var self = this;

    fs.exists(pathObject.path, function(exists){
      if (exists === false) {
        console.trace("creating subdirectory: "+ pathObject.path);
        fs.mkdirSync(pathObject.path, '0777',true);
      }

      var fn = self.constructFileName(pathObject);
      console.trace("writing file: "+ fn);
      fs.writeFile(fn, value, callback);
    });

  },

  fileSystemCache: {
    get: this.readCacheFile,
    set: this.writeCacheFile
  }

}
