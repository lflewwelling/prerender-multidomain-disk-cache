var test = require('unit.js');
var fs = require('node-fs');
var fsCache = require('../lib/file-system-cache');
var cacheUtils = require('../lib/cache-utils');
var uuid = require('node-uuid');
var pathTool = require('path');

var endsWith = function(str, exp) {
  if (str.endsWith) {
    return str.endsWith(exp);
  }
  else {
    return str.match(exp+"$")==exp;
  }
}

describe('cacheUtilsTest', function() {
  it('load', function() {
    cacheUtils.should.be.an.Object;
    cacheUtils.getCachePath.should.be.a.Function;
    cacheUtils.fileSystemCache.should.be.an.Object;
    cacheUtils.resolvePath.should.be.a.Function;
    cacheUtils.writeCacheFile.should.be.a.Function;
    cacheUtils.readCacheFile.should.be.a.Function;
  });

  it('testReadWrite', function(done) {
    var testUrl = 'http://localhost/my/resource/page?what=ab/c/de'+uuid.v1();

    cacheUtils.getCachePath().should.be.type('string');
    cacheUtils.fileSystemCache.should.be.an.Object;
    var target = cacheUtils.resolvePath(testUrl);
    target.path.should.startWith(cacheUtils.getCachePath());
    target.filename.should.be.equal('prerender.cache.html');

    var writeData = '<html/>';
    var readData;
    //write
    cacheUtils.writeCacheFile(testUrl, writeData, function(err) {
      if (err) {
        done(err);
      }

      //read
      cacheUtils.readCacheFile(testUrl, function(err, data) {
        readData = new String(data);
        readData.should.be.equal(writeData);

        //call done, as the async part is now finished
        done();
      });
    });
  });

  it('testWriteOnExistingDir', function(done) {
    var testRes = uuid.v1();
    var testUrl = 'http://localhost/'+testRes;

    var targetDir = pathTool.join(cacheUtils.getCachePath(), testRes);
    fs.mkdirSync(targetDir, '0777',true);

    var writeData = '<html/>';
    var readData;
    //write
    cacheUtils.writeCacheFile(testUrl, writeData, function(err) {
      if (err) {
        done(err);
      }

      //read
      cacheUtils.readCacheFile(testUrl, function(err, data) {
        readData = new String(data);
        readData.should.be.equal(writeData);

        //call done, as the async part is now finished
        done();
      });
    });
  });

  it('testUrlPatterns', function() {
    var testUrl = 'http://localhost/my/resource/page?what=abc';
    cacheUtils.getCachePath().should.be.type('string');
    var target = cacheUtils.resolvePath(testUrl);

    target.path.should.startWith(cacheUtils.getCachePath());
    var pathObject = pathTool.parse(target.path);

    pathObject.name.should.be.equal('what=abc');
    pathObject.dir.should.containEql('my');
    pathObject.dir.should.containEql('resource');
    pathObject.dir.should.containEql('page');
    pathObject.dir.should.containEql(cacheUtils.getCachePath());

    //base dir test
    target = cacheUtils.resolvePath('http://localhost');

    if (endsWith(target.path, '/')) {
      target.path = target.path.substring(0, target.path.length - 1);
    }
    target.path.should.be.equal(cacheUtils.getCachePath());
  });

  it('testNonExisting', function(done) {
    var testUrl = 'http://localhost/'+uuid.v1();
    //read
    cacheUtils.readCacheFile(testUrl, function(err, data) {
      var isError = data === null;
      isError.should.be.ok;

      //call done, as the async part is now finished
      done();
    });
  });

  it('testExpiration', function(done) {
    var testUrl = 'http://localhost/'+uuid.v1();

    process.env['CACHE_LIVE_TIME'] = 1;
    var writeData = '<html/>';
    var readData;
    //write
    cacheUtils.writeCacheFile(testUrl, writeData, function(err) {
      if (err) {
        done(err);
      }

      setTimeout(function () {
        //read
        cacheUtils.readCacheFile(testUrl, function(err, data) {

          var isError = data === null;
          isError.should.be.ok;

          //call done, as the async part is now finished
          done();
        });
      }, 1200);

    });
  });
});
