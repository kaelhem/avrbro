/**
* Grabbed on https://github.com/substack/node-buffer-equal
*/

import { Buffer } from '../node_modules/buffer'

export const bufferEqual = (a, b) => {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    return undefined
  }
  if (typeof a.equals === 'function') {
    return a.equals(b)
  }
  if (a.length !== b.length) {
    return false
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}