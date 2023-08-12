# Avrbro

This library use the [Serial Api](https://wicg.github.io/serial/) available in Chrome (_with experimental flag enabled_) to upload compiled .hex files on Arduino boards without Avrdude, directly from a web page!

> For the moment it works only with stk500v1 protocol. That means it (_should_) works with _Uno_ and _Nano_ boards, but not with _Leonardo_ or _Mega_ boards).

## Install

```bash
# with npm
npm i avrbro --save

# or with yarn:
yarn add avrbro
```

## Exemple

```js
import avrbro from 'avrbro'
const { parseHex, openSerial, flash, reset } = avrbro

// Here's just an helper function to use async/await with FileReader...
const readFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const flashMyBoard = async () => {
  // connect to device using web serial API
  const serial = await openSerial()
  if (serial) {
  
    // get .hex buffer
    const response = await fetch('bin/my-firmware.hex')
    const data = await response.blob()
    const fileData = await readFileAsync(data)
    const hexBuffer = parseHex(new TextDecoder("utf-8").decode(fileData))
    
    // reset the board
    await reset(serial)
    
    // upload .hex file
    const success = await flash(serial, hexBuffer, { boardName: 'nano' })
    if (success) {
      console.log('.hex file uploaded on board successfully!')
    } else {
      console.log('an error has occurred :(')
    }
  } else {
    console.log('operation canceled by user')
  }
}

flashMyBoard()
```

## Api

#### isAvailable()

Allow to know if the serial API is available.

**Returns**: `Boolean`

---

#### openSerial(options)

Open serial connection with device. _Once called, the browser will open a dedicated modal window to choose the device._

**Params**

- options `object`
  - baudrate `Number` - defaults to `57600` (which is ok for nano boards with old bootloader. You can check [here](https://github.com/kaelhem/avrbro/blob/master/src/boards.js) to find the correct baudRate for yours...
  - filters `Array` - a list of objects containing vendor and product IDs used to search for attached devices. Filters contain the following values:
    - usbVendorId `String` - an unsigned short integer that identifies a USB device vendor.
    - usbProductId `String` - an unsigned short integer that identifies a USB device.



**Returns**: `Object` or `null` if cancelled. The `Object` will match `{port, reader, writer}` where:
  - port `SerialPort`
  - reader `ReadableStream`
  - writer `WritableStream`

---
#### closeSerial(serial)

Close serial connection with device.

**Params**

- serial `object`
  - port `SerialPort`
  - reader `ReadableStream`
  - writer `WritableStream`
---

#### parseHex(data)

Use Intel HEX file format to parse given data and prepare buffer for upload.

**Params**

- data `Object` - string in ASCII format or Buffer

**Returns**: `Buffer`

---

#### flash(serial, hexBuffer, options)

Flash the device connected on the given serial port with the given .hex file buffer.

**Params**

- data `Object` - string in ASCII format or Buffer Object
- hexBuffer `Buffer` - the .hex buffer returned by the _parseHex_ function
- options `Object`
  - boardName `String` - Name of the target board (_check `src/board.js` to find available names_)
  - debug `Boolean` - Allow to display logs during flash process

**Returns**: `Boolean`

---

#### reset(serial)

Reset board with cycle DTR.

**Params**

- serial `object`
  - port `SerialPort`
  - reader `ReadableStream`
  - writer `WritableStream`


## Contributing

Contributions in any form are welcome! If you find a bug, please [file an issue.](https://github.com/kaelhem/avrbro/issues)

## License

This project is licensed under the MIT license. See the [LICENSE file](./LICENSE) for more details.

## Acknowledgements

All this stuff was made possible thanks to:
<ul>
<li>https://github.com/bminer/intel-hex.js</li>
<li>https://github.com/jacobrosenthal/js-stk500v1</li>
<li>https://github.com/noopkat/avrgirl-arduino</li>
</ul>
