
/**
 * Module dependencies.
 */

var express = require('express')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , errorHandler = require('errorhandler')
  , moment = require('moment');;

var app = module.exports = express();

router = express.Router();
var restaurants = require('./server/routes/restaurants');
var cities = require('./server/routes/cities');
var locations = require('./server/routes/locations');

// Configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());

if ('development' == app.get('env')) {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

if ('production' == app.get('env')) {
  app.use(errorHandler());
}

// Routes

app.use(function (req, res, next) {
  console.log('%s user from %s at Time: %s',req.headers['x-forwarded-for'] || req.connection.remoteAddress ,req.headers['user-agent'] ,moment(Date.now()).format());
  next();
});

app.use('/', router);

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});