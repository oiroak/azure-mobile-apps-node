// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
@module azure-mobile-apps/src/express/middleware/notifications
@description Creates middleware that exposes routes for registering devices
for push notifications.
*/

var express = require('express'),
    notifications = require('../../notifications'),
    log = require('../../logger');

/**
Create a new instance of the notifications middleware
@param {configuration} configuration The mobile app configuration
*/
module.exports = function (configuration) {
    var router = express.Router(),
        installationClient = notifications(configuration.notifications);

    router.use(addPushContext);
    router.route('/:installationId')
        .put(respond)
        .delete(respond);

    return router;

    function addPushContext(req, res, next) {
        req.azureMobile = req.azureMobile || {};
        req.azureMobile.push = installationClient.getClient();
        next();
    }

    function respond(req, res, next) {
        var action = req.method === 'PUT' ? 'registration' : 'deletion';
        log.verbose('Received push notification installation ' + action + ' request. Returning stubbed response (registration only occurs when hosted on Azure).');
        res.status(204).end();
    }
};
