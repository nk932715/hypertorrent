# hypertorrent [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

Stream a torrent into a hyperdrive

## Usage
```txt
  Usage:
    $ hypertorrent <magnet link or .torrent file> [output location]

  Commands:
    <default>  Convert a torrent link or file to a hyperdrive, returns a key

  Options:
    -d, --daemon          Keep all open after torrent is done downloading
    -h, --help            Print usage
    -k, --keep-uploading  Keep hyperdrive open after torrent is done downloading
    -v, --version         Print version

  Examples:
    $ hypertorrent ./my-science-data.torrent /tmp/foobar
```

## JS API
```js
var hyperdiscovery = require('hyperdiscovery')
var hypertorrent = require('hypertorrent')
var memdb = require('memdb')

var db = memdb()
var ht = hypertorrent('<magnet-link>', db, function (err) {
  if (err) throw err
})

var archive = ht.archive // hyperdrive instance
var torrent = ht.torrent // webtorrent instance

hyperdiscovery(archive)   // expose it to the network
```

## API
### ht = hypertorrent(bufferOrMagnetLink, db, [opts], callback)
Create a new hypertorrent instace from a `Buffer` containing the contents of a
`.torrent` file or a magnet link. Takes a `level` database to store the files.
`opts` is passed directly to `hyperdrive`; it takes an extra property of `.key`
to create the public key if already exists.

### archive = ht.archive
The `hyperdrive` instance created by `hypertorrent`

### torrent = ht.torrent
The `webtorrent` instance created by `hypertorrent`

## See Also
- [mafintosh/hyperdrive](https://github.com/mafintosh/hyperdrive)
- [feross/webtorrent](https://github.com/feross/webtorrent)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/hypertorrent.svg?style=flat-square
[3]: https://npmjs.org/package/hypertorrent
[4]: https://img.shields.io/travis/yoshuawuyts/hypertorrent/master.svg?style=flat-square
[5]: https://travis-ci.org/yoshuawuyts/hypertorrent
[6]: https://img.shields.io/codecov/c/github/yoshuawuyts/hypertorrent/master.svg?style=flat-square
[7]: https://codecov.io/github/yoshuawuyts/hypertorrent
[8]: http://img.shields.io/npm/dm/hypertorrent.svg?style=flat-square
[9]: https://npmjs.org/package/hypertorrent
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
