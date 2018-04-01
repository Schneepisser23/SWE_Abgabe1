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

// https://nodejs.org/api/fs.html
// https://github.com/nodejs/node/blob/master/lib/buffer.js#L191
// Einzulesende oder zu schreibende Dateien im Format UTF-8
import {readFileSync} from 'fs'
import {join} from 'path'

import {log, logger} from '../../shared'

export class RolesService {
    private static ROLES: Array<string> = JSON.parse(
        readFileSync(join(__dirname, 'json', 'roles.json'), 'utf-8'))

    @log
    findAllRoles() {
        return RolesService.ROLES
    }

    @log
    getNormalizedRoles(roles: Array<string>) {
        if (roles === undefined || roles.length === 0) {
            logger.debug('roles: undefined || []')
            return undefined
        }

        const normalizedRoles =
            roles.filter(r => this.getNormalizedRole(r) !== undefined)
        return normalizedRoles.length === 0 ? undefined : normalizedRoles
    }

    toString() {
        return 'RolesService'
    }

    @log
    private getNormalizedRole(role: string) {
        if (role === undefined) {
            return undefined
        }

        // Falls der Rollenname in Grossbuchstaben geschrieben ist, wird er
        // trotzdem gefunden
        return this.findAllRoles()
                   .find(r => r.toLowerCase() === role.toLowerCase())
    }
}
