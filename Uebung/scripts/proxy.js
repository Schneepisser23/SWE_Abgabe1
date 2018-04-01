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

// @ts-check
/* global require, process, console */
/* eslint no-magic-numbers: 0 */
/* eslint no-console: 0 */

const inquirer = require('inquirer')
const minimist = require('minimist')
const shell = require('shelljs')

const host = 'proxy.hs-karlsruhe.de'
// const host = 'localhost'

const port = 8888

const argv = minimist(process.argv.slice(0))
const values = argv._

const on = () => {
    console.log('Proxy einschalten:')
    const questions = [
        {
            message: 'Username: ',
            name: 'username',
        },
        {
            message: 'Password: ',
            name: 'password',
            type: 'password',
        },
    ]
    const setProxy = answers => {
        const {username, password} = answers
        const proxyUrl = `http://${username}:${password}@${host}:${port}`
        shell.exec(
            `npm c set proxy ${proxyUrl} &&` +
            `npm c set https-proxy ${proxyUrl} && ` +
            `git config --global http.proxy ${proxyUrl} && ` +
            `git config --global https.proxy ${proxyUrl} && ` +
            'git config --global url."http://".insteadOf git://')
    }
    inquirer.prompt(questions).then(setProxy)
}

const off = () => {
    console.log('Proxy ausschalten')
    shell.exec(
        'npm c delete proxy && ' +
        'npm c delete https-proxy && ' +
        'git config --global --unset http.proxy && ' +
        'git config --global --unset https.proxy && ' +
        'git config --global --unset url."http://".insteadOf')
}

switch (values[2]) {
case 'on':
    on()
    break
case 'off':
    off()
    break
default:
    on()
}
