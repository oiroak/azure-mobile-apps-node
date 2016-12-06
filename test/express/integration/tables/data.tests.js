// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').use(require('chai-subset')).expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../../appFactory'),
    data = require('../../../../src/data'),

    app, mobileApp;

describe('azure-mobile-apps.express.integration.tables.data', function () {
    beforeEach(function (done) {
        data(mobileApps.configuration())({
            name: 'integration',
            columns: { string: 'string', number: 'number', bool: 'boolean' },
            softDelete: true
        }).initialize().then(done);
    });

    afterEach(mobileApps.cleanUp(mobileApps.configuration()).testTable({ name: 'integration' }));

    beforeEach(function () {
        app = express();
        mobileApp = mobileApps();
    });

    it('returns inserted records', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test", bool: true, number: 1 })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .get('/tables/integration')
                    .expect(200);
            })
            .then(function (res) {
                expect(res.body).to.containSubset([{ id: '1', string: "test", bool: true, number: 1 }]);
            });
    });

    it('returns updated records', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test" })
            .then(function (res) {
                return supertest(app)
                    .patch('/tables/integration')
                    .send({ id: 1, string: "test2", bool: true, number: 1 })
            })
            .then(function (res) {
                return supertest(app).get('/tables/integration');
            })
            .then(function (res) {
                expect(res.body).to.containSubset([{ id: '1', string: "test2", bool: true, number: 1 }]);
            });
    });

    it('does not return deleted records', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test" })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .delete('/tables/integration/1')
                    .expect(200);
            })
            .then(function (res) {
                return supertest(app).get('/tables/integration');
            })
            .then(function (res) {
                expect(res.body).to.deep.equal([]);
            });
    });

    it('returns inserted item', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test", bool: true, number: 1 })
            .expect(201)
            .then(function (res) {
                expect(res.body).to.containSubset({ id: '1', string: "test", bool: true, number: 1 });
            });
    });

    it('returns empty array when table with dynamic schema has not been created', function () {
        mobileApp.tables.add('nonexistent');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/nonexistent')
            .expect(200)
            .then(function (res) {
                expect(res.body).to.deep.equal([]);
            });
    });

    it('returns empty array when table with dynamic schema has not been updated', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test" })
            .then(function (res) {
                return supertest(app)
                    .get('/tables/integration?$filter=newCol eq 1')
                    .expect(200);
            })
            .then(function (res) {
                expect(res.body).to.deep.equal([]);
            });
    });

    it('assigns guid id if none is provided and table does not have an autoIncrement id', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ string: "test", bool: true, number: 1 })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .get('/tables/integration')
                    .expect(200);
            })
            .then(function (res) {
                expect(res.body.length).to.equal(1);
                expect(res.body[0].id).to.not.be.undefined;
            });
    });

    it('returns single object for id query', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test", bool: true, number: 1 })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .get('/tables/integration/1')
                    .expect(200);
            })
            .then(function (res) {
                expect(res.body).to.containSubset({ id: '1', string: "test", bool: true, number: 1 });
            });
    });

    it('returns empty array when collection query returns no results', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/integration?$filter=id eq 100')
            .expect(200)
            .then(function (res) {
                expect(res.body).to.deep.equal([]);
            });
    });

    it('returns 404 when id query returns no results', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/integration/nonexistent')
            .expect(404);
    });

    it('returns 404 when delete operation executed for non-existent record', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .delete('/tables/integration/nonexistent')
            .expect(404);
    });

    it('returns 400 for inserted system properties', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test", createdAt: 'val' })
            .expect(400);
    });

    it('returns 400 for updated system properties', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test" })
            .then(function (res) {
                return supertest(app)
                    .patch('/tables/integration')
                    .send({ id: 1, string: "test2", bool: true, createdAt: 'val'})
                    .expect(400);
            });
    });

    it('returns 200 when delete operation executed successfully', function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test", bool: true, number: 1 })
            .expect(201)
            .then(function (res) {
                return supertest(app)
                    .delete('/tables/integration/1')
                    .expect(200);
            });
    });

    it("returns total count when requested", function () {
        mobileApp.tables.add('integration');
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test", bool: true, number: 1 })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .post('/tables/integration')
                    .send({ id: '2', string: "test2", bool: false, number: 2 })
                    .expect(201)
            })
            .then(function () {
                return supertest(app)
                    .get('/tables/integration?$top=1&$inlinecount=allpages')
                    .expect(200);
            })
            .then(function (results) {
                expect(results.body).to.containSubset({
                    results: [{ id: '1', string: "test", bool: true, number: 1 }],
                    count: 2
                })
            });
    });

    it("total count excludes deleted records", function () {
        mobileApp.tables.add('integration', { softDelete: true });
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .post('/tables/integration')
                    .send({ id: '2' })
                    .expect(201)
            })
            .then(function () {
                return supertest(app)
                    .delete('/tables/integration/1')
                    .expect(200)
            })
            .then(function () {
                return supertest(app)
                    .get('/tables/integration?$inlinecount=allpages')
                    .expect(200)
                    .then(function (results) {
                        expect(results.body.count).to.equal(1);
                    });
            });
    });

    it("returns 500 for get when table is defined but not yet created", function () {
        mobileApp.tables.add('notCreated', { dynamicSchema: false });
        app.use(mobileApp);
        return supertest(app)
            .get('/tables/notCreated')
            .expect(500);
    });

    it("allows multiple separate queries from the same table object", function () {
        var table = mobileApp.table();
        table.read(function (context) {
            var table = context.tables('integration');
            return table.where({ id: '1' }).read().then(function () {
                return table.where({ string: 'test2' }).read();
            })
        })
        mobileApp.tables.add('integration', table);
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test", bool: true, number: 1 })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .post('/tables/integration')
                    .send({ id: '2', string: "test2", bool: false, number: 2 })
                    .expect(201)
            })
            .then(function () {
                return supertest(app)
                    .get('/tables/integration')
                    .expect(200);
            })
            .then(function (results) {
                expect(results.body.length).to.equal(1);
                expect(results.body[0].id).to.equal('2')
            });
    });

    it("allows update of reserved properties from table scripts", function () {
        var table = mobileApp.table();
        table.update(function (context) {
            var table = context.tables('integration');
            return table.where({ id: '1' }).read().then(function (items) {
                var item = items[0];
                item.string = "test3";
                return table.update(item);
            })
        })
        mobileApp.tables.add('integration', table);
        app.use(mobileApp);

        return supertest(app)
            .post('/tables/integration')
            .send({ id: '1', string: "test", bool: true, number: 1 })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .patch('/tables/integration')
                    .expect(200);
            })
            .then(function (result) {
                expect(result.body.string).to.equal('test3')
            });
    });
});
