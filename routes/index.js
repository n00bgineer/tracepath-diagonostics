// IMPORTING MODULES/PACKAGES
const { URL } = require('url')
const express = require('express')
const traceroute = require('../methods/traceroute')
const performance = require('../methods/performance')

// INITIALISING EXPRESS ROUTER
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
  return url
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

/**
 * @name isValidPerformanceData
 * @description METHOD TO CHECK VALIDITY OF PERFORMANCE METRICS
 * @param {*} performanceData PERFORMANCE OBJECT
 * @returns {Boolean} WHETHER OR NOT PERF DATA IS FALSE
 */
const isValidPerformanceData = (performanceData) => {
  // CHECKING RESPONSE BY TESTING AGAINST FIVE SCORE VALUES
  if (
    (performanceData.fcpScore == null ||
      performanceData.fcpScore == undefined) &&
    (performanceData.lcpScore == null ||
      performanceData.lcpScore == undefined) &&
    (performanceData.tbtScore == null ||
      performanceData.tbtScore == undefined) &&
    (performanceData.ttiScore == null ||
      performanceData.ttiScore == undefined) &&
    (performanceData.speedIndexScore == null ||
      performanceData.speedIndexScore == undefined) &&
    (performanceData.clsScore == null || performanceData.clsScore == undefined)
  ) {
    return false
  } else return true
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
    const report = {
      tracerouteData: null,
      performanceData: null,
      executionTimeTrace: 0,
      executionTimePerf: 0,
      isTracerouteError: false,
      isLighthouseError: false,
    }

    // PERFORMING TRACEROUTING OPS
    try {
      // TRACEROUTE ONLY ACCEPTS URL WITH NO PROTOCOL
      const { tracerouteData, executionTimeTrace } = await traceroute(
        removeProtocol(url)
      )
      // SETTING TRACEROUTING DATA
      report.tracerouteData = tracerouteData
      report.executionTimeTrace = executionTimeTrace
      report.isTracerouteError = false
    } catch (error) {
      // SETTING TRACEROUTING DATA
      report.isTracerouteError = true
    }

    // PERFORMING PERFORMANCE OPS
    try {
      // TRACEROUTE ONLY ACCEPTS URL WITH PROTOCOL
      const { performanceData, executionTimePerf } = await performance(
        addProtocol(url)
      )

      // CHECKING VALIDITY OF PERFORMANCE DATA
      if (isValidPerformanceData(performanceData)) {
        // SETTING PERFORMANCE DATA
        report.performanceData = performanceData
        report.executionTimePerf = executionTimePerf
        report.isLighthouseError = false
      } else {
        res.status(404).json({
          message: `PLEASE CHECK THE VALIDITY OF URL`,
        })
        report.isLighthouseError = true
      }
    } catch (error) {
      console.error(error)
      res.status(404).json({
        message: `PLEASE CHECK THE VALIDITY OF URL`,
      })
    }

    if (report.performanceData === null)
      res.status(404).json({
        message: `PLEASE CHECK THE VALIDITY OF URL`,
      })
    else
      res.status(200).json({
        ...report.performanceData,
        traceroute: report.tracerouteData,
        executionTime: report.executionTimePerf + report.executionTimeTrace,
        isTracerouteError: report.isTracerouteError,
        isLighthouseError: report.isLighthouseError,
      })
    return
  }
})

module.exports = router
