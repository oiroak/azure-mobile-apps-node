// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
var sinon = require('sinon'),
    sinonPromised = require('sinon-as-promised'),
    expect = require('chai')
        .use(require('sinon-chai'))
        .expect,
    request = require('supertest-as-promised'),
    express = require('express'),
    mobileApps = require('../../appFactory').ignoreEnvironment,
    nhStub, notifFactoryStub, app, installation;


var notificationMiddleware = require('../../../src/express/middleware/notifications');

describe('azure-mobile-apps.express.integration.notifications', function () {    
    beforeEach(function () {
        app = express();
        app.use('/push/installations', notificationMiddleware(mobileApps().configuration));
    });

    it('returns 204 on put', function () {
        return request(app).put('/push/installations/id').expect(204);
    });

    it('returns 204 on delete', function () {
        return request(app).delete('/push/installations/id').expect(204);
    });
});
