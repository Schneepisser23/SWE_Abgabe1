// tslint:disable:no-null-keyword

/*
 * Copyright (C) 2017 - 2018 Juergen Zimmermann, Hochschule Karlsruhe
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

import {createReadStream, createWriteStream, unlink} from 'fs-extra'
import * as gridFsStream from 'gridfs-stream'
import * as mongo from 'mongodb'
import {connection} from 'mongoose'
import {resolve} from 'path'
import {inspect} from 'util'

import {downloadDir, getExtension, log, logger} from '../../shared'
import {Buch} from '../model/buch'

export class BuchMultimediaService {
    @log
    async save(id: string, filePath: string, size: number, mimetype: string) {
        if (filePath === undefined) {
            return false
        }

        // Gibt es ein Buch zur angegebenen ID?
        const buch = await Buch.findById(id)
        if (buch === null) {
            return false
        }

        const gfs = gridFsStream(connection.db, mongo)
        gfs.remove({filename: id}, err => {
            if (err !== undefined) {
                logger.error(`Error: ${inspect(err)}`)
                throw err
            }
            logger.debug(`In GridFS geloescht: ${id}`)
        })
        const writestream = gfs.createWriteStream({
            filename: id,
            content_type: mimetype,
        })
        createReadStream(filePath).pipe(writestream)
        writestream.on('close', async (file: any) => {
            logger.debug(`In GridFS gespeichert: ${file.filename}`)
            await unlink(filePath)
        })

        return true
    }

    @log
    async findMedia(filename: string, sendFileCb: (pathname: string) => void,
                    sendErrCb: (statuscode: number) => void) {
        if (filename === undefined) {
            sendErrCb(404)
            return
        }
        // Gibt es ein Buch mit dem gegebenen "filename" als ID?
        const buch = await Buch.findById(filename)
        if (buch === null) {
            sendErrCb(404)
            return
        }
        logger.debug(`Buch: ${JSON.stringify(buch)}`)

        const gfs = gridFsStream(connection.db, mongo)

        // Einlesen von GridFS
        const readstream = gfs.createReadStream({filename})
        readstream.on('error', (err: any) => {
            if (err.name === 'MongoError'
                && err.message === `file with id ${filename} not opened for writing`) {
                sendErrCb(404)
            } else {
                logger.error(`Error: ${inspect(err)}`)
                sendErrCb(500)
            }
        })

        const cbReadFile = async (err: Error, file: any) => {
            // MIME-Typ ermitteln und Dateiname festlegen
            const mimeType: string = file.contentType
            logger.debug(`mimeType = ${mimeType}`)
            const pathname = resolve(downloadDir, filename)
            const pathnameExt = `${pathname}.${getExtension(mimeType)}`

            // In temporaere Datei schreiben
            const writestream = createWriteStream(pathnameExt)
            writestream.on('close', () => {
                logger.debug(`BuchMultimediaService: cbReadFile(): ${pathnameExt}`)
                sendFileCb(pathnameExt)
            })
            readstream.pipe(writestream)
        }

        // Meta-Informationen lesen: MIME-Type, ...
        gfs.findOne({filename}, cbReadFile)
    }

    toString() {
        return 'BuchMultimediaService'
    }
}
