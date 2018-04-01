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

import * as helmet from 'helmet'

export const helmetHandlers = [
    // https://blog.appcanary.com/2017/http-security-headers.html
    // CSP = Content Security Policy
    //   https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
    //   https://tools.ietf.org/html/rfc7762
    helmet.contentSecurityPolicy(
        {directives: {
            defaultSrc: ['https: \'self\''],
            // fuer Chrome mit dem Add-on JSONView
            styleSrc: ['https: \'unsafe-inline\''],
            // fuer GraphQL IDE => GraphiQL
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
            scriptSrc: ['https: \'unsafe-inline\' \'unsafe-eval\''],
            // fuer GraphQL IDE => GraphiQL
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src
            imgSrc: ['data:'],
        }}),
    // XSS = Cross-site scripting attacks: Header X-XSS-Protection
    //   https://www.owasp.org/index.php/Cross-site_scripting
    helmet.xssFilter(),
    // Clickjacking
    //   https://www.owasp.org/index.php/Clickjacking
    //   http://tools.ietf.org/html/rfc7034
    helmet.frameguard(),
    // HSTS = HTTP Strict Transport Security:
    //   Header Strict-Transport-Security
    //   https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
    //   https://tools.ietf.org/html/rfc6797
    helmet.hsts(),
    // MIME-sniffing: im Header X-Content-Type-Options
    //   https://blogs.msdn.microsoft.com/ie/2008/09/02/ie8-security-part-vi-beta-2-update
    //   http://msdn.microsoft.com/en-us/library/gg622941%28v=vs.85%29.aspx
    //   https://tools.ietf.org/html/rfc7034
    helmet.noSniff(),
    // Im Header "Cache-Control" and "Pragma" auf No Caching setzen
    helmet.noCache(),
    // HPKP = HTTP Public Key Pinning: im Header Public-Key-Pins
    //   https://www.owasp.org/index.php/Certificate_and_Public_Key_Pinning
    //   https://developer.mozilla.org/en-US/docs/Web/Security/Public_Key_Pinning
    //   https://tools.ietf.org/html/rfc7469
    helmet.hpkp({
        // 60 Tage in Sek.
        maxAge: 60 * 24 * 60 * 60,
        sha256s: [
            '4pBbUlCXuWGDP0rkk1P8hxQlHTc6kFlBjCIofCbAZ4w=',
            'IrlsJtgPtWm8H5FaQB8PeeZ5VQH3Z0oamMQoFsGQ5Bc=',
        ],
    }),
]
