import * as boardsHelper from './boards'
import { parseIntelHex } from './hex-parser'
import { bootload } from './stk500v1/stk500'

/**
* Checks if the serial api is available
* As november 2019 it works only in Chrome with this flag enabled:
*   chrome://flags/#enable-experimental-web-platform-features
*/
const isAvailable = () => navigator && navigator.serial

/**
* Allow to parse/check hex file
*/
const parseHex = (buffer) => {
  const hex = parseIntelHex(buffer).data
  return hex
}

/**
* Open the connection with the serial port
*/
const openSerial = async (options = {}) => {
  const { 
    baudrate = 57600,
    vendorId = 0x2341
  } = options
  // Filter on devices with the Arduino USB vendor ID. Not yet implemented...
  const requestOptions = {
    filters: [{ vendorId }]
  }

  // Request an Arduino from the user.
  try {
    const port = await navigator.serial.requestPort(requestOptions)
    await port.open({ baudrate })
    const reader = port.readable.getReader()
    const writer = port.writable.getWriter()
    return {port, reader, writer}
  } catch(e) {
    console.log(e)
  }
  return null
}

/**
* Reset board with cycle DTR
*/
const reset = async (serial) => {
  serial.port.setSignals({ rts: true, dtr: true })
  await new Promise(resolve => setTimeout(resolve, 250))
  serial.port.setSignals({ rts: false, dtr: false })
  await new Promise(resolve => setTimeout(resolve, 50))
}

/**
* Flash the device connected on the given serial port with the given .hex file buffer.
* Only works with stk500 version 1 for now...
*/
const flash = async (serial, hexData, options) => {
  if (!options) {
    throw new Error(`I need options to do this!`)
  }
  const { debug, boardName, ...boardOptions } = options
  let props = { debug, ...boardOptions }
  debug && console.log(`will flash .hex file on board...`)
  if (boardName) {
    const board = boardsHelper.getBoard(boardName)
    props = { ...props, ...board }
  }
  if (!props.name) {
    throw new Error('Cannot find board name!')
  }
  try {
    await reset(serial)
    const flashResult = await bootload(serial, hexData, props)
    debug && console.log(`flash complete successfully`)
    return flashResult
  } catch (err) {
    debug && console.log(`encountered errors during flash :(`)
    throw err
  }
}

export default {
  isAvailable,
  openSerial,
  parseHex,
  flash,
  boardsHelper
}