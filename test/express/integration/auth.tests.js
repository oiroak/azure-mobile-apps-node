// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory'),
    auth = require('../../../src/auth')({ secret: 'secret' }),
    secret = 'secret',
    token = auth.sign({ "sub": "Facebook:someuserid@hotmail.com" }),
    getIdentity = require('../../../src/auth/getIdentity'),

    app, mobileApp;

// the default configuration uses the in-memory data provider - it does not (yet) support queries
describe('azure-mobile-apps.express.integration.auth', function () {
    beforeEach(function () {
        app = express();
        mobileApp = mobileApps({ auth: { secret: secret, getIdentity: getIdentity }, data: { provider: 'memory' } });
    });

    describe('when validating tokens', function () {
        it('returns 200 for table requests with valid X-ZUMO-AUTH token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('x-zumo-auth', token)
                .expect(200);
        });

        it('returns 200 for table requests with valid Authorization token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('Authorization', 'Bearer ' + token)
                .expect(200);
        });

        it('returns 200 for table requests with no auth token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .expect(200);
        });

        it('returns 401 for table requests with invalid X-ZUMO-AUTH token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('x-zumo-auth', 'invalid token')
                .expect(401);
        });

        it('returns 401 for table requests with invalid (non-bearer) Authorization token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('Authorization', 'invalid token')
                .expect(401);
        });

        it('returns 401 for table requests with invalid (bearer) Authorization token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('Authorization', 'Bearer invalidtoken')
                .expect(401);
        });

        it('returns 401 for table requests against authorized table with no token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem', { authorize: true });
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .expect(401);
        });

        it('returns 200 for table requests against authorized table with valid token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem', { authorize: true });
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('x-zumo-auth', token)
                .expect(200);
        });

        it('validates tokens when not hosted', function () {
            mobileApp.configuration.hosted = false;
            mobileApp.tables.add('todoitem', { authorize: true });
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .expect(401);
        });

        it('returns 401 for well formed but invalid token', function () {
            mobileApp.configuration.auth.validateTokens = true;
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('x-zumo-auth', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ')
                .expect(401);
        });
    });

    describe('when decoding tokens', function () {
        it('returns 200 for table requests with valid X-ZUMO-AUTH token', function () {
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('x-zumo-auth', token)
                .expect(200);
        });

        it('returns 200 for table requests with valid Authorization token', function () {
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('Authorization', 'Bearer ' + token)
                .expect(200);
        });

        it('returns 200 for table requests with no auth token', function () {
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .expect(200);
        });

        it('returns 401 for table requests with invalid X-ZUMO-AUTH token', function () {
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('x-zumo-auth', 'invalid token')
                .expect(401);
        });

        it('returns 401 for table requests with invalid (non-bearer) Authorization token', function () {
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('Authorization', 'invalid token')
                .expect(401);
        });

        it('returns 401 for table requests with invalid (bearer) Authorization token', function () {
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('Authorization', 'Bearer invalidtoken')
                .expect(401);
        });

        it('returns 401 for table requests against authorized table with no token', function () {
            mobileApp.tables.add('todoitem', { authorize: true });
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .expect(401);
        });

        it('returns 401 for table requests against authorized table (alternate syntax) with no token', function () {
            mobileApp.tables.add('todoitem', { access: 'authenticated' });
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .expect(401);
        });

        it('returns 200 for table requests against authorized table with valid X-ZUMO-AUTH token', function () {
            mobileApp.tables.add('todoitem', { authorize: true });
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('x-zumo-auth', token)
                .expect(200);
        });

        it('returns 200 for table requests against authorized table with valid Authorization token', function () {
            mobileApp.tables.add('todoitem', { authorize: true });
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('Authorization', 'Bearer ' + token)
                .expect(200);
        });

        it('returns 401 for well formed but invalid token', function () {
            mobileApp.tables.add('todoitem');
            app.use(mobileApp);

            return supertest(app)
                .get('/tables/todoitem')
                .set('x-zumo-auth', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ')
                .expect(401);
        });
    });

    it('attaches user object to context object (X-ZUMO-AUTH)', function () {
        var table = mobileApp.table();
        table.authorize = true;
        table.read(function (context) {
            return [context.user.id];
        });
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .set('x-zumo-auth', token)
            .expect(200)
            .then(function (response) {
                expect(response.body).to.deep.equal(['Facebook:someuserid@hotmail.com']);
            });
    });

    it('attaches user object to context object (Authorization)', function () {
        var table = mobileApp.table();
        table.authorize = true;
        table.read(function (context) {
            return [context.user.id];
        });
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then(function (response) {
                expect(response.body).to.deep.equal(['Facebook:someuserid@hotmail.com']);
            });
    });

    it('attaches getIdentity function to user object (X-ZUMO-AUTH)', function () {
        var table = mobileApp.table();
        table.authorize = true;
        table.read(function (context) {
            return [context.user.getIdentity('provider')];
        });
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .set('x-zumo-auth', token)
            .expect(200)
            .then(function (response) {
                expect(response.body).to.deep.equal([{ provider: 'provider' }]);
            });
    });

    it('attaches getIdentity function to user object (Authorization)', function () {
        var table = mobileApp.table();
        table.authorize = true;
        table.read(function (context) {
            return [context.user.getIdentity('provider')];
        });
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
            .then(function (response) {
                expect(response.body).to.deep.equal([{ provider: 'provider' }]);
            });
    });

    it('authorizes all operations against a table when specified', function () {
        mobileApp.tables.add('todoitem', { authorize: true });
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(401)
            .then(function () {
                return supertest(app)
                    .post('/tables/todoitem')
                    .expect(401);
            })
            .then(function () {
                return supertest(app)
                    .delete('/tables/todoitem')
                    .expect(401);
            })
            .then(function () {
                return supertest(app)
                    .patch('/tables/todoitem')
                    .expect(401);
            });
    });

    it('authorizes specific operations against a table when specified', function () {
        var table = mobileApp.table();
        table.insert.authorize = true;
        table.update.authorize = true;
        mobileApp.tables.add('todoitem', table);
        app.use(mobileApp);

        return supertest(app)
            .get('/tables/todoitem')
            .expect(200)
            .then(function () {
                return supertest(app)
                    .post('/tables/todoitem')
                    .expect(401);
            })
            .then(function () {
                return supertest(app)
                    .delete('/tables/todoitem')
                    .expect(200);
            })
            .then(function () {
                return supertest(app)
                    .patch('/tables/todoitem')
                    .expect(401);
            });
    });

    function getIdentity(authConfiguration, token, provider) {
        return { provider: provider };
    }
});
