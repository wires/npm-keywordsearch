var RegClient = require('silent-npm-registry-client')
var stream = require('stream')
var url = require('url')
var strfmt = require('util').format
var prttty = require('prttty').render

// based off
// https://stackoverflow.com/questions/13657140/how-to-get-all-npm-packages-that-match-a-particular-keyword-in-json-format

function searchUri (registryURL, keyword) {
  var u = url.parse(registryURL)
  return url.format({
    protocol: u.protocol,
    host: u.host,
    pathname: /^\/?$/.test(u.pathname) ? '/-/_view/byKeyword' : u.pathname,
    query: {
      startkey: strfmt('["%s"]', keyword),
      endkey: strfmt('["%s",{}]', keyword),
      group_level: 3
    }
  })
}

var params = { timeout: 1000 }

// pass keyword
module.exports = function keywordSearch (keyword, callback) {
  var options = (typeof keyword === 'object') ? keyword : {
    keyword: keyword,
    registryURL: 'https://registry.npmjs.org/',
    debug: true
  }

  // to log or not to log
  var log = options.debug ? console.log.bind(console) : function () {}

  // construct registry client
  var client = new RegClient({logstream: new stream.Writable()})

  // construct registry url
  var uri = searchUri(options.registryURL, options.keyword)

  log('Querying', uri)

  client.get(uri, params, function (error, data, raw, res) {
    // pass errors to callback
    if (error) {
      return callback(error)
    }
    // data is the parsed data object
    // raw is the json string
    // res is the response from couch
    log('Response', prttty(data || raw))

    callback(null, data.rows.map(function (r) {
      // This is what a row looks like:
      //
      // { value: 1
      // , key: [ 'gulp-plugin'
      //        , 'vinyl-fs-mock'
      //        , 'A fake file system implementation...etc'
      //        ]
      // }
      return {
        name: r.key[1],
        description: r.key[2]
      }
    }))
  })
}
