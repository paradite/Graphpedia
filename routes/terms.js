// terms.js
// Routes to CRUD terms.
var request = require('request');
var Term = require('../models/term');
var moment = require('moment');

/**
 * GET /terms
 */
exports.list = function (req, res, next) {
    Term.getAll(function (err, terms) {
        if (err) return next(err);
        res.render('terms', {
            terms: terms
        });
    });
};

/**
 *GET /random_term
 *Method to get a random term
 *Author: Zhu Liang
 *Date: 12 July
 */
exports.random_term = function (req, res, next) {
    Term.getAll(function (err, terms) {
        if (err || terms == null) {
            console.log("error in random");
            return res.render('wrong');
        }
        var random_term = terms[Math.floor(Math.random()*terms.length)];
        res.redirect('/terms/' + random_term.id);
    });
};

/**
 * POST /terms
 */
//Save the name, lower case name, description, creation time, last viewed, last modified
//Prevent creating the term if the term with the same name(ignore cases) already exists
exports.create = function (req, res, next) {
    var current_time = moment().format();
    Term.getByName(req.body['name'], function (err, terms) {
        if (err){
            console.log('%s', "err occured");
            res.render('index');
        }
        console.log('%s', "trying to create: " + req.body['name'] + ". found in database? " + terms);
        //Matched
        if(terms != null && terms.length > 0){
            if(terms.length > 1){
                res.render('terms',{
                    terms: terms,
                    info: "The term already exists."
                });
            }else if(terms.length == 1){
                //Toggle session to signal already existed term
                req.session.already = true;
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
            console.log('%s', "The term does not exist yet. Ready to create.");
            //Create the term
            console.log("time for creation of " + req.body['name'] + ": " + current_time);
            Term.create({
                name: req.body['name'],
                description: req.body['description'],
                //Save a lower case name of the term for search matching
                name_lower_case: req.body['name'].toLowerCase(),
                created_at: current_time,
                last_viewed_at: current_time,
                last_modified_at: current_time
            }, function (err, term) {
                if (err) return next(err);
                req.session.create = true;
                res.redirect('/terms/' + term.id);
            });

            //This should never happen
        }else{
            console.log('%s', "term not found but not null or empty?");
            res.render('notfound', {
                name: name
            });
        }
    });

};

/**
 * GET /terms/:id
 */
//Add the new fields for old terms when they are requested

exports.show = function (req, res, next) {
    // Check if the user is logged in
    // console.log(req.user);
    // console.log(req.user != null);
    var logged_in = (req.user != null);
    console.log("user logged in: " + logged_in);
    Term.get(req.params.id, function (err, term) {
        //console.log('%s', term.description + " " + term.name);
        if (err) {
            console.log("error in show");
            return res.render('wrong');
        }
        if(!term.created_at){
            term.created_at = moment().format();
        }
        if(!term.last_modified_at){
            term.last_modified_at = moment().format();
        }
        //Update the last_viewed_at anyway
        term.last_viewed_at = moment().format();
        term.save(function (err) {
            if (err) return next(err);
            // res.redirect('/terms/' + term.id);
        });
        term.getOutgoingAndOthers(function (err, all_others, rel_names, rel_terms) {
            if (err) return next(err);
            //Parse all related terms
            var terms_list = term.parse(rel_terms);
            //Generate list for d3.js
            var including_list = [];
            var is_part_of_list = [];
            var is_successor_of_list = [];
            var is_predecessor_of_list = [];
            var depend_list = [];

            // Generate list for jade with id
            var including_list_full = [];
            var is_part_of_list_full = [];
            var is_successor_of_list_full = [];
            var is_predecessor_of_list_full = [];
            var depend_list_full = [];
            

            for (var i = rel_terms.length - 1; i >= 0; i--) {
                if (rel_names[i] == term.REL_INCLUDE) {
                    including_list.push(terms_list[i]);
                    including_list_full.push(rel_terms[i]);
                    
                }else if(rel_names[i] == term.REL_DEPEND){
                    depend_list.push(terms_list[i]);
                    depend_list_full.push(rel_terms[i]);

                }else if(rel_names[i] == term.REL_PREDECESSOR){
                    is_predecessor_of_list.push(terms_list[i]);
                    is_predecessor_of_list_full.push(rel_terms[i]);

                }else if(rel_names[i] == term.REL_SUCCESSOR){
                    is_successor_of_list.push(terms_list[i]);
                    is_successor_of_list_full.push(rel_terms[i]);

                }else if(rel_names[i] == term.REL_IS_PART_OF){
                    is_part_of_list.push(terms_list[i]);
                    is_part_of_list_full.push(rel_terms[i]);
                }   
            };

            //Create JSON objects for d3.js rendering
            var including_obj = new Object();
            var is_part_of_obj = new Object();
            var is_successor_of_obj = new Object();
            var is_predecessor_of_obj = new Object();
            var depend_obj = new Object();

            including_obj.name = term.REL_INCLUDE.replace(/_/g," ");
            including_obj.children = including_list;

            is_part_of_obj.name = term.REL_IS_PART_OF.replace(/_/g," ");
            is_part_of_obj.children = is_part_of_list;

            is_successor_of_obj.name = term.REL_SUCCESSOR.replace(/_/g," ");
            is_successor_of_obj.children = is_successor_of_list;

            is_predecessor_of_obj.name = term.REL_PREDECESSOR.replace(/_/g," ");
            is_predecessor_of_obj.children = is_predecessor_of_list;

            depend_obj.name = term.REL_DEPEND.replace(/_/g," ");
            depend_obj.children = depend_list;

            // var including_list = term.parse(including);
            // var is_part_of_list = term.parse(is_part_of);

            // var term_obj = new Object();
            var term_obj = {
                name: term.name,
                description: term.description,
                children: []
            };
            term_obj.children.push(is_part_of_obj);
            term_obj.children.push(including_obj);
            term_obj.children.push(is_successor_of_obj);
            term_obj.children.push(is_predecessor_of_obj);
            term_obj.children.push(depend_obj);

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
                    relationship_types.push(term.REL_INCLUDE.replace(/_/g," "));
                    relationship_types.push(term.REL_IS_PART_OF.replace(/_/g," "));
                    relationship_types.push(term.REL_PREDECESSOR.replace(/_/g," "));
                    relationship_types.push(term.REL_SUCCESSOR.replace(/_/g," "));
                    relationship_types.push(term.REL_DEPEND.replace(/_/g," "));
                }

                var types = "";

                relationship_types.forEach(function(item) { 
                    types+= item;
                    types+= " ";
                });
                //console.log("There are "+relationship_types.length+" relationships types: " + types);
                //console.log(all_others);
                //console.log('%s', JSON.stringify(term_obj));
                //Force user to update when newly created
                // Pass in additional info when newly created
                var info = null;
                if(req.session.create) {
                    res.statusCode = 201;
                    req.session.create = false;
                    console.log("new term created");
                    info = 'New term added. Thanks for your contribution!';
                }
                if(req.session.suggested) {
                    res.statusCode = 201;
                    req.session.suggested = false;
                    console.log("new relationship created");
                    info = 'New relationship added. Thanks for your contribution!';
                }
                if(req.session.already) {
                    req.session.already = false;
                    console.log("Redirection due to term already exists");
                    info = 'The term '+ term.name +' already exists.';
                }
                //Format the moment time for display purposes
                var created_at = moment(term.created_at).zone('+0800').format("YYYY-MM-DD HH:mm:ss");
                var last_modified_at = moment(term.last_modified_at).zone('+0800').format("YYYY-MM-DD HH:mm:ss");
                var last_viewed_at = moment(term.last_viewed_at).zone('+0800').format("YYYY-MM-DD HH:mm:ss");

                //Get recent terms for sidebar
                Term.getRecent(function (err, recent_terms) {
                    if (err) return next(err);
                    res.render('term', {
                        logged_in: logged_in,
                        json: JSON.stringify(term_obj),
                        term: term,
                        created_at: created_at,
                        last_modified_at: last_modified_at,
                        last_viewed_at: last_viewed_at,
                        is_part_of: is_part_of_list_full,
                        including: including_list_full,
                        depend: depend_list_full,
                        successor: is_successor_of_list_full,
                        predecessor: is_predecessor_of_list_full,
                        all_others: all_others,
                        relationship_types: relationship_types,
                        terms: recent_terms,
                        info: info
                    });
                });
            }
            request(options, callback);
        });
});
}

/**
 * POST /terms/:id
 */
exports.edit = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        term.name = req.body['name'];
        term.description = req.body['description'];
        //Update the term's lower case name
        term.name_lower_case = req.body['name'].toLowerCase();
        term.last_modified_at = moment().format();
        term.save(function (err) {
            if (err) return next(err);
            res.redirect('/terms/' + term.id);
        });
    });
};

/**
 * DELETE /terms/:id
 */
exports.del = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        term.del(function (err) {
            if (err) return next(err);
            res.redirect('/terms');
        });
    });
};

/**
 * POST /terms/:id/custom
 */
exports.custom = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.custom(other, req.body.relationship.name.replace(/ /g,"_"), function (err) {
                if (err) return next(err);
                term.last_modified_at = moment().format();
                term.save(function (err) {
                    if (err) return next(err);
                    res.redirect('/terms/' + term.id);
                });
            });
        });
    });
};

/**
 * POST /terms/:id/uncustom
 */
exports.uncustom = function (req, res, next) {
    console.log(req.params.id + " and " + req.body.term.id + "and " + req.body.relationship.name.replace(/ /g,"_"));
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.uncustom(other, req.body.relationship.name.replace(/ /g,"_"), function (err) {
                if (err) return next(err);
                term.last_modified_at = moment().format();
                term.save(function (err) {
                    if (err) return next(err);
                    res.redirect('/terms/' + term.id);
                });
            });
        });
    });
};

/**
 * POST /terms/:id/newcustom
 */
exports.newcustom = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.create({
            name: req.body['name'],
            description: req.body['description']
        }, function (err, new_term) {
            if (err) return next(err);
            term.custom(new_term, req.body.relationship.name.replace(/ /g,"_"), function (err) {
                if (err) return next(err);
                res.redirect('/terms/' + term.id);
            });
        });    
    });
};

// /**
//  * POST /terms/:id/is_part_of
//  */
// exports.is_part_of = function (req, res, next) {
//     Term.get(req.params.id, function (err, term) {
//         if (err) return next(err);
//         Term.get(req.body.term.id, function (err, other) {
//             if (err) return next(err);
//             term.is_part_of(other, function (err) {
//                 if (err) return next(err);
//                 res.redirect('/terms/' + term.id);
//             });
//         });
//     });
// };

// /**
//  * POST /terms/:id/unis_part_of
//  */
// exports.unis_part_of = function (req, res, next) {
//     Term.get(req.params.id, function (err, term) {
//         if (err) return next(err);
//         Term.get(req.body.term.id, function (err, other) {
//             if (err) return next(err);
//             term.unis_part_of(other, function (err) {
//                 if (err) return next(err);
//                 res.redirect('/terms/' + term.id);
//             });
//         });
//     });
// };

// /**
//  * POST /terms/:id/contain
//  */
// exports.contain = function (req, res, next) {
//     Term.get(req.params.id, function (err, term) {
//         if (err) return next(err);
//         Term.get(req.body.term.id, function (err, other) {
//             if (err) return next(err);
//             term.contain(other, function (err) {
//                 if (err) return next(err);
//                 res.redirect('/terms/' + term.id);
//             });
//         });
//     });
// };

// /**
//  * POST /terms/:id/uncontain
//  */
// exports.uncontain = function (req, res, next) {
//     Term.get(req.params.id, function (err, term) {
//         if (err) return next(err);
//         Term.get(req.body.term.id, function (err, other) {
//             if (err) return next(err);
//             term.uncontain(other, function (err) {
//                 if (err) return next(err);
//                 res.redirect('/terms/' + term.id);
//             });
//         });
//     });
// };*/*/

/*        // TODO also fetch and show followers? (not just follow*ing*)
        //Get the followers and non-followers
        term.getFollowingAndOthers(function (err, following, following_others) {
            if (err) return next(err);
            this_following = following;
            this_following_others = following_others;
            res.render('term', {
                term: term,
                following: following,
                following_others: following_others,
                including: this_including,
                including_others: this_including_others
            });
        });*/

