// IMPORTING MODULES/PACKAGES
var express = require('express')
var router = express.Router()

// HANDING ROUTES
// RESPONDS BACK WITH STATUS
router.get('/status', function (req, res, next) {
  res.render('index', { title: 'Express' })
})
// RESPONDS BACK WITH REPORT
router.post('/report', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

module.exports = router
