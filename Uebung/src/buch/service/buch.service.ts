// tslint:disable:no-null-keyword

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

import {Document} from 'mongoose'
import * as uuid from 'uuid/v4'

import {log, logger, sendMail} from '../../shared'
import {Buch, validateBuch} from '../model/buch'

import {TitelExistsError, ValidationError, VersionInvalidError} from './exceptions'

// API-Dokumentation zu mongoose:
// http://mongoosejs.com/docs/api.html
// https://github.com/Automattic/mongoose/issues/3949

export class BuchService {
    // Status eines Promise:
    // Pending: das Resultat gibt es noch nicht, weil die asynchrone Operation,
    //          die das Resultat liefert, noch nicht abgeschlossen ist
    // Fulfilled: die asynchrone Operation ist abgeschlossen und
    //            das Promise-Objekt hat einen Wert
    // Rejected: die asynchrone Operation ist fehlgeschlagen and das
    //           Promise-Objekt wird nicht den Status "fulfilled" erreichen.
    //           Stattdessen ist im Promise-Objekt die Fehlerursache enthalten.

    @log
    async findById(id: string) {
        // ein Buch zur gegebenen ID asynchron suchen
        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        // null falls nicht gefunden
        return Buch.findById(id)
    }

    @log
    async find(query?: any) {
        const tmpQuery = Buch.find()

        // alle Buecher asynchron suchen u. aufsteigend nach titel sortieren
        // nach _id sortieren: Timestamp des INSERTs (Basis: Sek)
        // https://docs.mongodb.org/manual/reference/object-id
        if (Object.keys(query).length === 0) {
            return tmpQuery.sort('titel')
        }

        // Buecher zur Query (= JSON-Objekt durch Express) asynchron suchen
        let titelQuery: object|undefined
        const titel: string = query.titel
        if (titel !== undefined) {
            // Titel in der Query: Teilstring des Titels,
            // d.h. "LIKE" als regulaerer Ausdruck
            // 'i': keine Unterscheidung zw. Gross- u. Kleinschreibung
            delete query.titel
            titelQuery = {titel: new RegExp(titel, 'i')}
        }

        // z.B. {javascript: true, typescript: true}
        let javascriptQuery: object|undefined
        if (query.javascript === 'true') {
            delete query.javascript
            javascriptQuery = {schlagwoerter: 'JAVASCRIPT'}
        }
        let typescriptQuery: object|undefined
        if (query.typescript === 'true') {
            delete query.typescript
            typescriptQuery = {schlagwoerter: 'TYPESCRIPT'}
        }
        let schlagwoerterQuery: object|undefined
        if (javascriptQuery !== undefined && typescriptQuery !== undefined) {
            schlagwoerterQuery = {schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT']}
            // OR statt AND
            // schlagwoerterQuery = {$or: [jsQuery, tsQuery]}
        } else if (javascriptQuery !== undefined) {
            schlagwoerterQuery = javascriptQuery
        } else if (typescriptQuery !== undefined) {
            schlagwoerterQuery = typescriptQuery
        }

        if (titelQuery !== undefined && schlagwoerterQuery !== undefined) {
            return tmpQuery.and([query, titelQuery, schlagwoerterQuery])
        }
        if (titelQuery !== undefined) {
            return tmpQuery.and([query, titelQuery])
        }
        if (schlagwoerterQuery !== undefined) {
            return tmpQuery.and([query, schlagwoerterQuery])
        }

        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        // leeres Array, falls nichts gefunden wird
        return Buch.find(query)
        // Buch.findOne(query), falls das Suchkriterium eindeutig ist
        // bei findOne(query) wird null zurueckgeliefert, falls nichts gefunden
    }

    @log
    async create(buch: Document) {
        // Das gegebene Buch innerhalb von save() asynchron neu anlegen:
        // Promise.reject(err) bei Verletzung von DB-Constraints, z.B. unique
        const titel: string = (buch as any).titel

        const err = validateBuch(buch)
        if (err !== undefined) {
            const message = JSON.stringify(err)
            logger.debug(`Validation Message: ${message}`)
            // Promise<void> als Rueckgabewert
            return Promise.reject(new ValidationError(message))
        }

        // Pattern "Active Record" (urspruengl. von Ruby-on-Rails)
        const tmp = await Buch.findOne({titel})
        if (tmp !== null) {
            // Promise<void> als Rueckgabewert
            return Promise.reject(new TitelExistsError(
                `Der Titel "${titel}" existiert bereits.`))
        }

        buch._id = uuid()
        const buchSaved = await buch.save()
        logger.debug(`Das Buch ist abgespeichert: ${JSON.stringify(buchSaved)}`)

        const to = 'joe@doe.mail'
        const subject = `Neues Buch ${buchSaved._id}`
        const body =
            `Das Buch mit dem Titel <strong>${(buchSaved as any).titel}` +
            '</strong> ist angelegt'
        logger.debug(`sendMail wird aufgerufen: ${to} / ${subject} / ${body}`)
        sendMail(to, subject, body)

        return buchSaved
    }

    @log
    async update(buch: Document, versionStr: string|undefined) {
        if (versionStr === undefined) {
            return Promise.reject(new VersionInvalidError('Die Versionsnummer fehlt'))
        }
        const version = Number.parseInt(versionStr)
        if (Number.isNaN(version)) {
            return Promise.reject(new VersionInvalidError('Die Versionsnummer ist ungueltig'))
        }

        const err = validateBuch(buch)
        if (err !== undefined) {
            const message = JSON.stringify(err)
            logger.debug(`Validation Message: ${message}`)
            // Promise<void> als Rueckgabewert
            return Promise.reject(new ValidationError(message))
        }

        const titel: string = (buch as any).titel
        const tmp = await Buch.findOne({titel})
        if (tmp !== null && tmp._id !== buch._id) {
            return Promise.reject(new TitelExistsError(
                `Der Titel "${titel}" existiert bereits bei ${tmp._id}.`))
        }

        logger.debug(`buch: ${JSON.stringify(buch)} / version: ${version}`)
        const query = Buch.find().and([{_id: buch._id}, {__v: {$gte: version}}])
        const result = await Buch.findOneAndUpdate(query, buch)
        if (result === null) {
            return Promise.reject(new VersionInvalidError(
                `Es gibt kein Buch mit ID ${buch._id} und Version ${version}`))
        }

        // Weitere Methoden von mongoose zum Aktualisieren:
        //    Buch.findByIdAndUpdate(update)
        //    buch.update(bedingung)
        return
    }

    @log
    async remove(id: string) {
        // Das Buch zur gegebenen ID asynchron loeschen
        const buchPromise = Buch.findByIdAndRemove(id)
        // entspricht: findOneAndRemove({_id: id})

        // Ohne then (oder Callback) wird nicht geloescht,
        // sondern ein Query-Objekt zurueckgeliefert
        buchPromise.then(
            buch => logger.debug(`Geloescht: ${JSON.stringify(buch)}`))

        // Weitere Methoden von mongoose, um zu loeschen:
        //    Buch.findOneAndRemove(bedingung)
        //    Buch.remove(bedingung)
    }

    toString() {
        return 'BuchService'
    }
}
