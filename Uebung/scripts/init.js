/*
 * Copyright (C) 2017 - 2018 Juergen Zimmermann, Hochschule Karlsruhe
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
/* global require */

const path = require('path')
const fs = require('fs-extra')

const {dir} = require('./shared')

const {src, config, dist} = dir

/* eslint-disable no-console */
// JSON-Dateien kopieren
const jsonSrc = path.join(src, 'auth', 'service', 'json')
const jsonDist = path.join(dist, 'auth', 'service', 'json')
fs.copy(jsonSrc, jsonDist, err => {
    if (err) {
        return console.error(err)
    }
})

// PEM-Dateien fuer JWT kopieren
const jwtPemSrc = path.join(src, 'auth', 'service', 'jwt')
const jwtPemDist = path.join(dist, 'auth', 'service', 'jwt')
fs.copy(jwtPemSrc, jwtPemDist, err => {
    if (err) {
        return console.error(err)
    }
})

// PEM- und Zertifikatdateien fuer HTTPS kopieren
const httpsSrc = path.join(config, 'https')
const httpsDist = path.join(dist, 'shared', 'config')
fs.copy(httpsSrc, httpsDist, err => {
    if (err) {
        return console.error(err)
    }
})

// Konfig-Dateien fuer Nodemon kopieren
const nodemonSrc = path.join(config, 'nodemon')
fs.copy(nodemonSrc, dist, err => {
    if (err) {
        return console.error(err)
    }
})
