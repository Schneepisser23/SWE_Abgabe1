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

export const MAIL_CONFIG = {
    from: '"Joe Doe" <nnvv0011@hs-karlsruhe.de>',
    transport: {
        host: '127.0.0.1',
        port: 25000,

        // HS Karlsruhe:
        // port: 25,
        // host: 'smtp.hs-karlsruhe.de',
        secure: false,

        // Googlemail:
        // service: 'gmail',
        // auth: {
        //     user: 'user@gmail.com',
        //     pass: 'mypassword'
        // }

        priority: 'normal',
        logger: true,
        headers: {'X-ProvidedBy': 'Software Engineering'},
    },
}
