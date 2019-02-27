import './lib/environment'
import multiparty from 'connect-multiparty'
import bodyParser from 'body-parser'
import express from 'express'
import qs from 'qs'
import api from './api'

const server = express()

server.set('query parser', str => qs.parse(str, { arrayLimit: 100, depth: 10 }))

server.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }))

server.use(bodyParser.json({ limit: '5mb' }))

server.use(multiparty({ uploadDir: './tmp' }))

server.use('/api', api)

server.listen(3000, () => {
  console.log('Listening at 3000')
})
