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
        name: req.body['name']
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
        if (err) return next(err);
        // TODO also fetch and show followers? (not just follow*ing*)
        term.getFollowingAndOthers(function (err, following, others) {
            if (err) return next(err);
            res.render('term', {
                term: term,
                following: following,
                others: others
            });
        });
    });
};

/**
 * POST /terms/:id
 */
exports.edit = function (req, res, next) {
    Term.get(req.params.id, function (err, term) {
        if (err) return next(err);
        term.name = req.body['name'];
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
