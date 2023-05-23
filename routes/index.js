// IMPORTING MODULES/PACKAGES
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
      const { tracerouteData, executionTimeTrace } = await traceroute(url)
      const { performanceData, executionTimePerf } = await performance(
        'https://' + url
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
