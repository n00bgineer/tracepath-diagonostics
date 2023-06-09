// GETTING MODULES
const Traceroute = require('nodejs-traceroute')
const { WebServiceClient } = require('@maxmind/geoip2-node')

// SETTING LOCAL VARIABLES
// TYPES OF IP ADDRESS
const IPTypes = {
  UNTRACEROUTABLE: '*',
  PRIVATE: null,
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
  // Convert the IP address string to a numeric representation
  const ipParts = ip.split('.').map(Number)
  const ipNumber =
    (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3]

  // Define the IP ranges
  const ipRanges = [
    { start: '10.0.0.0', end: '10.255.255.255' },
    { start: '100.64.0.0', end: '100.127.255.255' },
    { start: '192.0.0.0', end: '192.0.0.255' },
    { start: '192.0.2.0', end: '192.0.2.255' },
    { start: '192.88.99.0', end: '192.88.99.255' },
    { start: '192.168.0.0', end: '192.168.255.255' },
    { start: '198.18.0.0', end: '198.19.255.255' },
    { start: '198.51.100.0', end: '198.51.100.255' },
    { start: '203.0.113.0', end: '203.0.113.255' },
    { start: '224.0.0.0', end: '239.255.255.255' },
    { start: '233.252.0.0', end: '233.252.0.255' },
    { start: '240.0.0.0', end: '255.255.255.255' },
    { start: '172.16.0.0', end: '172.31.255.255' },
  ]

  // Check if the IP address falls within any of the IP ranges
  for (const range of ipRanges) {
    const startParts = range.start.split('.').map(Number)
    const endParts = range.end.split('.').map(Number)
    const startNumber =
      (startParts[0] << 24) +
      (startParts[1] << 16) +
      (startParts[2] << 8) +
      startParts[3]
    const endNumber =
      (endParts[0] << 24) +
      (endParts[1] << 16) +
      (endParts[2] << 8) +
      endParts[3]

    if (ipNumber >= startNumber && ipNumber <= endNumber) {
      return true // IP address falls within the current range
    }
  }

  return false // IP address does not fall within any of the ranges
}

/**
 * @name geolocateMaxmind
 * @description METHOD TO GEOLOCATE USING MAXMIND'S NODE SDK
 * @param {*} ip IP ADDRESS
 * @returns {Object} GEOLOCATION DATA
 */
const geolocateMaxmind = async (ip) => {
  // SETTING LOCAL VARIABLES
  const token = process.env.MAXMIND_TOKEN
  const accountNumber = process.env.MAXMIND_ACCOUNT_NO
  const Client = new WebServiceClient(accountNumber, token, {
    host: 'geolite.info',
  })

  // EXECUTING GEOLOCATION
  try {
    const GeolocationData = await Client.city(ip)
    if (GeolocationData.location === undefined) throw 'CANNOT BE GEOLOCATED'
    else {
      return {
        country: GeolocationData.country?.names.en.toUpperCase(),
        city: GeolocationData.city?.names.en.toUpperCase(),
        postalCode: GeolocationData.postal?.code,
        latitude: GeolocationData.location.latitude,
        longitude: GeolocationData.location.longitude,
      }
    }
  } catch (error) {
    console.log(`ERROR (GEOLOCATION/MAXMIND): `, error.code)
    return null
  }
}

/**
 * @name geolocatePangea
 * @description METHOD TO GEOLOCATE USING PANGEA'S IP INTEL API
 * @param {*} ip IP ADDRESS
 * @returns {Object} GEOLOCATION DATA
 */
const geolocatePangea = async (ip) => {
  // SETTING LOCAL VARIABLESc
  const availableTokens = 3
  const token =
    process.env[`PANGEA_TOKEN${Math.floor(Math.random() * availableTokens)}`] //SELECTING RANDOM TOKEN
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
    const GeolocationData = await response.json()
    if (GeolocationData.status.toUpperCase() === 'SUCCESS') {
      return {
        country: GeolocationData.result.data.country.toUpperCase(),
        city: GeolocationData.result.data.city.toUpperCase(),
        postalCode: GeolocationData.result.data.postal_code,
        latitude: GeolocationData.result.data.latitude,
        longitude: GeolocationData.result.data.longitude,
      }
    } else throw 'CANNOT BE GEOLOCATED'
  } catch (error) {
    console.log(`ERROR (GEOLOCATION/PANGEA): `, error)
    return null
  }
}

/**
 * @name reputationPangea
 * @description METHOD TO PERFORM IP THREAT/REPUTATION ANALYSIS
 * @param {*} ip IP ADDRESS
 * @returns {Object} REPUTATION DATA
 */
const reputationPangea = async (ip) => {
  // SETTING LOCAL VARIABLESc
  const availableTokens = 3
  const token =
    process.env[`PANGEA_TOKEN${Math.floor(Math.random() * availableTokens)}`]
  const url = 'https://ip-intel.aws.us.pangea.cloud/v1/reputation'

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ip: '11.11.11.11',
    }),
  }

  // EXECUTING GEOLOCATION
  try {
    const response = await fetch(url, options)
    const ReputationData = await response.json()
    if (ReputationData.status.toUpperCase() === 'SUCCESS') {
      return {
        score: ReputationData.result.data.score,
        verdict: ReputationData.result.data.verdict,
        category: ReputationData.result.data.category,
        summary: ReputationData.summary,
      }
    } else throw 'IP REPUTATION CANNOT BE ASCERTAINED'
  } catch (error) {
    console.log(`ERROR (REPUTATION/PANGEA): `, error)
    return null
  }
}

/**
 * @name getGeolocation
 * @description METHOD TO GET GEOLOCATION
 * @param {*} ip IP ADDRESS
 * @returns {Object} GEOLOCATION DATA
 */
const getGeolocation = async (ip) => {
  const pangeaRes = await geolocatePangea(ip)
  if (pangeaRes !== null) {
    return {
      type: 'GEOLOCATED',
      data: pangeaRes,
    }
  } else {
    const maxmindRes = await geolocateMaxmind(ip)
    if (maxmindRes !== null) {
      return {
        type: 'GEOLOCATED',
        data: maxmindRes,
      }
    } else {
      return {
        type: 'UNGEOLOCATED',
      }
    }
  }
}

/**
 * @name traceroute
 * @description METHOD TO TRACEROUTE A GIVEN URL
 * @param {String} url URL
 * @returns {Object} TracerouteData
 */
const traceroute = async (url) => {
  // STORING START & END TIME TO CALCULATE EXECUTION TIME OF TRACEROUTING FUNC.
  const startTime = Date.now()

  return new Promise((resolve, reject) => {
    // STORING TRACEROUTING DATA
    let TracerouteData = {
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
      .on('hop', (Hop) => {
        console.log(`TRACEROUTE HOP: ${JSON.stringify(Hop)}`)
        // UNTRACEROUTABLE IP ADDRESS
        if (Hop.ip === IPTypes.UNTRACEROUTABLE)
          TracerouteData.hops.push({ ...Hop, type: 'UNTRACEROUTABLE' })
        // PRIVATE IP ADDRESS
        else if (isPrivateIP(Hop.ip))
          TracerouteData.hops.push({ ...Hop, type: 'PRIVATE' })
        // PUBLIC IP ADDRESS
        else {
          TracerouteData.hops.push({ ...Hop, type: 'PUBLIC' })
        }
      })
      .on('close', async (code) => {
        // SETTING INITIAL HOPS AS THE ORIGIN IP
        TracerouteData.hops.unshift({
          hop: 0,
          ip: process.env.DEVICE_IP,
          rtt: '0 ms',
          type: 'PUBLIC',
        })

        // SETTING LAST HOP DATA AS DESTINATION IP => IN SOME CASES IT RETURNS AS *.*.*.*
        TracerouteData.hops[TracerouteData.hops.length - 1] = {
          ...TracerouteData.hops[TracerouteData.hops.length - 1],
          ip: TracerouteData.destination,
          type: 'PUBLIC',
        }

        console.log(`TRACEROUTE CLOSE CODE: ${code}`)
        TracerouteData.closeCode = code

        // GETTING GEOLOCATION DATA FOR HOPS
        TracerouteData = {
          ...TracerouteData,
          hops: await Promise.all(
            TracerouteData.hops.map(async (Hop) => {
              if (Hop.type === 'PUBLIC') {
                console.log(`GEOLOCATING FOR ${Hop.ip}`)
                const GeolocationData = await getGeolocation(Hop.ip)

                console.log(`CHECKING IP REPUTATION FOR ${Hop.ip}`)
                const ReputationData = await reputationPangea(Hop.ip)
                return {
                  ...Hop,
                  ...GeolocationData,
                  reputation: ReputationData,
                }
              } else return Hop
            })
          ),
        }

        const endTime = Date.now()

        // RESOLVING REQUEST
        resolve({
          tracerouteData: TracerouteData,
          executionTimeTrace: endTime - startTime,
        })
      })
      .on('error', (error) => {
        console.error(error)
        reject(null)
      })

    console.log(`STARTING TRACEROUTING ON URL: ${url}`)
    tracer.trace(url)
  })
}

module.exports = traceroute
