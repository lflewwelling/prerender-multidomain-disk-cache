var test = require('unit.js');
var fsCache = require('../lib/file-system-cache');
var cacheUtils = require('../lib/cache-utils');
var uuid = require('node-uuid');
var pathTool = require('path');

describe('fileSystemCacheTest', function() {
  it('load', function() {
    fsCache.should.be.an.Object;
    fsCache.afterPhantomRequest.should.be.a.Function;
    fsCache.beforePhantomRequest.should.be.a.Function;
    fsCache.init.should.be.a.Function;

    cacheUtils.should.be.an.Object;
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

    if (target.path.endsWith('/')) {
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
