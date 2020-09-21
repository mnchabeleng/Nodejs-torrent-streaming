'use strict'

const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const torrentStream = require('torrent-stream')

app.listen(3300, console.log('Server running on htttp://localhost:3300'))

app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/stream', (req, res) => {
    const magnetLink = 'magnet:?xt=urn:btih:8D06D8AF48591271F3BD523437078CB6B0039B19&dn=On+Ice+%281935%29+%5B720p%5D+%5BYTS.MX%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337'
    const options = {
        connections: 100,
        uploads: 10,
        path: './uploads/',
        verify: true,
        dht: true,
        tracker: true,
        trackers: [
            'udp://tracker.openbittorrent.com:80',
            'udp://tracker.ccc.de:80'
        ],
    }

    const engine = torrentStream(magnetLink, options)
    engine.on('ready', function() {
        const file = engine.files[0]
        console.log(file.length)
        const fileSize = file.length
        const range = req.headers.range
        
        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1
            const chunksize = (end - start) + 1
            const stream = file.createReadStream({start, end})
            const head = {
                'Content-Range': `bytes ${start} - ${end} / ${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(206, head)
            stream.pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            file.createReadStream().pipe(res)
        }

    })
})