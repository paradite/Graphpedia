
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , request = require('request');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.locals({
    title: 'Visualize Terms'    // default title
});

// Routes

app.get('/', routes.site.index);

app.get('/terms', routes.terms.list);
app.post('/terms', routes.terms.create);
app.get('/terms/:id', routes.terms.show);
app.post('/terms/:id', routes.terms.edit);
app.del('/terms/:id', routes.terms.del);

app.post('/terms/:id/follow', routes.terms.follow);
app.post('/terms/:id/unfollow', routes.terms.unfollow);

app.post('/terms/:id/contain', routes.terms.contain);
app.post('/terms/:id/uncontain', routes.terms.uncontain);

//Index Search Route
/*app.get('/search', routes.site.index);*/
app.post('/search', routes.site.searchinit);
app.get('/search', routes.site.search);

//Use neo4j REST API to get all relationship
var options = {
    url: 'http://127.0.0.1:7474/db/data/relationship/types',
    headers: {
        'User-Agent': 'request'
    }
};

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var types = "";
        info.forEach(function(item) { 
        	types+= item;
        	types+= " ";
        });
        console.log("Currently there are "+info.length+" relationships types: " + types);
    }
}

request(options, callback);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening at: http://localhost:%d/', app.get('port'));
});
