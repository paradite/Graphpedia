
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
  // For now, we crawl the terms if the database has less than 100 terms
  if(results < 100){
    console.log("Crawling data from stackoverflow");
   getTerms(base_url, processData);
  }
});

function processData(err, data) {
  data = JSON.parse(data);
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
  callback(null, '{"items":[{"synonyms":["js","ecmascript",".js","javascript-execution","classic-javascript","javascript-alert","javascript-dom","javascript-disabled","javascript-library","javascript-runtime","vanilla-javascript","javascript-module","vanilla-js","vanillajs"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":2150083,"name":"javascript"},{"synonyms":["java-se",".java","j2se","core-java","jdk","jre","java-libraries","oraclejdk","openjdk","javax","java-api"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":1744217,"name":"java"},{"synonyms":["pythonic","python-interpreter","python-shell","py"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":1624849,"name":"python"},{"synonyms":["c-sharp","c#.net","c#-language","visual-c#","csharp",".cs-file"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":1457091,"name":"c#"},{"synonyms":["php-oop","php-date","php5","php-frameworks","hypertext-preprocessor","php.ini","php-cli","php-errors","php-mail","php-cgi","php-functions","php-readfile","php-session","php-fpm","phtml","php-include","php-namespaces"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":1386891,"name":"php"},{"synonyms":["android-mobile","android-sdk","android-api","android-device","android-application","android-ui","android-framework"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":1317868,"name":"android"},{"synonyms":["html-tag","html-attributes","div","divs","nested-divs","div-layouts","html-comments","span","webpage","html5","time-tag","html-head"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":1045882,"name":"html"},{"synonyms":["jquery-core","jquery-live","addclass","toggleclass","removeclass","jquery-after","jquery-callback","jquery-get","jquery-post","jquery-find","jquery-css","jquery-hasclass","jquery-filter","jquery-effects"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":1004915,"name":"jquery"},{"synonyms":["cpp","cxx"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":708015,"name":"c++"},{"synonyms":["cascading-style-sheet","css-layout","css-background-image","css-attributes","css-classes","css-height","css-columns","css2","css-inheritance","css-centering","min-height","min-width","max-height","max-width","box-model","css-validation","style.css-template-file","css-display","css-line-height","css-overflow","alternate-stylesheets","inline-block","css-box-model","font-weight","css-menu","css-reset","dynamic-css","css-borders","css-font-weight","css-border-image","css-border-radius","css-box-shadow","css-text-shadow","css3","css-text-overflow","box-sizing","box-shadow"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":700090,"name":"css"},{"synonyms":["iphone-os","apple-ios","ios-sdk"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":648059,"name":"ios"},{"synonyms":["my-sql","mysql-query","mysql-server","mysql-table","mysqld","mysqlclient","mysqldump","mysqlsh","mysql-if"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":615844,"name":"mysql"},{"synonyms":["sql-query","sql-statement","sql-syntax","sql-select","sqlselect","select-statement"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":574825,"name":"sql"},{"synonyms":["rstats","r-language"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":382705,"name":"r"},{"synonyms":["nodejs","io.js"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":367679,"name":"node.js"},{"synonyms":["asp-net","aspx","asp.net-website","aspdotnet"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":361129,"name":"asp.net"},{"synonyms":["array","array-of-objects","javascript-array","jsonarray","string-array","char-array","mongodb-arrays","sub-arrays","character-arrays","swift-array","static-array","bytearray","arraycopy"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":352486,"name":"arrays"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":348984,"name":"c"},{"synonyms":["rails","ror"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":323212,"name":"ruby-on-rails"},{"synonyms":["json-parsing","json-encode","json-decode","jsonobject"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":309502,"name":"json"},{"synonyms":["dotnet","dot-net",".net-framework"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":304190,"name":".net"},{"synonyms":["mssql","ms-sql-server","sql-srever"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":298050,"name":"sql-server"},{"synonyms":["objc"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":291160,"name":"objective-c"},{"synonyms":["swift-language","swift-ios","swift1.2"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":286535,"name":"swift"},{"synonyms":["react","react-jsx","react.js"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":273571,"name":"reactjs"},{"synonyms":["python-3","py3k","python3k","python3","py3"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":267939,"name":"python-3.x"},{"synonyms":["angular.js","angular1.x"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":261860,"name":"angularjs"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":255507,"name":"django"},{"synonyms":["angular2","angular4","angular4.x","angularjs2"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":242378,"name":"angular"},{"synonyms":["ms-excel","workbook","excel-macro"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":238896,"name":"excel"},{"synonyms":["regexp","regular-expression","regular-expressions","regexes","regex-php","perl-regex","perlre","regularexpression","apache-regexp"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":236098,"name":"regex"},{"synonyms":["iphone-sdk","iphone-development","iphone-app","iphone-programming","iphone-ios","iphone-web"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":220868,"name":"iphone"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":217319,"name":"ruby"},{"synonyms":[".ajax","ajax-request"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":213801,"name":"ajax"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":199760,"name":"linux"},{"synonyms":["xml-file"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":199168,"name":"xml"},{"synonyms":["asp-net-mvc","asp.mvc","mvc.net","asp-mvc","asp.net.mvc","aspnet.mvc","aspnet-mvc"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":193211,"name":"asp.net-mvc"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":184758,"name":"pandas"},{"synonyms":["visual-basic-applications","vba-macros","macros-vba"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":183047,"name":"vba"},{"synonyms":["spring-framework","spring-config","spring-java-config"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":179894,"name":"spring"},{"synonyms":["databases","db","database-structure","dbms"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":174958,"name":"database"},{"synonyms":["wordpress-loop","wordpress-plugin-dev","wordpress-mu","wordpress-filter","wordpress-widget","wordpress-permission","wp-query","wordpress-theme-customize","wordpress-plugin","wpdb"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":172075,"name":"wordpress"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":165058,"name":"laravel"},{"synonyms":["strings","string-manipulation","str","empty-string"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":161071,"name":"string"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":160068,"name":"wpf"},{"synonyms":["xcode-ide"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":147735,"name":"xcode"},{"synonyms":["windows-programming","windows-application","windows-applications"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":147010,"name":"windows"},{"synonyms":["mongo","mongod"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":142069,"name":"mongodb"},{"synonyms":["atscript"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":136932,"name":"typescript"},{"synonyms":["vbproj","vb"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":132750,"name":"vb.net"},{"synonyms":["bash-script","bashrc",".bashrc","bash-alias","bash-variables",".bash-profile","bash-function"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":131728,"name":"bash"},{"synonyms":["postgres","pgsql","sql-postgres"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":130258,"name":"postgresql"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":129881,"name":"oracle"},{"synonyms":["git-commands"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":129734,"name":"git"},{"synonyms":["threading","multithread","multi-threaded","threads","thread","cross-threading"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":127438,"name":"multithreading"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":121457,"name":"eclipse"},{"synonyms":["lists","ilist","python-list"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":111440,"name":"list"},{"synonyms":["aws"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":109081,"name":"amazon-web-services"},{"synonyms":["algorithms","algorithm-design"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":105211,"name":"algorithm"},{"synonyms":["firebase-android"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":105208,"name":"firebase"},{"synonyms":["form","html-form"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":104980,"name":"forms"},{"synonyms":["macosx","mac","osx"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":104796,"name":"macos"},{"synonyms":["images","img","picture","pictures"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":103521,"name":"image"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":102233,"name":"scala"},{"synonyms":["vs.net","msvs","visual-studio-community"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":100470,"name":"visual-studio"},{"synonyms":["bootstrap-framework"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":100152,"name":"twitter-bootstrap"},{"synonyms":["windows-azure","az"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":98688,"name":"azure"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":97340,"name":"spring-boot"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":94330,"name":"python-2.7"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":91836,"name":"react-native"},{"synonyms":["performance-issues","perfomance","performance-tuning","fast","slow","performance-comparison","speed","faster","running-time","speed-up","efficiency","android-performance","javascript-performance","jquery-performance","linq-performance","wcf-performance","application-performance","tuning","slowness","performance-measurement","performance-monitoring","code-efficiency","slow-load"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":91593,"name":"performance"},{"synonyms":["windows-forms","window-form","windows-form","window-forms","winform","windows.forms","windows-forms-app"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":91246,"name":"winforms"},{"synonyms":["functions","def"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":90841,"name":"function"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":90287,"name":"docker"},{"synonyms":["matlab-ide","matlab-path","matlab-toolbox","mlint","m-file"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":89729,"name":"matlab"},{"synonyms":["httpd"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":88667,"name":"apache"},{"synonyms":["windows-powershell"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":88205,"name":"powershell"},{"synonyms":["apis"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":86838,"name":"api"},{"synonyms":["sqllite","sqlitedatabase","sqlite3"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":86384,"name":"sqlite"},{"synonyms":["ef","linq-entity-framework","entity-framework-mapping","fluent-entity-framework","entity-framework-designer","sql-to-entity-framework"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":86086,"name":"entity-framework"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":86059,"name":"hibernate"},{"synonyms":["data-frame","dataframes","data.frame","r-df","pandas-df"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":85616,"name":"dataframe"},{"synonyms":["facebook-api","facebook-sdk","facebook-application","facebook-connect","facebook-sdk-ios"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":85008,"name":"facebook"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":84795,"name":"numpy"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":82571,"name":"selenium"},{"synonyms":["restful","restful-web-services","restful-architecture","rest-api"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":81505,"name":"rest"},{"synonyms":["shell-script","shell-scripting","shell-command","shell-commands","shellscript"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":80849,"name":"shell"},{"synonyms":["language-integrated-query","linq-query-syntax"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":80388,"name":"linq"},{"synonyms":["loop","looping","iterate"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":78355,"name":"loops"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":77992,"name":"qt"},{"synonyms":["javax.swing","java-swing"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":77436,"name":"swing"},{"synonyms":["mvn"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":77435,"name":"maven"},{"synonyms":[".csv","comma-separated","tsv"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":74837,"name":"csv"},{"synonyms":["androidstudio-settings"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":74558,"name":"android-studio"},{"synonyms":["unit-test","unit-tests","unittest"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":73407,"name":"unit-testing"},{"synonyms":["files"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":72971,"name":"file"},{"has_synonyms":false,"is_moderator_only":false,"is_required":false,"count":72884,"name":"flutter"},{"synonyms":["express.js","expressjs"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":72567,"name":"express"},{"synonyms":["vuejs","vue","vue-js"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":71296,"name":"vue.js"},{"synonyms":["htaccess","codeigniter-htaccess"],"has_synonyms":true,"is_moderator_only":false,"is_required":false,"count":69203,"name":".htaccess"}],"has_more":true,"quota_max":300,"quota_remaining":298,"page_size":100,"total":60375,"type":"tag"}');

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
      callback(null, body);
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
    } */

