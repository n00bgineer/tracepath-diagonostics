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
    const geolocationData = await client.city(ip)
    if (geolocationData.location === undefined) throw 'CANNOT BE GEOLOCATED'
    else {
      return {
        country: geolocationData.country?.names.en.toUpperCase(),
        city: geolocationData.city?.names.en.toUpperCase(),
        postalCode: geolocationData.postal?.code,
        latitude: geolocationData.location.latitude,
        longitude: geolocationData.location.longitude,
      }
    }
  } catch (err) {
    console.log(`ERR (GEOLOCATION/PANGEA): `, err.code)
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
    const geolocationData = await response.json()
    if (geolocationData.status.toUpperCase() === 'SUCCESS') {
      return {
        country: geolocationData.result.data.country.toUpperCase(),
        city: geolocationData.result.data.city.toUpperCase(),
        postalCode: geolocationData.result.data.postal_code,
        latitude: geolocationData.result.data.latitude,
        longitude: geolocationData.result.data.country.longitude,
      }
    } else throw 'CANNOT BE GEOLOCATED'
  } catch (err) {
    console.log(`ERR (GEOLOCATION/MAXMIND): `, err)
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
      .on('hop', (hop) => {
        console.log(`TRACEROUTE HOP: ${JSON.stringify(hop)}`)
        // UNTRACEROUTABLE IP ADDRESS
        if (hop.ip === IPTypes.UNTRACEROUTABLE)
          TracerouteData.hops.push({ ...hop, type: 'UNTRACEROUTABLE' })
        // PRIVATE IP ADDRESS
        else if (isPrivateIP(hop.ip))
          TracerouteData.hops.push({ ...hop, type: 'PRIVATE' })
        // PUBLIC IP ADDRESS
        else {
          TracerouteData.hops.push({ ...hop, type: 'PUBLIC' })
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
            TracerouteData.hops.map(async (hop) => {
              if (hop.type === 'PUBLIC') {
                console.log(`GEOLOCATING FOR ${hop.ip}`)
                const geolocationData = await getGeolocation(hop.ip)
                return {
                  ...hop,
                  ...geolocationData,
                }
              } else return hop
            })
          ),
        }

        // RESOLVING REQUEST
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
