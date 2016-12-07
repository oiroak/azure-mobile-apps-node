// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation. All rights reserved.
// ----------------------------------------------------------------------------
/**
@module azure-mobile-apps/src/express/middleware/parseQuery
@description Creates middleware that parses an OData query from the querystring
into a queryjs query object and attach to request object.
*/
var queries = require('../../../query'),
    errors = require('../../../utilities/errors');

/**
Create a new instance of the parseQuery middleware
@param {tableDefinition} table The table that is being queried
*/
module.exports = function (table) {
    return function (req, res, next) {
        var context = req.azureMobile;

        context.table = table;

        if(req.params.id) {
            context.id = req.params.id || context.id;
            context.query = queries.create(table.containerName).where({ id: context.id });
            context.query.id = context.id;
            context.query.single = true;
        } else {
            context.query = queries.fromRequest(req).take(topValue());
        }

        var etag = req.get('if-match');
        if(etag)
            context.version = etag;

        next();

        function topValue() {
            var top = parseInt(req.query.$top);
            
            if(table.maxTop && top > table.maxTop)
                throw errors.badRequest("You cannot request more than " + table.maxTop + " records");

            if(!top)
                top = table.pageSize || 50;
            
            return top;
        }
    };
};
