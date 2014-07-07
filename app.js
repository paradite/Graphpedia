
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

//MongoDB for user log in functions
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

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
app.use(app.router);
//Passport related
app.use(passport.initialize());
app.use(passport.session());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.locals({
    title: 'Visualize Terms'    // default title
});

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect(mongodb_url);

// Routes
/*Index page*/
app.get('/', routes.site.index);
app.post('/', routes.site.indexpost);

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

/*Handling wrong urls*/
app.get("/*", routes.site.wrong);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening at: http://localhost:%d/', app.get('port'));
});
