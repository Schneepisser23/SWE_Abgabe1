/*
 * Copyright (C) 2016 - 2018 Juergen Zimmermann, Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// @ts-check
/* global require, process, module, __dirname */
/* eslint no-magic-numbers: 0 */

const minimist = require('minimist')
const shell = require('shelljs')
const slash = require('slash')
const path = require('path')

const argv = minimist(process.argv.slice(0))
const values = argv._

const db = '-d hska'
const auth = '-u admin -p p --authenticationDatabase admin'
const pemFile = 'C:/Zimmermann/mongodb/mongodb.pem'
const ssl = '--ssl --host localhost --sslAllowInvalidCertificates ' +
    `--sslPEMKeyFile ${pemFile}`

const mongostart = () => {
    const configFile = 'C:/Zimmermann/mongodb/config.yml'
    shell.exec(`mongod --version && mongod --config ${configFile}`)
}

const mongostop = () => {
    const norc = '--norc admin'
    shell.exec(`mongo --eval db.shutdownServer() ${auth} ${norc} ${ssl}`)
}

const mongoimport = () => {
    const host = '-h localhost'
    const dbDir = 'config/db'
    shell.exec(
        `mongoimport -v ${db} ${auth} ${ssl} --stopOnError --drop ` +
        `  --file ${dbDir}/Buch.json --maintainInsertionOrder && ` +
        `mongofiles -v ${db} ${auth} ${ssl} -r ${host} ` +
        '  -l beispiele/image.png -t image/png put ' +
        '  00000000-0000-0000-0000-000000000001')
}

const mongoexport = () => {
    shell.exec(
        `mongoexport -v ${db} ${auth} ${ssl} ` +
        '-c buch -o EXPORT.buch.json --pretty')
}

const mongoexpress = () => {
    const httpsDir = slash(path.join(__dirname, '..', 'config', 'https'))
    const key = slash(path.join(httpsDir, 'key.pem'))
    const certExpress = slash(path.join(httpsDir, 'certificate.cer'))

    const mongoExpressEnv = 'SET VCAP_APP_PORT=8088' +
        '&& SET ME_CONFIG_MONGODB_SERVER=localhost' +
        '&& SET ME_CONFIG_MONGODB_ENABLE_ADMIN=true' +
        '&& SET ME_CONFIG_MONGODB_ADMINUSERNAME=admin' +
        '&& SET ME_CONFIG_MONGODB_ADMINPASSWORD=p' +
        '&& SET ME_CONFIG_MONGODB_AUTH_DATABASE=admin' +
        '&& SET ME_CONFIG_MONGODB_AUTH_USERNAME=admin' +
        '&& SET ME_CONFIG_MONGODB_AUTH_PASSWORD=p' +
        '&& SET ME_CONFIG_MONGODB_SSL=true' +
        '&& SET ME_CONFIG_MONGODB_SSLVALIDATE=false' +
        '&& SET ME_CONFIG_BASICAUTH_PASSWORD=p' +
        '&& SET ME_CONFIG_SITE_GRIDFS_ENABLED=true' +
        '&& SET ME_CONFIG_SITE_SSL_ENABLED=true' +
        `&& SET ME_CONFIG_SITE_SSL_KEY_PATH=${key}` +
        `&& SET ME_CONFIG_SITE_SSL_CRT_PATH=${certExpress}`

    // ggf. --version
    shell.exec(
        `${mongoExpressEnv}&& cd node_modules\\mongo-express && node app.js`)
}

module.exports = {
    mongoimport,
}

/* eslint-disable indent */
switch (values[2]) {
    case 'stop':
        mongostop()
        break
    case 'import':
        mongoimport()
        break
    case 'export':
        mongoexport()
        break
    case 'express':
    case 'mongoexpress':
        mongoexpress()
        break
    case 'start':
    default:
        mongostart()
}
