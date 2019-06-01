const asar = require('asar');
const {Buffer} = require('buffer')
const crypto = require('crypto')


const cachedArchives = {}
const ALGORITHM = 'rc4';
  const PASSWORD = 'filr-ball-electron-2015';
const decryptBuffer = function(buffer) {
    let decipher = crypto.createDecipher(ALGORITHM, PASSWORD);
    return Buffer.concat([decipher.update(buffer), decipher.final()]);
  }

const archive = getOrCreateArchive(asarPath)
const info = archive.getFileInfo(filePath)
let buffer = new Buffer(info.size)
const src = 'app';
const dest = 'app.asar';
 
const getOrCreateArchive = function (p) {
    let archive = cachedArchives[p]
    if (archive != null) {
      return archive
    }
    archive =asar.createArchive(p)
    if (!archive) {
      return false
    }
    cachedArchives[p] = archive
    return archive
  }
//asar.createPackage(src, dest);
asar.extractAll("app.asar","app")
console.log('done.');

const isAsarDisabled = function () {
    return process.noAsar || envNoAsar
  }
  
const splitPath = function (p) {
    // shortcut to disable asar.
    if (isAsarDisabled()) {
      return [false]
    }

    if (Buffer.isBuffer(p)) {
      p = p.toString()
    }

    if (typeof p !== 'string') {
      return [false]
    }

    if (p.substr(-5) === '.asar') {
      return [true, p, '']
    }

    p = path.normalize(p)
    const index = p.lastIndexOf('.asar' + path.sep)
    if (index === -1) {
      return [false]
    }
    return [true, p.substr(0, index + 5), p.substr(index + 6)]
  }

fs.readFile = function (p, options, callback) {
    const [isAsar, asarPath, filePath] = splitPath(p)
    if (!isAsar) {
      return readFile.apply(this, arguments)
    }
    if (typeof options === 'function') {
      callback = options
      options = void 0
    }
    const archive = getOrCreateArchive(asarPath)
    if (!archive) {
      return invalidArchiveError(asarPath, callback)
    }
    const info = archive.getFileInfo(filePath)
    if (!info) {
      return notFoundError(asarPath, filePath, callback)
    }
    if (info.size === 0) {
      return process.nextTick(function () {
        callback(null, new Buffer(0))
      })
    }
    if (info.unpacked) {
      const realPath = archive.copyFileOut(filePath)
      return fs.readFile(realPath, options, callback)
    }
    if (!options) {
      options = {
        encoding: null
      }
    } else if (util.isString(options)) {
      options = {
        encoding: options
      }
    } else if (!util.isObject(options)) {
      throw new TypeError('Bad arguments')
    }
    const {encoding} = options
    let buffer = new Buffer(info.size)
    const fd = archive.getFd()
    if (!(fd >= 0)) {
      return notFoundError(asarPath, filePath, callback)
    }
    logASARAccess(asarPath, filePath, info.offset)
    fs.read(fd, buffer, 0, info.size, info.offset, function (error) {
      //decrypt js file
      if (needDecrypt(p)) {
        buffer = decryptBuffer(buffer)
      }
      callback(error, encoding ? buffer.toString(encoding) : buffer)
    })
  }