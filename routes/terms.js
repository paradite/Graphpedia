// terms.js
// Routes to CRUD terms.

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
        console.log('%s', term.description + " " + term.name);
        if (err) return next(err);
        term.getOutgoingAndOthers(function (err, containing, containing_others, following, following_others) {
            if (err) return next(err);
            res.render('term', {
                json: "{}",
                term: term,
                following: following,
                following_others: following_others,
                containing: containing,
                containing_others: containing_others
            });
        });
    });
}
/**
 * GET /terms/:id/json
 */
 exports.show_json = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        console.log('%s', term.description + " " + term.name + " send json");
        if (err) return next(err);
        res.json([{"name":"Corey","follows":["Adel","James"]},{"name":"Andrey","follows":["Pinaki","Pramod","Max"]},{"name":"Pinaki","follows":["Max","Rob","Agam","Ryan","Helene"]},{"name":"Bruce","follows":["Rob","Lester"]},{"name":"James","follows":["Agam","Pinaki","Corey","Tim","Bruce"]},{"name":"Helene","follows":["Ben"]},{"name":"Peter","follows":["Agam","Mark","Musannif","Ryan","Ben"]},{"name":"Max","follows":["Mark","Adel"]},{"name":"Ben","follows":["Rob","Prasanna","Anne","James"]},{"name":"Ryan","follows":["Adel","Prasanna","Pinaki","James","Lester"]},{"name":"Rob","follows":["James","Max"]},{"name":"Prasanna","follows":["Andrey","Bruce","Mark"]},{"name":"Pramod","follows":["Ryan","Tim","Agam","Anne"]},{"name":"Mark","follows":["Max","Lester","Peter","Pinaki"]},{"name":"Agam","follows":["Ryan","Corey"]},{"name":"Musannif","follows":["Tim","Pinaki","Helene"]},{"name":"Lester","follows":["Pramod"]},{"name":"Adel","follows":["Prasanna","Andrey","Helene","Mark"]},{"name":"Anne","follows":["Bruce"]},{"name":"Tim","follows":["Bruce","Musannif","Adel","Lester"]}]);
    });
};

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
    console.log('%s', "Term deleted");
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
