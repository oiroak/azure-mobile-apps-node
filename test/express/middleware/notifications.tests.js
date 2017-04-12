// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var expect = require('chai').expect,

    middleware = require('../../../src/express/middleware/notifications'),
    config = {
        notifications: {
            hubName: 'name',
            connString: 'connString',
            client: 'client'
        }
    },
    req;

describe('azure-mobile-apps.express.middleware.notifications', function () {
    beforeEach(function () {
        req = { method: 'get', url: 'http://url'};
    });

    it('attaches push context', function (done) {
        var router = middleware(config);

        router(req, {}, function () {
            try {
                expect(req.azureMobile.push).to.equal('client');
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});
