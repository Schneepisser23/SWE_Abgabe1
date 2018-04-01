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

export const JWT_CONFIG = {
    typ: 'JWT',

    // HMAC = Keyed-Hash MAC (= Message Authentication Code)
    // HS256 = HMAC mit SHA-256
    // Bei SHA-3 ist HMAC nicht mehr notwendig.
    // SHA-3 ist bei bei den Algorithmen fuer JWT *NICHT* aufgelistet:
    // https://tools.ietf.org/html/rfc7518
    // alg: 'HS256',

    // RSA = Ron Rivest, Adi Shamir, Leonard Adleman
    // RS256 = RSA mit SHA-256
    // Google verwendet RS256
    alg: 'RS256',

    // ECDSA = Elliptic Curve Digital Signature Algorithm
    // ECDSA hat bei gleicher Sicherheit deutlich kuerzere Schluessel, benoetigt
    // aber mehr Rechenleistung. Die Schluessel werden *nicht* uebertragen!
    // http://jwt.io kann nur HS256 und RS256
    // alg: 'ES384',

    // RSASSA-PSS wird durch jws nicht unterstuetzt
    // https://github.com/brianloveswords/node-jws/issues/47

    encoding: 'utf8',
    // ggf. als DN (= distinguished name) gemaess LDAP
    issuer: 'https://hska.de/shop/JuergenZimmermann',
    secret: 'p',
    expiration: 24 * 60 * 60,  // 1 Tag in Sek.
    bearer: 'Bearer',
}
