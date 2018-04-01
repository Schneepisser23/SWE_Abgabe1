// tslint:disable:max-file-line-count

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

import {NextFunction, Request, Response} from 'express'
import {unlink} from 'fs'
import * as _ from 'lodash'
import * as mongoose from 'mongoose'
import {inspect} from 'util'

import {getBaseUri, log, logger, MIME_CONFIG} from '../../shared'
import {Buch} from '../model/buch'
import {BuchMultimediaService} from '../service/buch-multimedia.service'
import {BuchService} from '../service/buch.service'
import {TitelExistsError, ValidationError, VersionInvalidError} from '../service/exceptions'

// export bei async und await:
// https://blogs.msdn.microsoft.com/typescript/2015/11/30/announcing-typescript-1-7
// http://tc39.github.io/ecmascript-export
// https://nemethgergely.com/async-function-best-practices#Using-async-functions-with-express

class BuchRequestHandler {
    private readonly buchService = new BuchService()
    private readonly buchMultimediaService = new BuchMultimediaService()

    @log
    async findById(req: Request, res: Response, next: NextFunction) {
        const versionHeader = req.header('If-None-Match')
        const id: string = req.params.id
        logger.debug(`BuchRequestHandler.findById id = ${id}`)

        let buch: mongoose.Document|null
        try {
            buch = await this.buchService.findById(id)
        } catch (err) {
            // Exception einer export async function bei der Ausfuehrung fangen:
            // https://strongloop.com/strongblog/comparing-node-js-promises-trycatch-zone-js-angular
            logger.error(`BuchRequestHandler.findById Error: ${inspect(err)}`)
            res.sendStatus(500)
            return
        }

        // tslint:disable-next-line:no-null-keyword
        if (buch === null) {
            logger.debug('BuchRequestHandler.findById status = 404')
            res.sendStatus(404)
            return
        }

        logger.debug(`BuchRequestHandler.findById (): buch = ${JSON.stringify(buch)}`)
        const versionDb = buch.__v
        if (versionHeader === `${versionDb}`) {
            res.sendStatus(304)
            return
        }
        logger.debug(`BuchRequestHandler.findById VersionDb = ${versionDb}`)
        res.header('ETag', `"${versionDb}"`)

        const baseUri = getBaseUri(req)
        const payload = this.toJsonPayload(buch)
        // Atom Links
        payload._links = {
            self: {href: `${baseUri}/${id}`},
            list: {href: `${baseUri}`},
            add: {href: `${baseUri}`},
            update: {href: `${baseUri}/${id}`},
            remove: {href: `${baseUri}/${id}`},
        }
        res.json(payload)
    }

    @log
    async find(req: Request, res: Response, next: NextFunction) {
        // z.B. https://.../buch?titel=Alpha
        const query = req.query
        logger.debug(`BuchRequestHandler.find queryParams = ${JSON.stringify(query)}`)

        let buecher: Array<mongoose.Document> = []
        try {
            buecher = await this.buchService.find(query)
        } catch (err) {
            logger.error(`BuchRequestHandler.find Error: ${inspect(err)}`)
            res.sendStatus(500)
        }

        logger.debug(`BuchRequestHandler.find: buecher = ${JSON.stringify(buecher)}`)
        if (buecher.length === 0) {
            // Alternative: https://www.npmjs.com/package/http-errors
            // Damit wird aber auch der Stacktrace zum Client
            // uebertragen, weil das resultierende Fehlerobjekt
            // von Error abgeleitet ist.
            logger.debug('status = 404')
            res.sendStatus(404)
            return
        }

        const baseUri = getBaseUri(req)
        const payload = buecher.map(buch => {
            const buchResource = this.toJsonPayload(buch)
            // Atom Links je Buch
            buchResource.links = [
                {rel: 'self'},
                {href: `${baseUri}/${buch._id}`},
            ]
            return buchResource
        })
        res.json(payload)
    }

    @log
    async create(req: Request, res: Response, next: NextFunction) {
        const contentType = req.header(MIME_CONFIG.contentType)
        if (contentType === undefined
            || contentType.toLowerCase() !== MIME_CONFIG.json) {
            logger.debug('BuchRequestHandler.create status = 406')
            res.sendStatus(406)
            return
        }

        const buch = new Buch(req.body)
        logger.debug(`BuchRequestHandler.create post body: ${JSON.stringify(buch)}`)

        let buchSaved: mongoose.Document
        try {
            buchSaved =
                await this.buchService.create(buch)
        } catch (err) {
            if (err instanceof ValidationError) {
                res.status(400).send(JSON.parse(err.message))
                return
            }
            if (err instanceof TitelExistsError) {
                res.status(400).send(err.message)
                return
            }

            logger.error(`Error: ${inspect(err)}`)
            res.sendStatus(500)
            return
        }

        const location = `${getBaseUri(req)}/${buchSaved._id}`
        logger.debug(`BuchRequestHandler.create: location = ${location}`)
        res.location(location)
        res.sendStatus(201)
    }

    @log
    async update(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params.id
        logger.debug(`BuchRequestHandler.update id = ${id}`)

        const contentType = req.header(MIME_CONFIG.contentType)
        if (contentType === undefined
            || contentType.toLowerCase() !== MIME_CONFIG.json) {
            res.status(406)
            return
        }
        const versionHeader = req.header('If-Match')
        logger.debug(`BuchRequestHandler.update versionHeader: ${versionHeader}`)

        const buch = new Buch(req.body)
        buch._id = id
        logger.debug(`BuchRequestHandler.update buch: ${JSON.stringify(buch)}`)

        try {
            await this.buchService.update(buch, versionHeader)
        } catch (err) {
            if (err instanceof VersionInvalidError) {
                logger.debug(`BuchRequestHandler.update status = 412, message: ${err.message}`)
                res.status(412).send(err.message)
                return
            }
            if (err instanceof ValidationError) {
                res.status(400).send(JSON.parse(err.message))
                return
            }
            if (err instanceof TitelExistsError) {
                res.status(400).send(err.message)
                return
            }

            logger.error(`BuchRequestHandler.update Error: ${inspect(err)}`)
            res.sendStatus(500)
            return
        }

        res.sendStatus(204)
    }

    @log
    async delete(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params.id
        logger.debug(`BuchRequestHandler.delete id = ${id}`)

        try {
            await this.buchService.remove(id)
        } catch (err) {
            logger.error(`BuchRequestHandler.delete Error: ${inspect(err)}`)
            res.sendStatus(500)
            return
        }

        res.sendStatus(204)
    }

    @log
    async upload(req: Request, res: Response, next: NextFunction) {
        const id: string = req.params.id

        // Multer ergaenzt das Request-Objekt um die Property "file".
        // Das file-Objekt wiederum enthaelt die Properties path, size, mimetype.
        if (Object.keys(req).includes('file') === false) {
            const msg = 'Keine Property "file" im Request-Objekt'
            logger.error(`BuchRequestHandler.upload: ${msg}`)
            res.status(500).send(msg)
            return
        }

        const {file} = req as any
        const {path, size, mimetype} = file
        let result
        try {
            result = await this.buchMultimediaService.save(id, path, size, mimetype)
        } catch (err) {
            logger.error(`BuchRequestHandler.upload Error: ${inspect(err)}`)
            res.sendStatus(500)
            return
        }

        if (result === false) {
            res.sendStatus(404)
        }

        res.sendStatus(204)
    }

    @log
    download(req: Request, res: Response) {
        const id: string = req.params.id
        const cbSendFile = (pathname: string) => {
            logger.debug(`BuchRequestHandler.download cbSendFile(): ${pathname}`)
            const unlinkCb = (err: any) => {
                if (err) {
                    logger.error(`BuchRequestHandler.download cbSendFile Error: ${inspect(err)}`)
                    throw err
                }
                logger.debug(`BuchRequestHandler.download Geloescht: ${pathname}`)
            }
            res.sendFile(pathname, (err: any) => unlink(pathname, unlinkCb))
        }
        const cbSendErr = (statuscode: number) => res.sendStatus(statuscode)

        try {
            this.buchMultimediaService.findMedia(id, cbSendFile, cbSendErr)
        } catch (err) {
            logger.error(`BuchRequestHandler.download Error: ${inspect(err)}`)
            res.sendStatus(500)
        }
    }

    toString() {
        return 'BuchRequestHandler'
    }

    private toJsonPayload(buch: mongoose.Document): any {
        // Warum funktioniert "delete" von Properties nicht bei Mongoose-Dokumenten?
        // https://lodash.com/docs
        // _.omit gibt es nicht mehr ab lodash 5
        // https://github.com/lodash/lodash/issues/2930
        return _.pick(buch, [
            'titel',
            'rating',
            'art',
            'verlag',
            'preis',
            'rabatt',
            'lieferbar',
            'datum',
            'email',
            'schlagwoerter',
            'autoren',
        ])
    }
}
const handler = new BuchRequestHandler()

// -----------------------------------------------------------------------
// E x p o r t i e r t e   F u n c t i o n s
// -----------------------------------------------------------------------
export const findById = (req: Request, res: Response, next: NextFunction) =>
    handler.findById(req, res, next)
export const find = (req: Request, res: Response, next: NextFunction) =>
    handler.find(req, res, next)
export const create = (req: Request, res: Response, next: NextFunction) =>
    handler.create(req, res, next)
export const update = (req: Request, res: Response, next: NextFunction) =>
    handler.update(req, res, next)
export const deleteFn = (req: Request, res: Response, next: NextFunction) =>
    handler.delete(req, res, next)
export const upload = (req: Request, res: Response, next: NextFunction) =>
    handler.upload(req, res, next)
export const download = (req: Request, res: Response, next: NextFunction) =>
    handler.download(req, res)
