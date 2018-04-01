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

// https://github.com/i0natan/nodebestpractices

// spdy kann auch HTTP/2
// https://medium.com/the-node-js-collection/say-hello-to-http-2-for-node-js-core-261ba493846e
import {createServer, Server, ServerOptions} from 'spdy'

import {connection} from 'mongoose'

import {app} from './app'
import {connectDB, logger, SERVER_CONFIG} from './shared'

// Destructuring
const {host, port, key, cert} = SERVER_CONFIG
const options: ServerOptions = {
    // "shorthand" Properties fuer key und cert
    key,
    cert,
    spdy: {
        // protocols: ['h2', 'http/1.1']
        protocols: ['h2'],
        // kein reines TCP/IP, sondern nur mit TLS
        // Trailing Comma ab ES 2017
        plain: false,
    },
}
let server: Server

const closeCb = () => {
    logger.info(
        'Default-Verbindung zu MongoDB wurde geschlossen.')
    process.exit(0)
}
const sigintCb = () => {
    logger.info(`Server wird heruntergefahren...`)
    connection.close(() => {
        logger.info(
            'Default-Verbindung zu MongoDB wurde wegen <Strg>C geschlossen.')
        process.exit(0)
    })
    server.close()
}
const unhandledRejectionCb = (err: any) => {
    logger.error(err)
    connection.close(() => {
        logger.info(
            'Verbindung zu MongoDB wegen "unhandledRejection" geschlossen.')
        process.exit(1)
    })
}
const startServer = async () => {
    // await erfordert eine asynchrone Funktion
    await connectDB()
    server = createServer(options, app as any)

    server.on('close', () => connection.close(closeCb))
    process.on('SIGINT', sigintCb)
    process.on('unhandledRejection', unhandledRejectionCb)

    server.listen(port, host, () =>
        logger.info(
            `https://${host}:${port} ist gestartet: Herunterfahren durch <Strg>C`))
}
startServer()
