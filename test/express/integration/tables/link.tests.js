// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../../appFactory').ignoreEnvironment,
    config = require('../../../appFactory').configuration,

    app, mobileApp;

// the default configuration uses the in-memory data provider - it does not (yet) support queries
describe('azure-mobile-apps.express.integration.tables.link', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({ pageSize: 2, data: { provider: 'memory' } });
    });

    it('adds Link header when top is not specified and results.length === pageSize', function () {
        mobileApp = mobileApps({ pageSize: 1, data: { provider: 'memory' } });
        mobileApp.tables.add('headers');
        app.use(mobileApp);
        return supertest(app)
            .post('/tables/headers')
            .send({ id: '1' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .get('/tables/headers')
                    .expect(200)
                    .expect(function (res) {
                        expect(res.headers.link).to.contain('?%24top=1&%24skip=1; rel=next');
                    });
            });
    });

    it('adds Link header when top > take & results.length === take', function () {
        var table = mobileApp.table();

        table.read(function (context) {
            context.query = context.query.take(1);
            return context.execute();
        });

        mobileApp.tables.add('headers', table);
        app.use(mobileApp);
        return supertest(app)
            .post('/tables/headers')
            .send({ id: '1' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .get('/tables/headers?$top=2')
                    .expect(200)
                    .expect(function (res) {
                        expect(res.headers.link).to.contain('?%24top=1&%24skip=1; rel=next');
                    });
            });
    });

    it('adds no Link header when top < result.count', function () {
        mobileApp.tables.add('headers');
        app.use(mobileApp);
        return supertest(app)
            .post('/tables/headers')
            .send({ id: '1' })
            .expect(201)
            .then(function () {
                return supertest(app)
                    .get('/tables/headers?$top=2')
                    .expect(200)
                    .expect(function (res) {
                        // no link, because $top < result.count
                        expect(res.headers.link).to.be.undefined;
                    });
            });
    });
});
