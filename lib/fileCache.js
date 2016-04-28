/**
* Created by vsuhanov on 21.04.14.
*/

var cache_manager = require('cache-manager');
var fs = require('node-fs');
var url = require('url');

module.exports = {
  init: function() {
    this.cache = cache_manager.caching({
      store: file_cache
    });
  },

  beforePhantomRequest: function(req, res, next) {
    if(req.method !== 'GET') {
      return next();
    }

    this.cache.get(req.prerender.url, function (err, result) {
      if (!err && result) {
        var now = new Date();
        console.log(now.toDateString() +' ' + now.toTimeString() + ' cache hit');
        res.send(200, result);
      } else {
        next();
      }
    });
  },

  afterPhantomRequest: function(req, res, next) {
    if (req.prerender.statusCode == 200) {
      this.cache.set(req.prerender.url, req.prerender.documentHTML);
    }
    next();
  }
};

function resolvePath(request_url) {
  var reqUrl = url.parse(request_url);

  var path = process.env.CACHE_ROOT_DIR;
  var filename = '___';
  if(reqUrl.pathname) {
    path = path + reqUrl.pathname + (reqUrl.query ?  ('/' +reqUrl.query) : '');
  } else {
    path = path + '/' + filename;
  }

  return {"path":path, "filename": filename};
}


var file_cache = {
  get: function(key, callback) {
    var cache_live_time = process.env.CACHE_LIVE_TIME;
    var pathObject = resolvePath(key);
    fs.exists(pathObject.path+"/"+pathObject.filename, function(exists){
      if (exists === false) {
        return callback(null)
      }

      var date = new Date();

      if (date.getTime() - fs.statSync(pathObject.path+"/"+pathObject.filename).mtime.getTime() > cache_live_time * 1000) {
        return callback(null)
      }

      fs.readFile(pathObject.path+"/"+pathObject.filename, callback);

    });

  },
  set: function(key, value, callback) {

    var pathObject = resolvePath(key);

    fs.exists(pathObject.path, function(exists){
      if (exists === false) {
        fs.mkdirSync(pathObject.path, '0777',true);
        console.log("made dir!!!!")
      }
      fs.writeFile(pathObject.path+"/"+pathObject.filename, value, callback);

    });

  }
};
