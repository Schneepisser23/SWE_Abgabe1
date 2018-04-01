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

import {log} from '../../shared'

export class UsersService {
    private static USERS = JSON.parse(
        readFileSync(join(__dirname, 'json', 'users.json'), 'utf-8'))

    @log
    findByUsername(username: string) {
        return UsersService.USERS.find((u: any) => u.username === username)
    }

    @log
    findById(id: string) {
        return UsersService.USERS.find((u: any) => u._id === id)
    }

    @log
    findByEmail(email: string) {
        return UsersService.USERS.find((u: any) => u.email === email)
    }

    toString() {
        return 'UsersService'
    }
}
