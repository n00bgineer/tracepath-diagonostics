/**
 * @name runLighthouse
 * @description METHOD TO RUN LIGHTHOUSE STATS ON CHROME
 * @param {*} url URL ON WHICH THE LIGHTHOUSE STATS ON CHROME DEPEND UPON
 * @returns {Object} lighthouseResults
 */
const runLighthouse = async (url) => {
  // GETTING IMPORTS
  const lighthouse = await import('lighthouse')
  const { launch } = await import('chrome-launcher')

  // LAUNCHING CHROME
  const chrome = await launch({
    port: 3001,
    chromeFlags: ['--headless', '--disable-gpu'],
  })

  // GETTING LIGHT HOUSE RESULTS
  const lighthouseResults = await lighthouse.default(url, {
    port: chrome.port,
    output: 'json',
    logLevel: 'info',
  })

  // KILLING CHROME INSTANCE AND RETURNING RESPONSE
  chrome.kill()
  return lighthouseResults
}

/**
 * @name transformPerformanceData
 * @description METHOD TO TRANSFORM PERFORMANCE DATA INTO THE REQUIRED FORM
 * @param {*} performanceData PERFORMANCE DATA
 * @returns {Object} performanceData
 */
const transformPerformanceData = (performanceData) => {
  console.log('TRANSFORMING PERFORMANCE DATA')

  return {
    lhVersion: performanceData.lhr.lighthouseVersion,
    url: performanceData.lhr.requestedUrl,
    finalUrl: performanceData.lhr.finalUrl,
    fcpScore: performanceData.lhr.audits['first-contentful-paint'].score,
    fcpValue: performanceData.lhr.audits['first-contentful-paint'].numericValue,
    lcpScore: performanceData.lhr.audits['largest-contentful-paint'].score,
    lcpValue:
      performanceData.lhr.audits['largest-contentful-paint'].numericValue,
    tbtScore: performanceData.lhr.audits['total-blocking-time'].score,
    tbtValue: performanceData.lhr.audits['total-blocking-time'].numericValue,
    ttiScore: performanceData.lhr.audits['interactive'].score,
    ttiValue: performanceData.lhr.audits['interactive'].numericValue,
    clsScore:
      performanceData.lhr.audits['cumulative-layout-shift'].numericValue,
    srtValue: performanceData.lhr.audits['server-response-time'].numericValue,
    srtItems: performanceData.lhr.audits['server-response-time'].details.items,
    speedIndexScore: performanceData.lhr.audits['speed-index'].score,
    speedIndexValue: performanceData.lhr.audits['speed-index'].numericValue,
    bootupTimeScore: performanceData.lhr.audits['bootup-time'].score,
    bootupTimeValue: performanceData.lhr.audits['bootup-time'].numericValue,
    bootupTimeItems: performanceData.lhr.audits['bootup-time'].details.items,
    bootupTimeSummary:
      performanceData.lhr.audits['bootup-time'].details.summary,
    thirdPartyItems:
      performanceData.lhr.audits['third-party-summary'].details.items,
    thirdPartySummary:
      performanceData.lhr.audits['third-party-summary'].details.summary,
  }
}

/**
 * @name performance
 * @description METHOD TO GENERATE PERFORMANCE REPORT FOR A GIVEN URL
 * @param {String} url URL
 * @returns {Object} PerformanceData
 */
const performance = async (url) => {
  try {
    // STORING START & END TIME TO CALCULATE EXECUTION TIME OF PERFORMANCE FUNC.
    let startTime = Date.now()
    let performanceData = await runLighthouse(url)
    let endTime = Date.now()

    // TRANSFORMING PERFORMANCE DATA INTO REQD. FORM
    performanceData = transformPerformanceData(performanceData)

    return {
      performanceData: performanceData,
      executionTime: endTime - startTime,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

module.exports = performance
