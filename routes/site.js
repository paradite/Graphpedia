var Term = require('../models/term');
var request = require('request');
var moment = require('moment');
/*
 * GET home page.
 */

 exports.index = function(req, res){
    Term.getAll(function (err, terms) {
        // Make sure there are at least 2 terms
        if (err || terms == null || terms.length < 2) {
            console.log("error in random");
            return res.render('wrong');
        }
        var random_term_1 = terms[Math.floor(Math.random()*terms.length)];
        var random_term_2 = terms[Math.floor(Math.random()*terms.length)];
        while(random_term_2.id == random_term_1.id){
            var random_term_2 = terms[Math.floor(Math.random()*terms.length)];
        }
        //Get all the relationships
        //Heroku neo4j database
        var base_url = process.env['NEO4J_URL'] ||
        process.env['GRAPHENEDB_URL'] ||
        'http://localhost:7474'

        //Use neo4j REST API to get all relationship
        var options = {
            url: base_url + '/db/data/relationship/types',
            headers: {
                'User-Agent': 'request'
            }
        };

        function callback(error, response, body) {
            if (error || response.statusCode != 200) {
                console.log("error in neo4j API callback");
                return res.render('wrong');
            }
            var relationship_types = JSON.parse(body);

                //deal with old relationship types
                var index = relationship_types.indexOf("follows");
                if (index > -1) {
                    relationship_types.splice(index, 1);
                }
                var index = relationship_types.indexOf("contains");
                if (index > -1) {
                    relationship_types.splice(index, 1);
                }
                //Add default ones
                if(relationship_types.length < 5){
                    relationship_types = [];
                    relationship_types.push(random_term_1.REL_INCLUDE.replace(/_/g," "));
                    relationship_types.push(random_term_1.REL_IS_PART_OF.replace(/_/g," "));
                    relationship_types.push(random_term_1.REL_PREDECESSOR.replace(/_/g," "));
                    relationship_types.push(random_term_1.REL_SUCCESSOR.replace(/_/g," "));
                    relationship_types.push(random_term_1.REL_DEPEND.replace(/_/g," "));
                }

                res.render('index', {
                    user : req.user,
                    random_term_1: random_term_1,
                    random_term_2: random_term_2,
                    relationship_types: relationship_types
                });
            }
            request(options, callback);
        });
};

/*
 * POST home page.
 */

 exports.indexpost = function(req, res, next){
    res.render('index');
};


/*
 * GET contribute page.
 */

 exports.contribute = function(req, res, next){
    Term.getAll(function (err, terms) {
    // Make sure there are at least 2 terms
    if (err || terms == null || terms.length < 2) {
        console.log("error in random");
        return res.render('wrong');
    }
    var random_term_1 = terms[Math.floor(Math.random()*terms.length)];
    var random_term_2 = terms[Math.floor(Math.random()*terms.length)];
    while(random_term_2.id == random_term_1.id){
        var random_term_2 = terms[Math.floor(Math.random()*terms.length)];
    }
    var random_term_3 = terms[Math.floor(Math.random()*terms.length)];
    var random_term_4 = terms[Math.floor(Math.random()*terms.length)];
    while(random_term_3.id == random_term_4.id){
        var random_term_4 = terms[Math.floor(Math.random()*terms.length)];
    }
    var random_term_5 = terms[Math.floor(Math.random()*terms.length)];
    var random_term_6 = terms[Math.floor(Math.random()*terms.length)];
    while(random_term_5.id == random_term_6.id){
        var random_term_6 = terms[Math.floor(Math.random()*terms.length)];
    }
    var random_term_7 = terms[Math.floor(Math.random()*terms.length)];
    var random_term_8 = terms[Math.floor(Math.random()*terms.length)];
    while(random_term_8.id == random_term_7.id){
        var random_term_8 = terms[Math.floor(Math.random()*terms.length)];
    }
    var random_term_9 = terms[Math.floor(Math.random()*terms.length)];
    var random_term_10 = terms[Math.floor(Math.random()*terms.length)];
    while(random_term_10.id == random_term_9.id){
        var random_term_10 = terms[Math.floor(Math.random()*terms.length)];
    }
    
    //Get all the relationships
    //Heroku neo4j database
    var base_url = process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'

    //Use neo4j REST API to get all relationship
    var options = {
        url: base_url + '/db/data/relationship/types',
        headers: {
            'User-Agent': 'request'
        }
    };

    function callback(error, response, body) {
        if (error || response.statusCode != 200) {
            console.log("error in neo4j API callback");
            return res.render('wrong');
        }
        var relationship_types = JSON.parse(body);

            //deal with old relationship types
            var index = relationship_types.indexOf("follows");
            if (index > -1) {
                relationship_types.splice(index, 1);
            }
            var index = relationship_types.indexOf("contains");
            if (index > -1) {
                relationship_types.splice(index, 1);
            }
            //Add default ones
            if(relationship_types.length < 5){
                relationship_types = [];
                relationship_types.push(random_term_1.REL_INCLUDE.replace(/_/g," "));
                relationship_types.push(random_term_1.REL_IS_PART_OF.replace(/_/g," "));
                relationship_types.push(random_term_1.REL_PREDECESSOR.replace(/_/g," "));
                relationship_types.push(random_term_1.REL_SUCCESSOR.replace(/_/g," "));
                relationship_types.push(random_term_1.REL_DEPEND.replace(/_/g," "));
            }
            // Pass in additional info
            var info = null;
            // console.log(req.query.info);
            if(req.session.contributed){
                req.session.contributed = false;
                console.log("new relationship added");
                info = 'Relationship successfully created. Thanks for your contribution!';
            }
            res.render('contribute', {
                user : req.user,
                random_term_1: random_term_1,
                random_term_2: random_term_2,
                random_term_3: random_term_3,
                random_term_4: random_term_4,
                random_term_5: random_term_5,
                random_term_6: random_term_6,
                random_term_7: random_term_7,
                random_term_8: random_term_8,
                random_term_9: random_term_9,
                random_term_10: random_term_10,
                relationship_types: relationship_types,
                info: info
            });
        }
        request(options, callback);
    });


};


/*
POST Direct the search to the item-specific-url
*/
exports.searchinit = function(req, res){
	var name = req.body['name'];
  if(name == null){
      res.render('index');
  }
  res.redirect('/search?name=' + name);
}

/*
GET Render the path search view
*/
exports.pathrender = function(req, res){
    res.render('path');
}

/*
POST Get the ids for terms for path
*/
exports.pathinit = function(req, res){
    var name1 = req.body['name1'];
    var name2 = req.body['name2'];
    if(name1 == null || name2 == null){
        res.render('index');
    }
    res.redirect('/path?name1=' + name1 + '&name2=' + name2);
}

/*
GET Get the ids for terms for path
*/
exports.path = function(req, res){
    var name1 = req.query.name1;
    var name2 = req.query.name2;
    if(name1 == null || name2 == null){
        res.render('index');
    }
    //In case of multiple terms returned by name, use the first name
    Term.getByNames(name1, name2, function (err, terms1, terms2) {
        if (err){
            console.log('%s', "err occured");
            res.render('index');
        }
        //Matched both
        if(terms1 != null && terms2 != null && terms1.length > 0 && terms2.length > 0){
            //Find the path using two ids
            terms1[0].getPath(terms2[0], function (err, terms, relationships){
                // Parse terms and relationships for displaying
                var path_obj = parsePath(terms, relationships);
                
                if(err) console.log(err);
                console.log("terms: " + terms);
                console.log("relationships: " + relationships);
                res.render('pathdisplay',{
                    name1: name1,
                    name2: name2,
                    terms: terms,
                    relationships: relationships,
                    json: JSON.stringify(path_obj),
                });
            });
        //Not matched for either
    }else{
        if(terms1 == null || terms1.length == 0) {
            console.log('%s', "path finding fails term 1: " + name1);
            res.render('notfound', {
                name: name1
            });
        }else if(terms2 == null || terms2.length == 0) {
            console.log('%s', "path finding fails term 2: " + name2);
            res.render('notfound', {
                name: name2
            });
        };
    }
});
    function parsePath (terms, relationships){
        if(terms.length != (relationships.length + 1)){
            console.log("wrong number of terms and relationships");
            return {};
        }
        // Total count
        var term_count = terms.length;
        var relationship_count = relationships.length;
        // Current index to add
        var term_index = term_count - 1;
        var relationship_index = relationship_count - 1;
        var path_obj = {
            name: terms[term_index].name,
            description: terms[term_index].description,
        };
        term_index--;
        while(relationship_index >= 0){
            // Still have relationships, add
            
            path_obj = {
                name: relationships[relationship_index].type,
                children: [path_obj]
            }

            path_obj = {
                name: terms[term_index].name,
                description: terms[term_index].description,
                children: [path_obj]
            }
            relationship_index--;
            term_index--;
        }
        return path_obj;
    }
}

/*
GET Search a term
*/
exports.search = function(req, res){
	var name = req.query.name;
	if(name == null){
        console.log('%s', "name is null");
        res.render('index');
    }

    Term.getByName(name, function (err, terms) {
        if (err){
            console.log('%s', "err occured");
            res.render('index');
        }
        console.log('%s', "terms: " + terms);
        //Matched
        if(terms != null && terms.length > 0){
            if(terms.length > 1){
                res.render('terms',{
                    terms: terms
                });
            }else if(terms.length == 1){
                res.redirect('/terms/' + terms[0].id);
            }else{
                //This should never happen
                console.log('%s', "term not found partially");
                res.render('notfound', {
                    name: name
                });
            }
            //Not matched
        }else if(terms == null || terms.length == 0){
            console.log('%s', "before calling getByNamePartial.");
            //Instead of notfound, try partial matching
            Term.getByNamePartial(name, function (err, terms_partial) {
                console.log('%s', "inside partial callback");
                //Matched Partial
                if(terms_partial != null && terms_partial.length > 0){
                    //Show a list if partial matching finds one or more
                    //Also give option to create the term
                    if(terms_partial.length >= 1){
                        res.render('terms',{
                            terms: terms_partial,
                            name: name
                        });
                    //DO NOT Redirect if partial match only finds one
                }else if(terms_partial.length == 1){
                    res.redirect('/terms/' + terms_partial[0].id);
                }
                //Not matched
            }else{
                console.log('%s', "term not found partially");
                res.render('notfound', {
                    name: name
                });
            }
        });
            //This should never happen
        }else{
            console.log('%s', "term not found but not null or empty?");
            res.render('notfound', {
                name: name
            });
        }
    });
}

/*
 * GET home page.
 */

exports.wrong = function(req, res){
    res.render('wrong');
};


/**
 * POST /suggest
 */
exports.suggest = function (req, res, next) {
    // console.log('here');
    Term.get(req.body.random_term_1.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.random_term_2.id, function (err, other) {
            if (err) return next(err);
            term.custom(other, req.body.relationship.name.replace(/ /g,"_"), function (err) {
                if (err) return next(err);
                term.last_modified_at = moment().format();
                term.save(function (err) {
                    if (err) return next(err);
                    req.session.suggested = true;
                    res.redirect('/terms/' + req.body.random_term_1.id);
                });
            });
        });
    });
};

/**
 * POST /contribute
 */
exports.contributeadd = function (req, res, next) {
    // console.log('here');
    Term.get(req.body.random_term_1.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.random_term_2.id, function (err, other) {
            if (err) return next(err);
            term.custom(other, req.body.relationship.name.replace(/ /g,"_"), function (err) {
                if (err) return next(err);
                term.last_modified_at = moment().format();
                term.save(function (err) {
                    if (err) return next(err);
                    req.session.contributed = true;
                    res.redirect('/contribute');
                });
            });
        });
    });
};
