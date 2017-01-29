var mongoose = require('mongoose');
var config = require('config');

var env = config.util.getEnv('NODE_ENV');

if (env === 'development') {
	mongoose.connect('mongodb://localhost/galleria');
}
if (env === 'test') {
	mongoose.connect('mongodb://localhost/galleria_test');
}
if (env === 'production') {
	mongoose.connect('mongodb://localhost/galleria_production');
}