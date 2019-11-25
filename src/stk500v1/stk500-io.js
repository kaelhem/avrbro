import { Buffer } from '../../node_modules/buffer'
import { bufferEqual } from '../utils'
import Statics from './constants'

export const receiveData = async ({ reader }, timeout, responseLength) => {
  const startingBytes = [Statics.Resp_STK_INSYNC]
  
  let buffer = Buffer.alloc(0)
  let started = false
  let timeoutId = null
  let isReading = false
  let error = null

  const finished = (err) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    isReading = false
    error = err
  }

  const handleChunk = (data) => {
    console.log('chunk handled: ', data, new TextDecoder("utf-8").decode(data))
    let index = 0
    while (!started && index < data.length) {
      const byte = data[index]
      if (startingBytes.indexOf(byte) !== -1) {
        data = data.slice(index, data.length - index)
        started = true
      }
      index++
    }
    if (started) {
      buffer = Buffer.concat([buffer, data])
    }
    if (buffer.length > responseLength) {
      finished(new Error('buffer overflow '+buffer.length+' > '+responseLength))
    } else if (buffer.length == responseLength) {
      finished()
    }
  }

  if (timeout && timeout > 0) {
    timeoutId = setTimeout(() => {
      timeoutId = null
      finished(new Error('receiveData timeout after ' + timeout + 'ms'))
    }, timeout)
  }

  if (reader) {
    isReading = true
    while (isReading) {
      try {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        handleChunk(value)
      } catch (err) {
        console.log(err)
      }
    }
    if (error) {
      throw error
    }
    return buffer
  } else {
    throw new Error('serial port not found')
  }
}

export const sendCommand = async ({ reader, writer }, opt) => {
  let timeout = opt.timeout || 0;
  let responseData = null
  let responseLength = 0
  let error

  if (opt.responseData && opt.responseData.length > 0) {
    responseData = opt.responseData
  }
  if (responseData) {
    responseLength = responseData.length
  }
  if (opt.responseLength) {
    responseLength = opt.responseLength
  }
  let cmd = opt.cmd
  if (cmd instanceof Array) {
    cmd = Buffer.from(cmd.concat(Statics.Sync_CRC_EOP))
  }
  if (reader && writer) {
    try {
      console.log('will write: ', cmd)
      writer.write(cmd)
    } catch(err) {
      throw new Error('Sending ' + cmd.toString('hex') + ': ' + err.message)
    }
    
    console.log('wait response. length should be:' + responseLength)
    try {
      const data = await receiveData({ reader }, timeout, responseLength)
      if (responseData && !bufferEqual(data, responseData)) {
        throw new Error(cmd + ' response mismatch: ' + data.toString('hex') + ', ' + responseData.toString('hex'))
      }
      return data
    } catch (err) {
      throw new Error('Sending ' + cmd.toString('hex') + ': ' + err.message)
    }
  } else {
    throw new Error('serial port not found')
  }
}
