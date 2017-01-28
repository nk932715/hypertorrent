#!/usr/bin/env node

var hyperdiscovery = require('hyperdiscovery')
var hyperhealth = require('hyperhealth')
var speedometer = require('speedometer')
var raf = require('random-access-file')
var Diff = require('ansi-diff-stream')
var pretty = require('prettier-bytes')
var minimist = require('minimist')
var isFile = require('is-file')
var mkdirp = require('mkdirp')
var xtend = require('xtend')
var level = require('level')
var path = require('path')
var fs = require('fs')

var hypertorrent = require('./')
var diff = Diff()

var argv = minimist(process.argv.slice(2), {
  boolean: [
    'version',
    'help'
  ]
})

var usage = `
  Usage:
    $ hypertorrent <magnet link or .torrent file> [output location]

  Commands:
    <default>  Convert a torrent link or file to a hyperdrive, returns a key

  Options:
    -h, --help      Print usage
    -v, --version   Print version

  Examples:
    $ hypertorrent ./my-torrent.torrent
`

;(function main (argv) {
  var torrent = argv._[0]
  var outdir = path.resolve(argv._[1] || process.cwd())
  if (argv.h) {
    return console.info(usage)
  } else if (argv.v) {
    return console.info('v' + require('./package.json').version)
  } else if (!torrent) {
    throw new Error('first argument should be a torrent')
  } else {
    var dbdir = path.join(outdir, 'db')
    mkdirp.sync(dbdir)
    var db = level(dbdir)

    // SLEEP will make this redundant
    try {
      var secretKey = fs.readFileSync(path.join(dbdir, 'secret-key'))
      var key = fs.readFileSync(path.join(dbdir, 'key'))
    } catch (e) {
    }

    var opts = {
      file: function (name) {
        return raf(path.join(outdir, name))
      }
    }

    if (secretKey) {
      opts = xtend(opts, {
        secretKey: secretKey,
        key: key
      })
    }

    if (isFile.sync(String(torrent))) torrent = fs.readFileSync(torrent)
    var ht = hypertorrent(torrent, db, opts, function (err) {
      if (err) throw err
    })

    hyperdiscovery(ht.archive)
    ht.archive.open(function () {
      var key = ht.archive.key.toString('hex')
      var health = hyperhealth(ht.archive)
      var swarm = ht.torrent.swarm

      // this should no longer be necessary once SLEEP lands
      var _secretKey = ht.archive.metadata.secretKey
      fs.writeFileSync(path.join(dbdir, 'secret-key'), _secretKey)

      var _key = ht.archive.metadata.key
      fs.writeFileSync(path.join(dbdir, 'key'), _key)

      var downloadSpeed = speedometer()
      var uploadSpeed = speedometer()
      var ds = 0
      var us = 0

      ht.archive.on('upload', function (data) {
        us = uploadSpeed(data.length)
      })
      ht.archive.on('download', function (data) {
        ds = downloadSpeed(data.length)
      })

      diff.pipe(process.stdout)
      setInterval(function () {
        var data = health.get()
        diff.write(`
Location on disk: ${outdir}
Hyperdrive key: ${key}
Hyperdrive peer count: ${data.peers.length}
Hyperdrive upload speed: ${pretty(us)}
Hyperdrive download speed: ${pretty(ds)}
Torrent peer count: ${swarm.connections.length}
Torrent upload speed: ${pretty(swarm.uploadSpeed())}
Torrent download speed: ${pretty(swarm.downloadSpeed())}
        `)
      }, 1000)
    })
  }
})(argv)