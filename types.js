/* eslint-disable @typescript-eslint/no-var-requires */
'use strict'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
const path = require('path')
const gqlg = require('gql-generator-ts-apollo')

const schemaDir = path.resolve(__dirname, 'src')

gqlg({
  schemaFilePath: schemaDir + '/schema.gql',
  destDirPath: schemaDir + '/dest/',
  ext: 'gql'
})

let operations = ''

function readFiles(dir) {
  fs.readdirSync(dir).forEach((file) => {
    let fullPath = path.join(dir, file)
    if (fs.lstatSync(fullPath).isDirectory()) {
      readFiles(fullPath)
    } else {
      let data = fs.readFileSync(fullPath, { encoding: 'utf8' })
      operations += getOperation(data)
    }
  })
  fs.writeFile(schemaDir + '/operations.gql', operations, 'utf8', (err) => {
    if (err) return console.log(err)
  })
}

function getOperation(data) {
  const regexp = /\`(.*(?:\r?\n(?!\r?\}).*)*\n\})\`/
  return data.match(regexp)[1] + '\n'
}

readFiles(schemaDir + '/dest/')
fs.rmSync(schemaDir + '/dest/', { recursive: true, force: true })
