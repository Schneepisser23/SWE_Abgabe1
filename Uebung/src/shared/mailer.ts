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

import {createTransport, SendMailOptions, SentMessageInfo, Transporter} from 'nodemailer'

import {MAIL_CONFIG} from './config'
import {logger} from './logger'

const transporter: Transporter = createTransport(MAIL_CONFIG.transport)

export const sendMail =
    async (to: string|Array<string>, subject: string, body: string) => {
    const {from} = MAIL_CONFIG
    const data: SendMailOptions = {from, to, subject, html: body}
    logger.debug(`sendMail(): ${JSON.stringify(data)}`)

    const sendMailCb = (err: Error | null, info: SentMessageInfo) => {
        if (err !== null) {
            logger.warn(JSON.stringify(err))
            return
        }

        logger.debug(`Email verschickt: ${info.response}`)
    }
    transporter.sendMail(data, sendMailCb)
}
