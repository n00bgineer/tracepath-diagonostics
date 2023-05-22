// IMPORTING MODULES/PACKAGES
const express = require('express')
const traceroute = require('../methods/traceroute')
const router = express.Router()

// METHODS
/**
 * @name isValidURL
 * @description METHOD TO CHECK VALIDITY OF URL
 * @param {*} url URL
 * @returns {Boolean} WHETHER THE URL IS VALID OR NOT
 */
const isValidURL = (url) => {
  // NOTE: URL MUST HAVE EITHER HTTP OR HTTPS PROTOCOL PREFIXED TO IT
  const pattern = /^(?:https?:\/\/)?(?:www\.)?[^\s.]+\.[^\s]{2,}$/i
  return pattern.test(url)
}

// HANDING ROUTES
// RESPONDS BACK WITH STATUS
router.get('/status', (req, res, next) => {
  res
    .status(200)
    .json({ status: 'OK', message: 'DIAGONOSTIC SERVER IS FUNCTIONAL' })
})

// RESPONDS BACK WITH REPORT
router.post('/report', async (req, res, next) => {
  // SETTING VARIABLES
  const { url } = req.body // GETTING REQUEST BODY

  // CHECKING FOR EMPTY URL VALUE
  if (!url) {
    res.status(400).json({ error: 'URL is required' })
    return
  }
  // CHECKING URL FORMAT
  else if (!isValidURL(url)) {
    res.status(400).json({ error: 'Invalid URL' })
    return
  }
  // FOR VALID URL
  else {
    const output = await traceroute(url)
    res.status(200).json(output)
    return
  }
})

module.exports = router
