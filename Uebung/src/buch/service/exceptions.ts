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

import {logger} from '../../shared'

// http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript#answer-5251506
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Error
// tslint:disable:max-classes-per-file

export class ValidationError implements Error {
    name = 'ValidationError'

    constructor(public message: string) {
        logger.debug(`ValidationError.constructor(): ${message}`)
    }
}

export class TitelExistsError implements Error {
    name = 'TitelExistsError'

    constructor(public message: string) {
        logger.debug(`TitelExistsError.constructor(): ${message}`)
    }
}

export class VersionInvalidError implements Error {
    name = 'VersionInvalidError'

    constructor(public message: string) {
        logger.debug(`VersionInvalidError.constructor(): ${message}`)
    }
}
