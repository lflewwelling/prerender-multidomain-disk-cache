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
  });

  it('testNonGetSkipping', function() {
    fsCache.init();

    var skipNonGet = true;
    var skipNonGetRes = {
      'send': function(status, data) {
        skipNonGet = false;
      }
    }

    fsCache.beforePhantomRequest({'method': 'POST'}, skipNonGetRes, function() {
    });
    skipNonGet.should.be.ok;
  });

  it('testGetWorkflow', function(done) {
    var testUrl = 'http://localhost/'+uuid.v1();
    var writeData = '<html/>';
    var readData;
    //write
    cacheUtils.writeCacheFile(testUrl, writeData, function(err) {
      if (err) {
        done(err);
      }

      var req = {
        'method': 'GET',
        'prerender': {
          'url': testUrl
        }
      };

      var res = {
        'send': function(status, data) {
          readData = new String(data);
          req.prerender.fileSystemCached.should.be.ok;
          readData.should.be.equal(writeData);
          done();
        }
      }

      //call the method
      fsCache.beforePhantomRequest(req, res, function() {});

    });

  });

  it('testNotFound', function() {
    var testUrl = 'http://localhost/'+uuid.v1();

    var sendCalled = false;

    var req = {
      'method': 'GET',
      'prerender': {
        'url': testUrl
      }
    };

    var res = {
      'send': function(status, data) {
        sendCalled = true;
      }
    }

    //call the method
    fsCache.beforePhantomRequest(req, res, function() {});

    sendCalled.should.not.be.ok;
  });

  it('testWriteTrigger', function() {
    var testUrl = 'http://localhost/'+uuid.v1();

    var req = {
      'method': 'GET',
      'prerender': {
        'url': testUrl,
        'fileSystemCached': false
      }
    };

    var res = {};

    var nextCalled = false;
    //call the method
    fsCache.afterPhantomRequest(req, res, function() {
      nextCalled = true;
    });

    nextCalled.should.be.ok;
  });

  it('testSkipWriteTrigger', function() {
    var testUrl = 'http://localhost/'+uuid.v1();

    var req = {
      'method': 'GET',
      'prerender': {
        'url': testUrl,
        'fileSystemCached': true
      }
    };

    var res = {};

    var nextCalled = false;
    //call the method
    fsCache.afterPhantomRequest(req, res, function() {
      nextCalled = true;
    });

    nextCalled.should.be.ok;
  });
});
