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
        term.getOutgoingAndOthers(function (err, containing, part_of, all_others) {
            if (err) return next(err);
            var containing_list = term.parse(containing);
            var part_of_list = term.parse(following);
            var containing_obj = new Object();
            var part_of_obj = new Object();
            containing_obj.name = Term.REL_INCLUDE;
            containing_obj.children = containing_list;

            part_of_obj.name = Term.REL_IS_PART_OF;
            part_of_obj.children = following_list;

            var term_obj = new Object();
            term_obj.name = term.name;
            term_obj.children = [];
            term_obj.children.push(part_of_obj);
            term_obj.children.push(containing_obj);

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
                        containing: containing,
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
                containing: this_containing,
                containing_others: this_containing_others
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
 * POST /terms/:id/follow
 */
exports.follow = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.follow(other, function (err) {
                if (err) return next(err);
                res.redirect('/terms/' + term.id);
            });
        });
    });
};

/**
 * POST /terms/:id/unfollow
 */
exports.unfollow = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        Term.get(req.body.term.id, function (err, other) {
            if (err) return next(err);
            term.unfollow(other, function (err) {
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
