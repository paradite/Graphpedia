
/**
 * Module dependencies.
 */
let express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  https = require('https'),
  path = require('path'),
  request = require('request'),
  moment = require('moment');

const app = express();
const session = require('express-session');
const zlib = require('zlib');
// MongoDB for user log in functions
const mongoose = require('mongoose');
const passport = require('passport');
/* var LocalStrategy = require('passport-local').Strategy; */

const MongoStore = require('connect-mongo')(express);

app.use(express.static('public'));

// mongoose
const mongodb_url = process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
process.env.MONGODB_URL;

console.log("mongodb_url", mongodb_url)
mongoose.connect(mongodb_url, (err) => { if (err) console.log(err); });

/* all environments */
app.set('port', process.env.PORT || 3000);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
// use session to store if created
app.use(express.cookieParser());
app.use(express.session({
  secret: '1234567890QWERTY',
  cookie: { maxAge: 86400000 },
  store: new MongoStore({
    db: 'SessionData',
    url: mongodb_url,
  }),
}));

/* Passport related */
app.use(passport.initialize());
app.use(passport.session());

/* Middleware for req.user info */
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(app.router);

// development only
if (app.get('env') == 'development') {
  app.use(express.errorHandler());
}

app.locals({
  title: 'Visualize Terms', // default title
});

// passport config
const Account = require('./models/account');

passport.use(Account.createStrategy());
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Account.findById(id, (err, user) => {
    done(err, user);
  });
});

// Get the number of terms in the database to decide if crwaling is needed
const Term = require('./models/term');
/**
 * Get count for all the terms from neo4j database
 * @param  {error} err
 * @param  {int} results
 * @return {none}
 */
Term.getCount((err, results) => {
  if (err) {
    console.log('get Count wrong');
  }
  console.log(`Number of terms: ${results}`);
  // For now, we crawl the terms if the database has less than 50 terms
  if(results < 50){
    console.log("using seed data");
    getTerms(base_url, processData);
  }
});

function processData(err, data) {
  items = data.items;
  console.log(JSON.stringify(data, null, 4));
  let current_time = moment().format();
  items.forEach((item) => {
    current_time = moment().format();
    // console.log(item.name);
    // Check the name against the database to make sure no duplicates
    Term.getByName(item.name, (err, terms) => {
      if (err) {
        console.log('%s', 'err occured during getByName');
        res.render('index');
      }
      console.log('%s', `trying to create: ${item.name} found in database? ${terms}`);
      if (terms != null && terms.length > 0) {
        // Matched, skip the term
        console.log('%s', `${item.name} already in database, skipped.`);
      } else {
        console.log('%s', 'The term does not exist yet. Ready to create.');
        // Create the term
        console.log(`time for adding of ${item.name} to data array: ${current_time}`);
        let data;
        if (item.has_synonyms) {
          data = {
            name: item.name,
            description: item.synonyms[0],
            // Save a lower case name of the term for search matching
            name_lower_case: item.name.toLowerCase(),
            created_at: current_time,
            last_viewed_at: current_time,
            last_modified_at: current_time,
          };
        } else {
          data = {
            name: item.name,
            description: 'No description yet',
            // Save a lower case name of the term for search matching
            name_lower_case: item.name.toLowerCase(),
            created_at: current_time,
            last_viewed_at: current_time,
            last_modified_at: current_time,
          };
        }
        // Call create method
        Term.create(data, (err, term) => {
          if (err) console.log(err);
          console.log(`${term.name} created.`);
        });
      }
    });
  });
}

// Data mining functions using Stack Exchange - stackoverflow API - tag
// Stack Exchange API url
const base_url = 'https://api.stackexchange.com/2.2/tags?pagesize=100&order=desc&sort=popular&site=stackoverflow&filter=!bEvCQepmjja-QK';

/**
 * Get and unzip the response from Stack Exchange API
 * @param  {string}   url
 * @param  {Function} callback
 */
function getTerms(url, callback) {
  let useSeed = true;
  if(useSeed) {
    const seed = require('./seed_terms.json');
    return callback(null, seed);
  }

  https.get(url, (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];
  
    let error;
    // Any 2xx status code signals a successful response but
    // here we're only checking for 200.
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
                        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.error(error.message);
      // Consume response data to free up memory
      res.resume();
      callback(error);
    }
    var body = "";
    var output;
    if( res.headers['content-encoding'] == 'gzip' ) {
      var gzip = zlib.createGunzip();
      res.pipe(gzip);
      output = gzip;
    } else {
      output = res;
    }
    output.on('data', function (data) {
        data = data.toString('utf-8');
        body += data;
    });

    output.on('end', function() {
      callback(null, JSON.parse(body));
    });

  }).on('error', (e) => {
    callback(e);
  });
}

// routes for passport
app.get('/register', routes.site.register);

// Added invitation code system during register to prevent unwanted users
app.post('/register', (req, res) => {
  Account.register(new Account({ username: req.body.username }), req.body.password, req.body.code, (err, account) => {
    if (err) {
      return res.render('register', {
        info: err.message || 'Sorry. An error occured.',
      });
    }

    passport.authenticate('local')(req, res, () => {
      res.redirect('/');
    });
  });
});

app.get('/login', routes.site.login);

app.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/ping', (req, res) => {
  res.send('pong!', 200);
});

// other routes
/* Index page */
app.get('/', routes.site.index);
app.post('/', routes.site.indexpost);

/* About page */
app.get('/about', routes.site.about);

/* Statistics page */
app.get('/stats', routes.site.stats);

/* Contribute page */
app.get('/contribute', routes.site.contribute);
app.post('/contribute', routes.site.contributeadd);

/* Random term page */
app.get('/random_term', routes.terms.random_term);

/* Suggest relationship */
app.post('/suggest', routes.site.suggest);

/* All terms page */
app.get('/terms', routes.terms.list);

/* Create new term */
app.post('/terms', routes.terms.create);

/* Term page */
app.get('/terms/:id', routes.terms.show);
app.post('/terms/:id', routes.terms.edit);
app.del('/terms/:id', routes.terms.del);

/* Relationship routing */
app.post('/terms/:id/custom', routes.terms.custom);
app.post('/terms/:id/uncustom', routes.terms.uncustom);

/* Add term and propose new relationship */
app.post('/terms/:id/newcustom', routes.terms.newcustom);

/* Search Route */
app.post('/search', routes.site.searchinit);
app.get('/search', routes.site.search);

/* Path Routes */
app.get('/pathfind', routes.site.pathrender);
app.post('/pathfind', routes.site.pathinit);
/* Main method to search for path in database and render it */
app.get('/path', routes.site.path);

/* Handling wrong urls */
app.get('/*', routes.site.wrong);

http.createServer(app).listen(app.get('port'), () => {
  console.log('Express server listening at: http://localhost:%d/', app.get('port'));
});
