// GETTING MODULES
const Traceroute = require('nodejs-traceroute')
const { WebServiceClient } = require('@maxmind/geoip2-node')

// SETTING LOCAL VARIABLES
// TYPES OF IP ADDRESS
const IPTypes = {
  UNTRACEROUTABLE: '*',
  PRIVATE:
    /^(?:10(?:.\d{1,3}){3}|100.(?:6[4-9]|7[0-9])(?:.\d{1,3}){2}|192.0.0.(?:\d{1,3})|192.0.2.(?:\d{1,3})|192.88.99.(?:\d{1,3})|192.168(?:.\d{1,3}){2}|198.(?:1[8-9]|2[0-9]).(?:\d{1,3}){2}|198.51.100.(?:\d{1,3})|203.0.113.(?:\d{1,3})|22[4-9].(?:\d{1,3}){2}|23[0-9].(?:\d{1,3}){2}|2[4-5][0-9].(?:\d{1,3}){2}|2[0-5]{2}.(?:\d{1,3}){2}|172.(?:1[6-9]|2\d|3[01])(?:.\d{1,3}){2})$/,
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
    console.log(`ERROR (GEOLOCATION/PANGEA): `, error.code)
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
    const GeolocationData = await response.json()
    if (GeolocationData.status.toUpperCase() === 'SUCCESS') {
      return {
        country: GeolocationData.result.data.country.toUpperCase(),
        city: GeolocationData.result.data.city.toUpperCase(),
        postalCode: GeolocationData.result.data.postal_code,
        latitude: GeolocationData.result.data.latitude,
        longitude: GeolocationData.result.data.country.longitude,
      }
    } else throw 'CANNOT BE GEOLOCATED'
  } catch (error) {
    console.log(`ERROR (GEOLOCATION/MAXMIND): `, error)
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
  const maxmindRes = await geolocateMaxmind(ip)
  if (maxmindRes !== null) {
    return {
      type: 'GEOLOCATED',
      data: maxmindRes,
    }
  } else {
    const pangeaRes = await geolocatePangea(ip)
    if (pangeaRes !== null) {
      return {
        type: 'GEOLOCATED',
        data: pangeaRes,
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
                return {
                  ...Hop,
                  ...GeolocationData,
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
