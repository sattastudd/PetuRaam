/*
 * Module responsible for extracting and creating a map for the request and
 * accesses.
 */
var credentials = require('./../credentials');
var fs = require('fs');

var pathReceived = credentials.routeLocation;
var jsPattern = /.js$/;
var requestInfoPattern = /\/\*Request-Name:\/[a-zA-Z\/]{1,},Type:[Post,Get,Put,Delete]{1,},Allowed:[a-zA-Z,]{1,}\*\//g;
var additionRequestIntoPattern = /\/\*Request-Name:\/[a-zA-Z\/]{1,}:[a-zA-Z]+,Type:[Post,Get,Put,Delete]{1,},Allowed:[a-zA-Z,]{1,}\*\//g;

var requestNamePattern = /Request-Name:\/[a-zA-Z\/]{1,}/g;
var requestTypePattern = /Type:[a-zA-Z]{1,}/g;
var allowedRolesPattern = /Allowed:[a-zA-Z,]{1,}/g;

var additionalParamRequestNamePatter = /Request-Name:\/[a-zA-Z\/]{1,}:[a-zA-Z]+/g;

var addMapping = utils.addMapping;
var addMappingToNamedRequests = utils.addMappingToNamedRequests;
var showAllMappings = utils.showAllMappings;

var createRequestMap = function () {

    logger.info('Mapping Requests to Authorized Roles');

    var filesInDirectory = fs.readdirSync(pathReceived);

    filesInDirectory.forEach(function (fileName) {

        if (jsPattern.test(fileName)) {
            var filePath = pathReceived + '/' + fileName;

            var lines = fs.readFileSync(filePath, "utf-8");

            lines = lines.split("\n");

            lines.forEach(function (line) {

                var compressedLine = line.replace(/ /g, '');


                if (requestInfoPattern.test(compressedLine)) {

                    var retrievedRequestName = compressedLine
                        .match(requestNamePattern)[0].split(':')[1];

                    var retrivedRequestType = compressedLine
                        .match(requestTypePattern)[0].split(':')[1];

                    var retrivedRoles = compressedLine
                        .match(allowedRolesPattern)[0].split(':')[1];

                    addMapping(retrievedRequestName, retrivedRequestType
                        .toLowerCase(), retrivedRoles);
                } else if (additionRequestIntoPattern.test(compressedLine)) {

                    var retrievedRequestName = compressedLine.match(additionalParamRequestNamePatter)[0]
                        .split("Request-Name:")[1]
                        .replace(/:[a-zA-Z]{1,}/, '');
                    var retrivedRequestType = compressedLine
                        .match(requestTypePattern)[0].split(':')[1];

                    var retrivedRoles = compressedLine
                        .match(allowedRolesPattern)[0].split(':')[1];

                    addMappingToNamedRequests(retrievedRequestName, retrivedRequestType.toLowerCase(), retrivedRoles);
                }


            });
        }
    });

    logger.info('Mapping Requests to Authorized Roles Finished');
};

module.exports.createRequestMap = createRequestMap;