var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// Mongoose Models
var Review = require('./models/review.server.model');
 
// necessary for running APIs locally
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
 
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};
 
app.use(allowCrossDomain);
 
// configure app to use bodyParser()
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
 
// MongoDB - used by all services
if(process.env.VCAP_SERVICES){
	var services = JSON.parse(process.env.VCAP_SERVICES);
  if(services.mongodb) {
    uri = services.mongodb[0].credentials.url;
  } 
	else if (services['compose-for-mongodb']){
  	
  	uri = services['compose-for-mongodb'][0].credentials.uri;
  }
	else {
    uri = process.env.MONGO_URI;
  }
} else {
	uri = process.env.MONGO_URI;
}
mongoose.connect(uri);
 
// Set up /api router
var router = express.Router();
 
// middleware to use for all requests (JSON)
router.use(function(req, res, next) {
		var body = JSON.stringify(req.body);
    console.log('[Request] '+req.method+' ' + req.url + ' - Body: ' + body);
    next();
});
 
 
/* MONGOOSE Schema Goes Here */
 
/* ------------------------------------------------------------------------
-- A P I  C O D E ---------------------------------------------------------
------------------------------------------------------------------------ */
 
router.route('/reviews/:product_id')
	// get the reviews associated with the passed product id
	.get(function(req, res) {
			Review.find({ productId: req.params.product_id }, function(err, review) {
					if (err)
							res.send(err);
					res.json(review);
			});
	})

	// add a new review for a product
	.post(function(req, res) {

			var review = Review();
			review.productId = req.body.productId;
			review.stars = req.body.stars;
			review.body = req.body.body;
			review.author = req.body.author;

			// save the new review
			review.save(function(err) {
					if (err)
							res.send(err);
					res.json({ message: 'Review Successfully Added!'});
			});

	});

 
/* ------------------------------------------------------------------------
-- S T A R T   S E R V E R ------------------------------------------------
------------------------------------------------------------------------ */
 
app.use('/api', router);
 
// get the app environment from Cloud Foundry
var port = process.env.PORT || 8080;
 
// start server on the specified port and binding host
app.listen(port, function() {
 console.log("server starting on port: " + port);
});