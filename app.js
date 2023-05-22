// IMPORTING MODULES/PACKAGES
var path = require('path')
var express = require('express')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var indexRouter = require('./routes/index')

// INITIALISING EXPRESS
var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// TODO: SETUP ENDPOINT AUTH MIDDLEWARE

// SETTING ROUTES
app.use('/api', indexRouter)

module.exports = app
