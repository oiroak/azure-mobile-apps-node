// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,
    request = require('supertest-as-promised'),
    auth = require('../../../src/auth')({ secret: 'secret' }),
    token = auth.sign({ "uid": "Facebook:someuserid@hotmail.com" }),
    app, mobileApp;

    app = require('express')();
    mobileApps = require('../../appFactory').ignoreEnvironment,

    mobileApp = mobileApps({ auth: { secret: 'secret', getIdentity: getIdentity }});

    mobileApp.api.import('express/files/api/customapi');
    mobileApp.api.import('express/files/api/authapi');
    mobileApp.api.import('express/files/api/asyncapi');
    app.use(mobileApp);

describe('azure-mobile-apps.express.integration.customapi', function () {
    it('returns 200 on existing verb', function () {
        return request(app).get('/api/customapiname').expect(200);
    });

    it('returns 200 on existing verb created with an async function', function () {
        return request(app).get('/api/asyncapi').expect(200);
    });

    it('returns 404 on non-existent verb', function () {
        return request(app).post('/api/customapiname').expect(404);
    });

    it('returns 401 on authorized verb', function () {
        return request(app).delete('/api/customapiname').expect(401);
    });

    it('returns 200 on authorized verb when authorized', function () {
        return request(app).delete('/api/customapiname')
            .set('x-zumo-auth', token)
            .expect(200);
    });

    it('correctly imports middleware array', function () {
        return request(app).put('/api/customapiname')
            .set('x-zumo-auth', token)
            .expect('customapi', 'true')
            .expect(200);
    });

    it('returns correct options on preflight', function () {
        return request(app).options('/api/customapiname')
            .expect('allow', 'GET,HEAD,PUT,DELETE,PATCH')
            .expect(200);
    });

    it('returns 401 on all verbs of authorized api', function () {
        return request(app).get('/api/authapi').expect(401)
            .then(function () {
                return request(app).delete('/api/authapi').expect(401);
            });
    });

    it('returns 405 on disabled method', function () {
        return request(app).post('/api/authapi').expect(405);
    });

    it('parses json if specified in content-type header', function () {
        return request(app)
            .patch('/api/customapiname')
            .set('content-type', 'application/json')
            .send({ message: 'test' })
            .expect(200)
            .then(function (res) {
                expect(res.body.response).to.equal('test1');
            });
    });
});

function getIdentity(authConfiguration, token, provider) {
    return { provider: provider };
}
