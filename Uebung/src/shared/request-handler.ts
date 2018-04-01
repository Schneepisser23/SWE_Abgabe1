/*
 * Copyright (C) 2016 Juergen Zimmermann, Hochschule Karlsruhe
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
import * as validator from 'validator'

import {log} from './log'
import {logger} from './logger'

class SharedRequestHandler {
    @log
    logRequestHeader(req: Request, res: Response, next: NextFunction) {
        logger.debug(
            `Request: headers=${JSON.stringify(req.headers, undefined, 2)}`)
        logger.debug(
            `Request: protocol=${JSON.stringify(req.protocol, undefined, 2)}`)
        logger.debug(
            `Request: hostname=${JSON.stringify(req.hostname, undefined, 2)}`)
        if (req.body !== undefined) {
            logger.debug(
                `Request: body=${JSON.stringify(req.body, undefined, 2)}`)
        }
        Object.keys(req).forEach(key => {
            if (req.hasOwnProperty(key)) {
                logger.log('silly', `Request-Key: ${key}`)
            }
        })

        // Request-Verarbeitung fortsetzen
        next()
    }

    @log
    validateUUID(req: Request, res: Response, next: NextFunction, id: any) {
        if (!validator.isUUID(id)) {
            logger.debug('status = 400')
            res.status(400).send(`${id} ist keine gueltige Buch-ID`)
            return
        }

        next()
    }

    @log
    validateMime(req: Request, res: Response, next: NextFunction) {
        const mimeType = req.header('Content-Type')
        // @ts-ignore isMimeType ist nicht in @types/validator deklariert
        if (!validator.isMimeType(mimeType)) {
            logger.debug('status = 400')
            res.status(400).send(`${mimeType} ist kein gueltiger MIME-Typ`)
            return
        }

        next()
    }

    @log
    notFound(req: Request, res: Response) {
        res.sendStatus(404)
    }

    @log
    internalError(err: any, req: Request, res: Response, next: NextFunction) {
        // tslint:disable-next-line:no-null-keyword
        logger.error(JSON.stringify(err, null, 2))
        res.sendStatus(500)
    }

    @log
    notYetImplemented(req: Request, res: Response) {
        logger.error('NOT YET IMPLEMENTED')
        res.sendStatus(501)
    }

    toString() {
        return 'SharedRequestHandler'
    }
}
const handler = new SharedRequestHandler()

// -----------------------------------------------------------------------
// E x p o r t i e r t e   F u n c t i o n s
// -----------------------------------------------------------------------
export const logRequestHeader = (
    req: Request, res: Response, next: NextFunction) =>
    handler.logRequestHeader(req, res, next)

export const validateMime = (
    req: Request, res: Response, next: NextFunction) =>
    handler.validateMime(req, res, next)

export const validateUUID = (
    req: Request, res: Response, next: NextFunction, id: any) =>
    handler.validateUUID(req, res, next, id)

export const notFound = (req: Request, res: Response) =>
    handler.notFound(req, res)

export const internalError = (
    err: any, req: Request, res: Response, next: NextFunction) =>
    handler.internalError(err, req, res, next)

export const notYetImplemented = (req: Request, res: Response) =>
    handler.notYetImplemented(req, res)

// https://github.com/expressjs/express/issues/2259
// https://github.com/expressjs/express/pull/2431
// https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators
export const wrap = (fn: any) => (...args: Array<any>) =>
    fn(...args).catch(args[2])
