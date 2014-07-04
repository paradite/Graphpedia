// terms.js
// Routes to CRUD terms.
var request = require('request');
var Term = require('../models/term');

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
 * POST /terms
 */
exports.create = function (req, res, next) {
    Term.create({
        name: req.body['name'],
        description: req.body['description']
    }, function (err, term) {
        if (err) return next(err);
        console.log("in create");
        req.session.create = true;
        res.redirect('/terms/' + term.id);
    });
};

/**
 * GET /terms/:id
 */
 exports.show = function (req, res, next) {
    console.log("in show");
    Term.get(req.params.id, function (err, term) {
        //console.log('%s', term.description + " " + term.name);
        if (err) {
            console.log("error in show");
            return res.render('wrong');
        }
        console.log("after show");
        term.getOutgoingAndOthers(function (err, including, is_part_of, all_others) {
            if (err) return next(err);
            var including_list = term.parse(including);
            var is_part_of_list = term.parse(is_part_of);
            var including_obj = new Object();
            var is_part_of_obj = new Object();
            including_obj.name = term.REL_INCLUDE;
            including_obj.children = including_list;

            is_part_of_obj.name = term.REL_IS_PART_OF.replace(/_/g," ");
            is_part_of_obj.children = is_part_of_list;

            var term_obj = new Object();
            term_obj.name = term.name;
            term_obj.children = [];
            term_obj.children.push(is_part_of_obj);
            term_obj.children.push(including_obj);

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
                if (!error && response.statusCode == 200) {
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
                    console.log(term.REL_INCLUDE+' '+term.REL_IS_PART_OF);
                    //Add default ones
                    if(relationship_types.length < 2){
                        relationship_types = [];
                        relationship_types.push(term.REL_INCLUDE.replace(/_/g," "));
                        relationship_types.push(term.REL_IS_PART_OF.replace(/_/g," "));
                    }

                    var types = "";

                    relationship_types.forEach(function(item) { 
                        types+= item;
                        types+= " ";
                    });
                    console.log("There are "+relationship_types.length+" relationships types: " + types);
                    //console.log(all_others);
                    //console.log('%s', JSON.stringify(term_obj));
                    //Force user to update when newly created
                    if(req.session.create) {
                        res.statusCode = 201;
                        req.session.create = false;
                    }
                    res.render('term', {
                        json: JSON.stringify(term_obj),
                        term: term,
                        is_part_of: is_part_of,
                        including: including,
                        all_others: all_others,
                        relationship_types: relationship_types
                    });
                }
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
        console.log("before id= "+ term.id);
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
                res.redirect('/terms/' + term.id);
            });
        });
    });
};

/**
 * POST /terms/:id/uncustom
 */
exports.uncustom = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.uncustom(other, req.body.relationship.name.replace(/ /g,"_"), function (err) {
                if (err) return next(err);
                res.redirect('/terms/' + term.id);
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

