var Term = require('../models/term');
var request = require('request');
var moment = require('moment');
var Relationship = require('../models/relationship');
/*
 * GET home page.
 */

 exports.index = function(req, res){
    // Construct model instance
    var relationship = new Relationship();
    // Get the relationship types
    var relationship_types = relationship.getAll();
    Term.getRelationshipCount(function (err, count){
        if (err) {
            console.log("getRelationshipCount wrong");
        }
        Term.getCount(function (err, results) {
            if (err) {
                console.log("get Count wrong");
            }
            // Get the terms with least number of relationships for suggestions
            Term.getAlone(function (err, alone_terms, alone_rel_counts){
                if (err) {
                    console.log("getAlone wrong");
                }
                for (var i = 0; i < alone_terms.length; i++) {
                    alone_terms[i].rel_count = alone_rel_counts[i];
                    // console.log("Alone term: " + alone_terms[i].name + alone_terms[i].rel_count);
                };
                var ratio = count / results;
                res.render('index', {
                    ratio: ratio.toFixed(3),
                    term_count: results,
                    rel_count: count,
                    alone_terms: alone_terms,
                    user : req.user,
                    relationship_types: relationship_types
                }); 
            });  
        });    
    });

    // Term.getAll(function (err, terms) {
    //     // Make sure there are at least 2 terms
    //     if (err || terms == null || terms.length < 2) {
    //         console.log("error in random");
    //         return res.render('wrong');
    //     }
    //     var random_term_1 = terms[Math.floor(Math.random()*terms.length)];
    //     var random_term_2 = terms[Math.floor(Math.random()*terms.length)];
    //     while(random_term_2.id == random_term_1.id){
    //         var random_term_2 = terms[Math.floor(Math.random()*terms.length)];
    //     }

    // });
};

/*
 * POST home page.
 */

 exports.indexpost = function(req, res, next){
    res.render('index');
};

/*
 * GET About page.
 */

 exports.about = function(req, res, next){
    res.render('about');
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
        // Fisher-Yates (aka Knuth) Shuffle to generate random terms
        function shuffle(array) {
          var currentIndex = array.length
          , temporaryValue
          , randomIndex
          ;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }
        terms = shuffle(terms);
        if(terms.length > 20){
            terms = terms.slice(0, 18);
        }
        console.log(terms.length);
        // console.log(terms[5].id);
        var random_term_1 = terms[0];
        var random_term_2 = terms[1];
        var random_term_3 = terms[2];
        var random_term_4 = terms[3];
        var random_term_5 = terms[4];
        var random_term_6 = terms[5];
        var random_term_7 = terms[6];
        var random_term_8 = terms[7];
        var random_term_9 = terms[8];
        var random_term_10 = terms[9];

        // Construct model instance
        var relationship = new Relationship();
        // Get the relationship types
        var relationship_types = relationship.getAll();
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
            terms: terms,
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
                var path_obj = parsePath(req, terms, relationships);
                
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
    function parsePath (req, terms, relationships){
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
            term_url: req.get('Host') + "/terms/" + terms[term_index].id
        };
        term_index--;
        while(relationship_index >= 0){
            // Still have relationships, add
            
            path_obj = {
                name: relationships[relationship_index].type.replace(/_/g," "),
                children: [path_obj]
            }

            path_obj = {
                name: terms[term_index].name,
                description: terms[term_index].description,
                term_url: req.get('Host') + "/terms/" + terms[term_index].id,
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
                //Trim the length of the name
            }else{
                console.log('%s', "term not found partially");
                res.render('notfound', {
                    name: name.substring(0,25)
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
