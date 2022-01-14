const express = require('express')
const serveStatic = require('serve-static')
// const path = require('path')
app = express()
const distDir = __dirname + '/dist/'
app.use(serveStatic(distDir))
const port = process.env.PORT || 3000
app.listen(port)
