/*
 * Copyright (C) 2015 - 2016 Juergen Zimmermann, Hochschule Karlsruhe
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

// https://nodejs.org/api/fs.html
import {readFile} from 'fs'
import {IncomingMessage, ServerResponse} from 'http'
import {promisify} from 'util'

import {logger} from './logger'

/**
 * Abfrage, ob ein Objekt ein String ist.
 */
export const isString = (obj: any) => typeof obj === 'string'

/**
 * Asynchrone Function readFile von Node.js erfordert ein Callback und wird
 * in ein Promise gekapselt, damit spaeter async/await verwendet werden kann.
 */
export const readFileAsync = promisify(readFile)

export const responseTimeFn: (req: IncomingMessage, res: ServerResponse, time: number) => void =
    (req, res, time) => logger.debug(`Response time: ${time} ms`)
