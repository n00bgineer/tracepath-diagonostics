// GETTING MODULES
const Traceroute = require('nodejs-traceroute')
const { WebServiceClient } = require('@maxmind/geoip2-node')

// SETTING LOCAL VARIABLES
// TYPES OF IP ADDRESS
const IPTypes = {
  UNTRACEROUTABLE: '*',
  PRIVATE:
    /^(?:10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2})$/,
  GEOLOCATED: null,
  UNGEOLOCATED: null,
}

// METHODS
/**
 * @name isPrivateIP
 * @description METHOD TO CHECK WHETHER IP ADDRESS OR NOT
 * @param {*} ip IP ADDRESS
 * @returns {Boolean} WHETHER PRIVATE IP OR NOT
 */
const isPrivateIP = (ip) => {
  const privateIPRegex = IPTypes['PRIVATE']
  return privateIPRegex.test(ip)
}

/**
 * @name geolocateMaxmind
 * @description GEOLOCATING USING MAXMIND'S NODE SDK
 * @param {*} ip IP ADDRESS
 * @returns {Object} GEOLOCATION DATA
 */
const geolocateMaxmind = async (ip) => {
  // SETTING LOCAL VARIABLES
  const token = process.env.MAXMIND_TOKEN
  const accountNumber = process.env.MAXMIND_ACCOUNT_NO
  const client = new WebServiceClient(accountNumber, token, {
    host: 'geolite.info',
  })

  // EXECUTING GEOLOCATION
  try {
    const response = await client.city(ip)
  } catch (err) {
    console.log(`ERR (GEOLOCATION/PANGEA): ${err.msg}`)
    return null
  }
}

/**
 * @name geolocatePangea
 * @description GEOLOCATING USING PANGEA'S IP INTEL API
 * @param {*} ip IP ADDRESS
 * @returns {Object} GEOLOCATION DATA
 */
const geolocatePangea = async (ip) => {
  // SETTING LOCAL VARIABLES
  const token = process.env.PANGEA_TOKEN
  const url = 'https://ip-intel.aws.us.pangea.cloud/v1/geolocate'
  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      provider: 'digitalelement',
      ip: ip,
    }),
  }

  // EXECUTING GEOLOCATION
  try {
    const response = await fetch(url, options)
  } catch (err) {
    console.log(`ERR (GEOLOCATION/MAXMIND): ${err.msg}`)
    return null
  }
}

/**
 * @name traceroute
 * @description METHOD TO TRACEROUTE A GIVEN URL
 * @param {String} url URL
 * @returns {Object} TracerouteData
 */
const traceroute = async (url) => {
  return new Promise((resolve, reject) => {
    // STORING TRACEROUTING DATA
    const TracerouteData = {
      destination: null,
      hops: [],
      closeCode: null,
    }

    // SETTING UP TRACE ROUTER
    const tracer = new Traceroute()
    tracer
      .on('destination', (destination) => {
        console.log(`TRACEROUTE DESTINATION: ${destination}`)
        TracerouteData.destination = destination
      })
      .on('hop', (hop) => {
        console.log(`TRACEROUTE HOP: ${JSON.stringify(hop)}`)
        // UNTRACEROUTABLE IP ADDRESS
        if (hop.ip === IPTypes.UNTRACEROUTABLE)
          TracerouteData.hops.push({ ...hop, type: 'UNTRACEROUTABLE' })
        // PRIVATE IP ADDRESS
        else if (isPrivateIP(hop.ip))
          TracerouteData.hops.push({ ...hop, type: 'PRIVATE' })
        // PUBLIC IP ADDRESS
        else TracerouteData.hops.push({ ...hop, type: 'PUBLIC' })
      })
      .on('close', (code) => {
        // TODO: SETTING FIRST HOP DATA BASED ON PREDEFINED DATA AS ORIGIN LOCATION IS KNOWN
        // SETTING LAST HOP DATA AS DESTINATION IP => IN SOME CASES IT RETURNS AS *.*.*.*
        TracerouteData.hops[TracerouteData.hops.length - 1]['ip'] =
          TracerouteData.destination

        // RESOLVING REQUEST
        console.log(`TRACEROUTE CLOSE CODE: ${code}`)
        TracerouteData.closeCode = code
        resolve(TracerouteData)
      })
      .on('error', (error) => {
        reject(error)
      })

    console.log(`STARTING TRACEROUTING ON URL: ${url}`)
    tracer.trace(url)
  })
}

module.exports = traceroute
