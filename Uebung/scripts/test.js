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

/* global require */

const shell = require('shelljs')

// const fulltrace = ''
const fulltrace = '--full-trace'
// const tracewarnings = ''
const tracewarnings = '--trace-warnings'

const chaiShould = '-r chai/register-should'

// const report = 'spec'
const report = 'mocha-allure-reporter'
// const report = 'mocha-allure-reporter'

shell.exec(
    'node_modules\\.bin\\mocha -c --check-leaks --throw-deprecation ' +
    `--use_strict ${fulltrace} ${tracewarnings} --exit ` +
    `${chaiShould} -R ${report} dist\\buch\\rest\\index.spec.js`)

