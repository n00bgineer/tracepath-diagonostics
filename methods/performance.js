/**
 * @name runLighthouse
 * @description METHOD TO RUN LIGHTHOUSE STATS ON CHROME
 * @param {*} url URL ON WHICH THE LIGHTHOUSE STATS ON CHROME DEPEND UPON
 * @returns {Object} LighthouseResults
 */
const runLighthouse = async (url) => {
  // GETTING IMPORTS
  const Lighthouse = await import('lighthouse')
  const { launch } = await import('chrome-launcher')

  // LAUNCHING CHROME
  console.log('LAUNCHING CHROME INSTANCE')
  const Chrome = await launch({
    port: process.env.CHROME_PORT,
    chromeFlags: ['--headless', '--disable-gpu'],
  })
  console.log(`LAUNCHED CHROME INSTANCE ON PORT ${Chrome.port}`)

  // GETTING LIGHT HOUSE RESULTS
  const LighthouseResults = await Lighthouse.default(url, {
    port: Chrome.port,
    output: 'json',
    logLevel: 'info',
    timeout: 600,
  })

  // KILLING CHROME INSTANCE AND RETURNING RESPONSE
  Chrome.kill()
  return LighthouseResults
}

/**
 * @name transformPerformanceData
 * @description METHOD TO TRANSFORM PERFORMANCE DATA INTO THE REQUIRED FORM
 * @param {*} PerformanceData PERFORMANCE DATA
 * @returns {Object} PerformanceData
 */
const transformPerformanceData = (PerformanceData) => {
  console.log('TRANSFORMING PERFORMANCE DATA')

  // STORING SITE METADATA
  const description = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.name === 'description'
  )
  const ogUrl = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'og:url'
  )
  const ogTitle = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'og:title'
  )
  const ogDescription = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'og:description'
  )
  const ogSiteName = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'og:site_name'
  )
  const ogName = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'og:name'
  )
  const ogImage = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'og:image'
  )
  const ogImageAlt = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'og:image:alt'
  )
  const twitterTitle = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'twitter:title'
  )
  const twitterDescription = PerformanceData.artifacts.MetaElements?.filter(
    (MetaElement) => MetaElement.property === 'twitter:description'
  )
  const siteMeta = {
    description: description ? description[0]?.content : null,
    ogUrl: ogUrl ? ogUrl[0]?.content : null,
    ogTitle: ogTitle ? ogTitle[0]?.content : null,
    ogTitle: ogDescription ? ogDescription[0]?.content : null,
    ogSiteName: ogSiteName ? ogSiteName[0]?.content : null,
    ogName: ogName ? ogName[0]?.content : null,
    ogImage: ogImage ? ogImage[0]?.content : null,
    ogImageAlt: ogImageAlt ? ogImageAlt[0]?.content : null,
    twitterTitle: twitterTitle ? twitterTitle[0]?.content : null,
    twitterDescription: twitterDescription
      ? twitterDescription[0]?.content
      : null,
  }

  return {
    lhVersion: PerformanceData.lhr?.lighthouseVersion,
    url: PerformanceData.lhr?.requestedUrl,
    finalUrl: PerformanceData.lhr?.finalUrl,
    fcpScore: PerformanceData.lhr?.audits['first-contentful-paint'].score,
    fcpValue:
      PerformanceData.lhr?.audits['first-contentful-paint'].numericValue,
    lcpScore: PerformanceData.lhr?.audits['largest-contentful-paint'].score,
    lcpValue:
      PerformanceData.lhr?.audits['largest-contentful-paint'].numericValue,
    tbtScore: PerformanceData.lhr?.audits['total-blocking-time'].score,
    tbtValue: PerformanceData.lhr?.audits['total-blocking-time'].numericValue,
    ttiScore: PerformanceData.lhr?.audits['interactive'].score,
    ttiValue: PerformanceData.lhr?.audits['interactive'].numericValue,
    clsScore:
      PerformanceData.lhr?.audits['cumulative-layout-shift'].numericValue,
    srtValue: PerformanceData.lhr?.audits['server-response-time'].numericValue,
    srtItems:
      PerformanceData.lhr?.audits['server-response-time'].details?.items,
    speedIndexScore: PerformanceData.lhr?.audits['speed-index'].score,
    speedIndexValue: PerformanceData.lhr?.audits['speed-index'].numericValue,
    bootupTimeScore: PerformanceData.lhr?.audits['bootup-time'].score,
    bootupTimeValue: PerformanceData.lhr?.audits['bootup-time'].numericValue,
    bootupTimeItems: PerformanceData.lhr?.audits['bootup-time'].details?.items,
    bootupTimeSummary:
      PerformanceData.lhr?.audits['bootup-time'].details?.summary,
    thirdPartyItems:
      PerformanceData.lhr?.audits['third-party-summary'].details?.items,
    thirdPartySummary:
      PerformanceData.lhr?.audits['third-party-summary'].details?.summary,
    siteMeta: siteMeta,
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
    console.log(`STARTING APPLICATION PERFORMANCE REPORT GENERATION FOR ${url}`)
    // STORING START & END TIME TO CALCULATE EXECUTION TIME OF PERFORMANCE FUNC.
    let startTime = Date.now()
    let PerformanceData = await runLighthouse(url)
    let endTime = Date.now()

    // TRANSFORMING PERFORMANCE DATA INTO REQD. FORM
    PerformanceData = transformPerformanceData(PerformanceData)

    return {
      performanceData: PerformanceData,
      executionTimePerf: endTime - startTime,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

module.exports = performance
