// IMPORTING MODULES/PACKAGES
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')

// INSTANTIATING PRISMA CLIENT
const db = new PrismaClient()

// CREATING READLINE INTERFACE
const Readline = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// STORING MACHINE CONFIG
const MachineConfig = {
  platform: 'LINUX',
  os: 'UBUNTU',
  osVersion: '20.04',
  isBundled: false,
  memoryInGB: 2,
  monthlyUSDPrice: 10,
  numberOfCPU: 2,
}

// STORING INSTANCE DETAILS OBJECT
const Instance = {
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updateAt: new Date().toISOString(),
  authKey: uuidv4(),
  expiryAt: '',
  name: '',
  regionName: '',
  ipAddress: '',
  portNo: '',
  machineConfig: MachineConfig,
}

/**
 * @name updateEnv
 * @description METHOD TO UPDATE ENV FILE
 * @param {*} key KEY VALUE
 * @param {*} value VALUE VALUE
 * returns {undefined} undefined
 */
const updateEnv = async (key, value) => {
  // LOAD .ENV FILE
  const env = fs.readFileSync(
    path.join(path.dirname(__dirname), '.env'),
    'utf8'
  )
  const lines = env.split('\n')

  // FIND AND UPDATE SPECIFIC KEY-VALUE PAIR
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith(key + '=')) {
      lines[i] = `${key}="${value}"`
      break
    }
  }

  // UPDATE .ENV FILE
  fs.writeFileSync(path.join(path.dirname(__dirname), '.env'), lines.join('\n'))
}

/**
 * @name validateMonthsInput
 * @description METHOD TO VALIDATE WHETHER VALUE OF MONTH WAS CORRECT OR NOT
 * @param {*} input INPUT VALUE
 * @returns {Boolean} WHETHER INPUT IS VALID OR NOT
 */
const validateMonthsInput = (input) => {
  const months = parseInt(input)
  return Number.isInteger(months) && months > 0 && months <= 12
}

/**
 * @name validateIpAddress
 * @description METHOD TO VALIDATE WHETHER IP ADDRESS WAS CORRECT OR NOT
 * @param {*} input INPUT VALUE
 * @returns {Boolean} WHETHER INPUT IS VALID OR NOT
 */
const validateIpAddress = (input) => {
  // IPv4 regex pattern
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
  return ipv4Regex.test(input)
}

/**
 * @name validatePortNumber
 * @description METHOD TO VALIDATE WHETHER VALUE OF PORT WAS CORRECT OR NOT
 * @param {*} input INPUT VALUE
 * @returns {Boolean} WHETHER INPUT IS VALID OR NOT
 */
const validatePortNumber = (input) => {
  const port = parseInt(input)
  return Number.isInteger(port) && port > 0 && port <= 65535 // Valid TCP/IP port range
}

/**
 * @name updateInstance
 * @description METHOD TO UPDATE INSTANCE OBJECT
 * @param {*} key KEY VALUE
 * @param {*} value VALUE VALUE
 * @returns {undefined} undefined
 */
const updateInstance = (key, value) => {
  Instance[key] = value
}

// Prompt for number of months to expire
Readline.question('NO. OF MONTHS TO EXPIRE: ', (months) => {
  if (validateMonthsInput(months)) {
    const currentDate = new Date()
    const expiryDate = new Date(
      currentDate.setMonth(currentDate.getMonth() + parseInt(months))
    )
    updateInstance('expiryAt', expiryDate.toISOString())

    // Prompt for name of instance
    Readline.question('NAME OF INSTANCE: ', (name) => {
      if (name.trim() !== '') {
        updateInstance('name', name)

        // Prompt for name of region
        Readline.question(
          'NAME OF REGION WHERE INSTANCE IS DEPLOYED: ',
          (region) => {
            if (region.trim() !== '') {
              updateInstance('regionName', region)

              // Prompt for IP address
              Readline.question('IP ADDRESS OF INSTANCE: ', (ipAddress) => {
                if (validateIpAddress(ipAddress)) {
                  updateInstance('ipAddress', ipAddress)

                  // Prompt for port number
                  Readline.question(
                    'PORT NO. OF INSTANCE: ',
                    async (portNo) => {
                      if (validatePortNumber(portNo)) {
                        updateInstance('portNo', portNo)

                        // Close the readline interface and log the updated object
                        Readline.close()

                        //   MAKE PRISMA CALL AFTER THIS
                        console.log('UPDATING INSTACE OBJECT')
                        await db.region
                          .create({ data: Instance })
                          .then(async (value) => {
                            console.log('UPDATING ENV VALUES')
                            await updateEnv('DEVICE_IP', value.ipAddress).then(
                              () => console.log('UPDATED DEVICE_IP VALUE')
                            )
                            await updateEnv('AUTH_KEY', value.authKey).then(
                              () => console.log('UPDATED AUTH_KEY VALUE')
                            )
                          })
                      } else {
                        console.log('Invalid port number!')
                        Readline.close()
                      }
                    }
                  )
                } else {
                  console.log('Invalid IP address!')
                  Readline.close()
                }
              })
            } else {
              console.log('Region name cannot be empty!')
              Readline.close()
            }
          }
        )
      } else {
        console.log('Instance name cannot be empty!')
        Readline.close()
      }
    })
  } else {
    console.log('Invalid number of months!')
    Readline.close()
  }
})
