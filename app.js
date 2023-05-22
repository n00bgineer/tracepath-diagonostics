// IMPORTING MODULES/PACKAGES
const path = require('path')
const express = require('express')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const indexRouter = require('./routes/index')

// INITIALISING EXPRESS
const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// TODO: SETUP ENDPOINT AUTH MIDDLEWARE

// SETTING ROUTES
app.use('/api', indexRouter)

module.exports = app
