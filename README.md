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
import { parseHex, connect, flash } from 'avrbro'

const flashMyBoard = async () => {
  // get .hex buffer
  const response = await fetch('bin/my-firmware.hex')
  const data = await response.json()
  const hexBuffer = parseHex(new TextDecoder("utf-8").decode(buffer))
  // connect to device using web serial API
  const serial = await connect()
  if (serial) {
    // upload .hex file
    const success = await flash(serial, hexBuffer, { boardName: 'nano' })
    if (success) {
      console.log('.hex file uploaded on board successfully!')
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

#### connect(options)

Open serial connection with device. _Once called, the browser will open a dedicated modal window to choose the device._

**Params**

- options `object`
  - baudrate `Number` - defaults to `57600`
  - vendorId `Number` - defaults to `0x2341`

**Returns**: `Serial` or `null` if cancelled

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


## Contributing

Contributions in any form are welcome! If you find a bug, please [file an issue.](https://github.com/kaelhem/memoprout/issues)

## License

This project is licensed under the MIT license. See the [LICENSE file](./LICENSE) for more details.

## Acknowledgements

All this stuff was made possible thanks to:
<ul>
<li>https://github.com/bminer/intel-hex.js</li>
<li>https://github.com/jacobrosenthal/js-stk500v1</li>
<li>https://github.com/noopkat/avrgirl-arduino</li>
</ul>
