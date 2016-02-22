var RegClient = require('silent-npm-registry-client')
var stream = require('stream')
var client = new RegClient({logstream: new stream.Writable()})
var urlfmt = require('url').format
var strfmt = require('util').format

// based off
// https://stackoverflow.com/questions/13657140/how-to-get-all-npm-packages-that-match-a-particular-keyword-in-json-format

function searchUri (keyword) {
  return urlfmt({
    protocol: 'https',
    host: 'registry.npmjs.org',
    pathname: '/-/_view/byKeyword',
    query: {
      startkey: strfmt('["%s"]', keyword),
      endkey: strfmt('["%s",{}]', keyword),
      group_level: 3
    }
  })
}

var params = { timeout: 1000 }

module.exports = function keywordSearch (keyword, callback) {
  // construct registry url
  var uri = searchUri(keyword)

  client.get(uri, params, function (error, data, raw, res) {
    // pass errors to callback
    if (error) {
      return callback(error)
    }
    // data is the parsed data object
    // raw is the json string
    // res is the response from couch

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
