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

import {connect, connection, HookNextFunction, pluralize, Schema} from 'mongoose'
import {resolve} from 'path'

import {logger} from '../logger'

// http://mongoosejs.com/docs/connections.html
// https://github.com/mongodb/node-mongodb-native
// https://docs.mongodb.com/manual/tutorial/configure-ssl-clients
// Defaultwerte
//      Port        27017
//      Poolsize    5

const user = 'admin'
const pass = 'p'
const authdb = 'admin'

const host = 'localhost'
// const host = '127.0.0.1'
const port = ':27017'
// const port = ''
const dbname = 'hska'
const auth = `authSource=${authdb}`
const ssl = '&ssl=true&sslValidate=false'
// const ssl = ''
const url = `mongodb://${user}:${pass}@${host}${port}/${dbname}?${auth}${ssl}`

// Name eines mongoose-Models = Name der Collection
// tslint:disable:no-null-keyword
pluralize('')

// Callback: Start des Appservers, nachdem der DB-Server gestartet ist
export const connectDB: () => void = async () => {
    // http://mongoosejs.com/docs/api.html#index_Mongoose-createConnection
    // http://mongoosejs.com/docs/api.html#connection_Connection-open
    // http://mongoosejs.com/docs/connections.html
    // https://github.com/Automattic/mongoose/issues/5304
    // https://docs.mongodb.com/manual/reference/connection-string/#connections-connection-options
    // http://mongodb.github.io/node-mongodb-native/2.1/api/MongoClient.html
    try {
        await connect(url)
    } catch (err) {
        logger.error(`FEHLER beim Aufbau der DB-Verbindung: ${err.message}\n`)
        process.exit(0)
    }
    logger.info(`DB-Verbindung zu ${connection.db.databaseName} ist aufgebaut`)

    connection.on('disconnecting',
                  () => logger.warn('DB-Verbindung wird geschlossen...'))
    connection.on('disconnected',
                  () => logger.warn('DB-Verbindung ist geschlossen.'))
    connection.on('error',
                  () => logger.error('Fehlerhafte DB-Verbindung'))
}

// In Produktion auf false setzen
export const autoIndex = true

const temp = 'temp'
export const uploadDir = resolve(__dirname, '..', '..', '..', temp, 'upload')
logger.debug(`Upload-Verzeichnis: ${uploadDir}`)
export const downloadDir = resolve(__dirname, '..', '..', '..', temp, 'download')
logger.debug(`Download-Verzeichnis: ${downloadDir}`)

export function optimistic(schema: Schema) {
    // https://stackoverflow.com/questions/35288488/...
    // ...easy-way-to-increment-mongoose-document-versions-for-any-update-queries
    // http://mongoosejs.com/docs/middleware.html
    // tslint:disable:only-arrow-functions
    schema.pre('save', function(next) {
        // this referenziert das Document
        // @ts-ignore: "this" weist implizit den Typ "any" auf, weil keine Typanmerkung vorhanden ist
        this.increment()
        next()
    })

    // findOneAndUpdate beinhaltet auch findByIdAndUpdate
    schema.pre('findOneAndUpdate', function(next) {
        // this referenziert die Query
        // @ts-ignore: "this" weist implizit den Typ "any" auf, weil keine Typanmerkung vorhanden ist
        this.update({}, {$inc: {__v: 1}}, next)
        // TODO Warum wird __v um 2 erhoeht?

        next()
    })
}

// https://medium.freecodecamp.org/introduction-to-mongoose-for-mongodb-d2a7aa593c57
export function audit(schema: Schema) {
    // zusaetzliche Felder fuer das Schema
    schema.add({
        erzeugt: Date,
        aktualisiert: Date,
    })

    // pre-save hook
    schema.pre('save', function(next: HookNextFunction) {
        const now = Date.now()
        // @ts-ignore: "this" weist implizit den Typ "any" auf, weil keine Typanmerkung vorhanden ist
        this.aktualisiert = now

        // @ts-ignore: "this" weist implizit den Typ "any" auf, weil keine Typanmerkung vorhanden ist
        if (this.erzeugt === undefined) {
            // @ts-ignore: "this" weist implizit den Typ "any" auf, weil keine Typanmerkung vorhanden ist
            this.erzeugt = now
        }
        next()
    })

    schema.pre('findOneAndUpdate', function(next: HookNextFunction) {
        // @ts-ignore: "this" weist implizit den Typ "any" auf, weil keine Typanmerkung vorhanden ist
        this.update({}, {aktualisiert: Date.now()}, next)
        next()
    })
}
