
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , request = require('request');
var app = express();
var session = require('express-session');
var zlib = require('zlib');
//MongoDB for user log in functions
var mongoose = require('mongoose');
var passport = require('passport');
/*var LocalStrategy = require('passport-local').Strategy;*/

var mongodb_url = process.env.MONGOLAB_URI || 
				process.env.MONGOHQ_URL || 
				'mongodb://localhost/passport_local_mongoose';

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
//use session to store if created
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
//Passport related
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.locals({
	title: 'Visualize Terms'    // default title
});

// passport config
var Account = require('./models/account');
passport.use(Account.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Account.findById(id, function(err, user) {
    done(err, user);
  });
});
// mongoose
mongoose.connect(mongodb_url, function(err) { if (err) console.log(err); });

//Get the number of terms in the database to decide if crwaling is needed
var Term = require('./models/term');
/**
 * Get count for all the terms from neo4j database
 * @param  {error} err
 * @param  {int} results
 * @return {none}
 */
Term.getCount(function (err, results) {
    if (err) {
        console.log("get Count wrong");
    }
    console.log("Number of terms: " + results);
    //For now, we crawl the terms if the database has less than 100 terms
    if(results < 100){
    	getGzipped(base_url, processData);
    }
});

function processData(err, data) {
  data_to_add = [];
  data = JSON.parse(data);
  items = data.items;
	console.log(JSON.stringify(data, null, 4));
  items.forEach(function (item){
    // console.log(item.name);
    if(item.has_synonyms){
      // console.log(item.synonyms[0]);
      data_to_add.push({name: item.name, description: item.synonyms[0]});
    }else{
      data_to_add.push({name: item.name, description: "No description yet"});
    }
  });
  console.log(data_to_add);
  Term.createMultiple(data_to_add, function (err, count) {
    if (err) console.log(err);
    console.log(count + " terms created.");
  });
}

//Data mining functions using Stack Exchange - stackoverflow API - tag
//Stack Exchange API url
var base_url = "http://api.stackexchange.com/2.2/tags?pagesize=100&order=desc&sort=popular&site=stackoverflow&filter=!bEvCQepmjja-QK";

/**
 * Get and unzip the response from Stack Exchange API
 * @param  {string}   url
 * @param  {Function} callback
 */
function getGzipped(url, callback) {
    // buffer to store the streamed decompression
    var buffer = [];

    http.get(url, function(res) {
        // pipe the response into the gunzip to decompress
        var gunzip = zlib.createGunzip();            
        res.pipe(gunzip);

        gunzip.on('data', function(data) {
            // decompression chunk ready, add it to the buffer
            buffer.push(data.toString())

        }).on("end", function() {
            // response and decompression complete, join the buffer and return
            callback(null, buffer.join("")); 

        }).on("error", function(e) {
            callback(e);
        })
    }).on('error', function(e) {
        callback(e)
    });
}

// routes for passport
app.get('/register', function(req, res) {
	res.render('register', {info: ""});
});

//Added invitation code system during register to prevent unwanted users
app.post('/register', function(req, res) {
	Account.register(new Account({ username : req.body.username }), req.body.password, req.body.code, function(err, account) {
		if (err) {
			return res.render("register", {info: err.message || "Sorry. An error occured."});
		}

		passport.authenticate('local')(req, res, function () {
		  res.redirect('/');
		});
	});
});

app.get('/login', function(req, res) {
	res.render('login', { user : req.user });
});

app.post('/login', passport.authenticate('local'), function(req, res) {
	res.redirect('/');
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/ping', function(req, res){
	res.send("pong!", 200);
});

// other routes
/*Index page*/
app.get('/', routes.site.index);
app.post('/', routes.site.indexpost);

/*Contribute page*/
app.get('/contribute', routes.site.contribute);
app.post('/contribute', routes.site.contributeadd);

/*Random term page*/
app.get('/random_term', routes.terms.random_term);

/*Suggest relationship*/
app.post('/suggest', routes.site.suggest);

/*All terms page*/
app.get('/terms', routes.terms.list);

/*Create new term*/
app.post('/terms', routes.terms.create);

/*Term page*/
app.get('/terms/:id', routes.terms.show);
app.post('/terms/:id', routes.terms.edit);
app.del('/terms/:id', routes.terms.del);

/*Relationship routing*/
app.post('/terms/:id/custom', routes.terms.custom);
app.post('/terms/:id/uncustom', routes.terms.uncustom);

/*Add term and propose new relationship*/
app.post('/terms/:id/newcustom', routes.terms.newcustom);

/*Search Route*/
app.post('/search', routes.site.searchinit);
app.get('/search', routes.site.search);

/*Path Routes*/
app.get('/pathfind', routes.site.pathrender);
app.post('/pathfind', routes.site.pathinit);
/*Main method to search for path in database and render it*/
app.get('/path', routes.site.path);

/*Handling wrong urls*/
app.get("/*", routes.site.wrong);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening at: http://localhost:%d/', app.get('port'));
});

// Last few terms crawled:
/*    {
      "synonyms": [
        "gae",
        "appengine"
      ],
      "has_synonyms": true,
      "is_moderator_only": false,
      "is_required": false,
      "count": 26555,
      "name": "google-app-engine"
    },
    {
      "synonyms": [
        "mvc4"
      ],
      "has_synonyms": true,
      "is_moderator_only": false,
      "is_required": false,
      "count": 26492,
      "name": "asp.net-mvc-4"
    },
    {
      "has_synonyms": false,
      "is_moderator_only": false,
      "is_required": false,
      "count": 26489,
      "name": "silverlight"
    }*/

