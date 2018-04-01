// tslint:disable:no-unused-expression max-file-line-count

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

// Monatl. Downloads:
//      Mocha   4,4 Mio
//      Tape    0,9 Mio
//      jest    0,5 Mio    von Facebook
//
//      Chai    2,9 Mio
//      Expect  2,0 Mio    (Teil von jest, s.o.)
//      Should  1,1 Mio

import * as chai from 'chai'
import * as request from 'supertest'

import {app, PATHS} from '../../app'
import {connectDB, logger, SERVER_CONFIG} from '../../shared'

// tslint:disable-next-line:no-require-imports no-var-requires
const chaiString = require('chai-string')
chai.use(chaiString)

// -----------------------------------------------------------------------------
// T e s t s e r v e r   m i t   H T T P   u n d   R a n d o m   P o r t
// -----------------------------------------------------------------------------
const {host} = SERVER_CONFIG

connectDB()
const server = app.listen(0, host, () => {
    logger.info(`Node ${process.version}`)
    logger.info(
        `Testserver ist gestartet: http://${host}:${server.address().port}`)
    server.emit('testServerStarted')
})

// Auf den Start des Testservers warten
before((done: any) => server.on('testServerStarted', () => done()))

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const idGetVorhanden = '00000000-0000-0000-0000-000000000001'
const idNichtVorhanden = '00000000-0000-0000-0000-000000000999'

const neuesBuch: object = {
    titel: 'Neu',
    rating: 1,
    art: 'DRUCKAUSGABE',
    verlag: 'HSKA_VERLAG',
    preis: 99.99,
    rabatt: 0.099,
    lieferbar: true,
    datum: '2016-02-28',
    email: 'theo@test.de',
    homepage: 'https://test.de/',
    schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
    autoren: [{nachname: 'Test', vorname: 'Theo'}],
}
const neuesBuchInvalid: object = {
    titel: 'Blabla',
    rating: -1,
    art: 'UNSICHTBAR',
    verlag: 'NO_VERLAG',
    preis: 0,
    rabatt: 0,
    lieferbar: true,
    datum: '2016-02-01',
    email: 'fromNowhere',
    autoren: [{nachname: 'Test', vorname: 'Theo'}],
    schlagwoerter: [],
}
const neuesBuchTitelExistiert: object = {
    titel: 'Alpha',
    rating: 1,
    art: 'DRUCKAUSGABE',
    verlag: 'HSKA_VERLAG',
    preis: 99.99,
    rabatt: 0.099,
    lieferbar: true,
    datum: '2016-02-28',
    email: 'theo@test.de',
    autoren: [{nachname: 'Test', vorname: 'Theo'}],
    schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
}

const geaendertesBuch: object = {
    titel: 'Geaendert',
    rating: 1,
    art: 'DRUCKAUSGABE',
    verlag: 'HSKA_VERLAG',
    preis: 33.33,
    rabatt: 0.033,
    lieferbar: true,
    datum: '2016-02-03',
    homepage: 'https://test.te',
    autoren: [{nachname: 'Gamma', vorname: 'Claus'}],
    schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
}
const idPutVorhanden = `00000000-0000-0000-0000-000000000003`

const geaendertesBuchIdNichtVorhanden: object = {
    titel: 'Nichtvorhanden',
    rating: 1,
    art: 'DRUCKAUSGABE',
    verlag: 'HSKA_VERLAG',
    preis: 33.33,
    rabatt: 0.033,
    lieferbar: true,
    datum: '2016-02-03',
    autoren: [{nachname: 'Gamma', vorname: 'Claus'}],
    schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
}
const idPutNichtVorhanden = `00000000-0000-0000-0000-000000000999`

const geaendertesBuchInvalid: object = {
    titel: 'Alpha',
    rating: -1,
    art: 'UNSICHTBAR',
    verlag: 'NO_VERLAG',
    preis: 0.01,
    rabatt: 0,
    lieferbar: true,
    datum: '2016-02-01',
    email: 'fromNowhere',
    autoren: [{nachname: 'Test', vorname: 'Theo'}],
    schlagwoerter: [],
}

const idDeleteVorhanden = '00000000-0000-0000-0000-000000000005'

const loginDaten: object = {
    username: 'admin',
    password: 'p',
}

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------

// JWT fuer Authentifizierung
let token: string

const path = PATHS.buecher
const loginPath = PATHS.login

// Test-Suite
describe('GET /buecher', () =>
    it('Alle Buecher', (done: any) => {
        request(server)
            .get(path)
            // Assertion = Expectation
            .expect(200)
            .expect('Content-Type', /json/)
            // Promise
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                // response.body ist ein JSON-Array mit mind. 1 JSON-Objekt
                response.body.should.be.not.empty
                done()
            })
    }))

describe('GET /buecher/:id', () => {
    it('Buch zu vorhandener ID', (done: any) => {
        request(server)
            .get(`${path}/${idGetVorhanden}`)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                // response.body enthaelt ein JSON-Objekt mit Atom-Links
                const selfLink = response.body._links.self.href
                // http://chaijs.com/plugins/chai-string
                selfLink.should.endWith(idGetVorhanden)
                done()
            })
    })

    it('Kein Buch zu nicht-vorhandener ID', (done: any) => {
        request(server)
            .get(`${path}/${idNichtVorhanden}`)
            .expect(404)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })
})

describe('GET /buecher?...', () => {
    it('Buecher mit einem Titel, der ein "a" enthaelt', (done: any) => {
        request(server)
            .get(`${path}?titel=a`)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }

                const {body} = response
                // response.body ist ein JSON-Array mit mind. 1 JSON-Objekt
                body.should.be.not.empty

                // Jedes Buch hat einen Titel mit dem Teilstring 'a'
                body.map((buch: any) => buch.titel)
                    .forEach((titel: string) => titel.should.contain('a'))
                done()
            })
    })

    it('Keine Buecher mit einem Titel, der "XX" enthaelt', (done: any) => {
        request(server)
            .get(`${path}?titel=XX`)
            .expect(404)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })

    it('Mind. 1 Buch mit dem Schlagwort "javascript"', (done: any) => {
        const schlagwort = 'javascript'

        request(server)
            .get(`${path}?${schlagwort}=true`)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                const {body} = response

                // response.body ist ein JSON-Array mit mind. 1 JSON-Objekt
                body.should.be.not.empty

                // Jedes Buch hat im Array der Schlagwoerter "javascript"
                body.map((buch: any) => buch.schlagwoerter)
                    .forEach(
                        (s: Array<string>) =>
                            s.should.contain(`${schlagwort.toUpperCase()}`))
                done()
            })
    })

    it('Keine Buecher mit dem Schlagwort "csharp"', (done: any) => {
        request(server)
            .get(`${path}?csharp=true`)
            .expect(404)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })
})

describe('POST /buecher', () => {
    // before(): 1-malige Ausfuehrung vor allen Tests
    // beforeEach(): Ausfuehrung vor jedem einzelnen Test
    // analog: after() und afterEach()

    // Einmaliges Einloggen, um den Authentifizierungs-Token zu erhalten
    before((done: any) => {
        request(server)
            .post(`${loginPath}`)
            .set('Content-type', `application/x-www-form-urlencoded`)
            .send(loginDaten)
            .expect(200)
            // Promise
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                token = response.body.token
                token.should.be.not.empty
                // synchroner Before-Hook
                done()
            })
    })

    it('Neues Buch', (done: any) => {
        request(server)
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(neuesBuch)
            .expect(201)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }

                const {location} = response.header
                location.should.be.not.empty

                // UUID: Muster von HEX-Ziffern
                const indexLastSlash = location.lastIndexOf('/')
                const idStr = location.substring(indexLastSlash + 1)
                idStr.should.match(/[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{12}/)
                done()
            })
    })

    it('Neues Buch mit ungueltigen Daten', (done: any) => {
        request(server)
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(neuesBuchInvalid)
            .expect(400)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }

                const {body} = response
                body.art.should.be.equal('Die Art eines Buches muss KINDLE oder DRUCKAUSGABE sein.')
                body.rating.should.endWith('ist keine gueltige Bewertung.')
                body.verlag.should.be.equal('Der Verlag eines Buches muss IWI_VERLAG oder HSKA_VERLAG sein.')
                body.email.should.endWith('ist keine gueltige Email-Adresse.')
                done()
            })
    })

    it('Neues Buch, aber der Titel existiert bereits', (done: any) => {
        request(server)
            .post(path)
            .set('Authorization', `Bearer ${token}`)
            .send(neuesBuchTitelExistiert)
            .expect(400)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.text.should.contain('Titel')
                done()
            })
    })

    it('Neues Buch, aber ohne Token', (done: any) => {
        request(server)
            .post(path)
            .send(neuesBuch)
            .expect(401)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })

    it('Neues Buch, aber mit falschem Token', (done: any) => {
        request(server)
            .post(path)
            .set('Authorization', 'Bearer x')
            .send(neuesBuch)
            .expect(401)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })
})

describe('PUT /buecher/:id', () => {
    before((done: any) => {
        request(server)
            .post(`${loginPath}`)
            .set('Content-type', `application/x-www-form-urlencoded`)
            .send(loginDaten)
            .expect(200)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                token = response.body.token
                token.should.be.not.empty
                done()
            })
    })

    it('Vorhandenes Buch aendern', (done: any) => {
        request(server)
            .put(`${path}/${idPutVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .set('If-Match', '0')
            .send(geaendertesBuch)
            .expect(204)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })

    it('Nicht-vorhandenes Buch aendern', (done: any) => {
        request(server)
            .put(`${path}/${idPutNichtVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .set('If-Match', '0')
            .send(geaendertesBuchIdNichtVorhanden)
            .expect(412)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                done()
            })
    })

    it('Vorhandenes Buch aendern, aber mit ungueltigen Daten', (done: any) => {
        request(server)
            .put(`${path}/${idPutVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .set('If-Match', '0')
            .send(geaendertesBuchInvalid)
            .expect(400)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                const {body} = response
                body.art.should.be.equal('Die Art eines Buches muss KINDLE oder DRUCKAUSGABE sein.')
                body.rating.should.endWith('ist keine gueltige Bewertung.')
                body.verlag.should.be.equal('Der Verlag eines Buches muss IWI_VERLAG oder HSKA_VERLAG sein.')
                body.email.should.endWith('ist keine gueltige Email-Adresse.')
                done()
            })
    })

    it('Vorhandenes Buch aendern, aber ohne Token', (done: any) => {
        request(server)
            .put(`${path}/${idPutVorhanden}`)
            .set('If-Match', '0')
            .send(geaendertesBuch)
            .expect(401)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })

    it('Vorhandenes Buch aendern, aber mit falschem Token', (done: any) => {
        request(server)
            .put(`${path}/${idPutVorhanden}`)
            .set('Authorization', 'Bearer x')
            .set('If-Match', '0')
            .send(geaendertesBuch)
            .expect(401)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })
})

describe('DELETE /buecher', () => {
    before((done: any) => {
        request(server)
            .post(`${loginPath}`)
            .set('Content-type', `application/x-www-form-urlencoded`)
            .send(loginDaten)
            .expect(200)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                token = response.body.token
                token.should.be.not.empty
                done()
            })
    })

    it('Vorhandenes Buch loeschen', (done: any) => {
        request(server)
            .delete(`${path}/${idDeleteVorhanden}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })

    it('Buch loeschen, aber ohne Token', (done: any) => {
        request(server)
            .delete(`${path}/${idDeleteVorhanden}`)
            .expect(401)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })

    it('Buch loeschen, aber mit falschem Token', (done: any) => {
        request(server)
            .delete(`${path}/${idDeleteVorhanden}`)
            .set('Authorization', 'Bearer x')
            .expect(401)
            .end((error, response) => {
                if (error) {
                    return done(error)
                }
                response.body.should.be.empty
                done()
            })
    })
})
