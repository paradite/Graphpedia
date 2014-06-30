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
        res.redirect('/terms/' + term.id);
    });
};

/**
 * GET /terms/:id
 */
 exports.show = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        //console.log('%s', term.description + " " + term.name);
        if (err) return next(err);
        term.getOutgoingAndOthers(function (err, including, is_part_of, all_others) {
            if (err) return next(err);
            var including_list = term.parse(including);
            var part_of_list = term.parse(is_part_of);
            var including_obj = new Object();
            var part_of_obj = new Object();
            including_obj.name = Term.REL_INCLUDE;
            including_obj.children = including_list;

            part_of_obj.name = "is part of";
            part_of_obj.children = following_list;

            var term_obj = new Object();
            term_obj.name = term.name;
            term_obj.children = [];
            term_obj.children.push(part_of_obj);
            term_obj.children.push(including_obj);

            //Use neo4j REST API to get all relationship
            var options = {
                url: 'http://127.0.0.1:7474/db/data/relationship/types',
                headers: {
                    'User-Agent': 'request'
                }
            };

            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var relationship_types = JSON.parse(body);
                    var types = "";
                    relationship_types.forEach(function(item) { 
                        types+= item;
                        types+= " ";
                    });
                    console.log("There are "+relationship_types.length+" relationships types: " + types);
                    console.log(all_others);
                    console.log('%s', JSON.stringify(term_obj));
                    res.render('term', {
                        json: JSON.stringify(term_obj),
                        term: term,
                        part_of: part_of,
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
        if (err) return next(err);
        term.del(function (err) {
            if (err) return next(err);
            res.redirect('/terms');
        });
    });
};

/**
 * POST /terms/:id/part_of
 */
exports.part_of = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.part_of(other, function (err) {
                if (err) return next(err);
                res.redirect('/terms/' + term.id);
            });
        });
    });
};

/**
 * POST /terms/:id/unpart_of
 */
exports.unpart_of = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.unpart_of(other, function (err) {
                if (err) return next(err);
                res.redirect('/terms/' + term.id);
            });
        });
    });
};

/**
 * POST /terms/:id/contain
 */
exports.contain = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.contain(other, function (err) {
                if (err) return next(err);
                res.redirect('/terms/' + term.id);
            });
        });
    });
};

/**
 * POST /terms/:id/uncontain
 */
exports.uncontain = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.uncontain(other, function (err) {
                if (err) return next(err);
                res.redirect('/terms/' + term.id);
            });
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
            term.custom(other, req.body.relationship.name, function (err) {
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
            term.uncustom(other, req.body.relationship.name, function (err) {
                if (err) return next(err);
                res.redirect('/terms/' + term.id);
            });
        });
    });
};
