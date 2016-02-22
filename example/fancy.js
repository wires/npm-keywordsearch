var c = require('chalk')
var argv = require('minimist')(process.argv.slice(2))
var npmKeywordSearch = require('../npm-keywordsearch')

var keyword = (argv._.length === 0) ? 'gulp-plugin' : argv._[0]

npmKeywordSearch(keyword, function (error, packages) {
  // bork on error
  if (error) {
    console.error(error)
    process.exit(-1)
  }

  // print it
  var N = packages.length
  console.log('Packages matching \"' + c.yellow(keyword) + '\": (' + N + ')\n')
  packages.forEach(function (pkg) {
    console.log(' ' + c.bold(pkg.name) + ' 🔌  ' + c.gray(c.italic(pkg.description)))
  })
  console.log('')
})
