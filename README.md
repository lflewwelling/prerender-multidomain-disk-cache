# prerender-filesystem-cache

This is a plugin for [prerender(.io)](https://github.com/prerender/prerender)
providing caching in the file system.
This plugin is a fork of https://github.com/suhanovv/prerender-file-cache,
focussing on improved URI parsing, platform-independency and providing test
coverage.

## How it works

This plugin will store all prerendered pages into a filesystem hierarchy.
For example:

* url http://domain.lo/?_escaped_fragment_=/en/about - will be saved in
`CACHE_ROOT_DIR/en/about/perender.cache.html`
* url http://domain.lo/en/about?_escaped_fragment_= - will be saved in
`CACHE_ROOT_DIR/en/about/perender.cache.html`
* url http://domain.lo/?_escaped_fragment_=/en/main/path/blah - will be saved
in `CACHE_ROOT_DIR/en/main/path/blah/perender.cache.html`
* url http://domain.lo/en/main/path/blah?_escaped_fragment_= - will be saved
in `CACHE_ROOT_DIR/en/main/path/blah/perender.cache.html`


## How to use

In your local prerender project run:

`$ npm install prerender-filesystem-cache --save`

Then in the `server.js` that initializes the prerender:

`server.use(require('prerender-filesystem-cache'));`

## Configuration

Optionally, define some env variables:

```
export CACHE_ROOT_DIR=/your/directory/for/cache  
export CACHE_LIVE_TIME=10000 (in seconds)
```

* `CACHE_ROOT_DIR` defaults to `os.tmpdir()/prerender-cache`
* `CACHE_LIVE_TIME` defaults to 3600 (1 hour)
