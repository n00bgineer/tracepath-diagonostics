// IMPORTING MODULES/PACKAGES
const { URL } = require('url')
const express = require('express')
const traceroute = require('../methods/traceroute')
const performance = require('../methods/performance')
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

/**
 * @name addProtocol
 * @description METHOD TO ADD PROTOCOL
 * @param {*} url URL
 * @returns {String} URL WITH PROTOCOL
 */
const addProtocol = (urlString) => {
  let url = urlString
  if (!urlString.includes('://')) url = 'https://' + urlString
  return urlString
}
/**
 * @name removeProtocol
 * @description METHOD TO REMOVE PROTOCOL
 * @param {*} urlString INPUT URL
 * @returns {String} URL WITHOUT PROTOCOL
 */
const removeProtocol = (urlString) => {
  let url = urlString
  if (!urlString.includes('://')) url = 'http://' + urlString
  const parsedUrl = new URL(url)
  const hostname = parsedUrl.hostname
  return hostname
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
    res.status(400).json({ error: 'URL IS REQUIRED' })
    return
  }
  // CHECKING URL FORMAT
  else if (!isValidURL(url)) {
    res.status(400).json({ error: 'INVALID URL' })
    return
  }
  // FOR VALID URL
  else {
    // STORING TRACEROUTING & PERFORMANCE DATA
    try {
      // TRACEROUTE ONLY ACCEPTS URL WITH NO PROTOCOL
      const { tracerouteData, executionTimeTrace } = await traceroute(
        removeProtocol(url)
      )
      // TRACEROUTE ONLY ACCEPTS URL WITH PROTOCOL
      const { performanceData, executionTimePerf } = await performance(
        addProtocol(url)
      )
      // RESPONSE
      res.status(200).json({
        ...performanceData,
        traceroute: tracerouteData,
        executionTime: executionTimePerf + executionTimeTrace,
        isTracerouteError: tracerouteData === null,
        isLighthouseError: performanceData === null,
      })
      return
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'ERROR OCCURED WHILE GENERATING REPORT' })
      return
    }
  }
})

module.exports = router
