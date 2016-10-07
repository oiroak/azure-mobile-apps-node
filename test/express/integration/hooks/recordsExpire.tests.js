// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').use(require('chai-subset')).expect,
    supertest = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../../appFactory'),
    auth = require('../../../../src/auth'),
    promises = require('../../../../src/utilities/promises'),

    app, mobileApp;

describe('azure-mobile-apps.express.integration.hooks.recordsExpire', function () {
    afterEach(mobileApps.cleanUp(mobileApps.configuration()).testTable({ name: 'recordsExpire' }));

    it("returns records where expiry has not passed", function () {
        setup(1500);
        return request('post', null, 201, { id: '1' })()
            .then(request('post', null, 201, { id: '2' }))
            .then(request('get', null, 200))
            .then(function (response) {
                expect(response.body.length).to.equal(2);
            });
    });

    it("does not return records where expiry has passed", function () {
        setup(1);
        return request('post', null, 201, { id: '1' })()
            .then(request('post', null, 201, { id: '2' }))
            .then(function () {
                // this test is flaky on the build server without fairly high values here
                // I'm at a loss to explain why!
                return promises.sleep(500);
            })
            .then(request('get', null, 200))
            .then(function (response) {
                expect(response.body.length).to.equal(0);
            })
    });

    function setup(expiryInMilliseconds) {
        app = express();
        mobileApp = mobileApps();
        mobileApp.tables.add('recordsExpire', { recordsExpire: { milliseconds: expiryInMilliseconds } });
        app.use(mobileApp);
    }

    function request(method, id, expectedResponse, body) {
        return function () {
            var url = '/tables/recordsExpire' + (id ? '/' + id : ''),
                req = supertest(app)[method](url);

            if(body) req.send(body);

            return req.expect(expectedResponse);
        };
    }

    function validateIds(ids) {
        return function (results) {
            expect(results.body.length).to.equal(ids.length);
            ids.forEach(function (id, index) {
                expect(results.body[index].id).to.equal(id);
            });
        }
    }

    function validateProperty(property, value) {
        return function (results) {
            expect(results.body[property]).to.equal(value);
        };
    }
});
