# prerender-multidomain-disk-cache

This is a plugin for [prerender.io](https://github.com/prerender/prerender)
providing caching on disk.
It is a fork of legalnavigator/prerender-disk-cache.

Requires:

- node >= 4.0
- prerender >= 5.0.0

## How it works

This plugin will store all prerendered pages into a filesystem hierarchy including the server host name.
For example:

- url http://www.domain.com/?_escaped_fragment_=/en/about - will be saved in
  `CACHE_ROOT_DIR/www.domain.com/en/about/perender.cache.html`
- url http://www.domain.como/en/about?_escaped_fragment_= - will be saved in
  `CACHE_ROOT_DIR/www.domain.com/en/about/perender.cache.html`
- url http://www.domain.com/?_escaped_fragment_=/en/main/path/blah - will be saved
  in `CACHE_ROOT_DIR/www.domain.com/en/main/path/blah/perender.cache.html`
- url http://www.domain.com/en/main/path/blah?_escaped_fragment_= - will be saved
  in `CACHE_ROOT_DIR/www.domain.com/en/main/path/blah/perender.cache.html`

## How to use

The package is [available on npm](https://www.npmjs.com/package/prerender-multidomain-disk-cache). Thus, in your local prerender project simply run:

`$ npm install prerender-multidomain-disk-cache --save`

Then in the `server.js` that initializes prerender:

`server.use(require('prerender-multidomain-disk-cache'));`

## Configuration

Optionally, define some env variables:

```
export CACHE_ROOT_DIR=/your/directory/for/cache
export CACHE_LIVE_TIME=10000 (in seconds)
```

- `CACHE_ROOT_DIR` defaults to `os.tmpdir()/prerender-cache`
- `CACHE_LIVE_TIME` defaults to `3600` (1 hour)
