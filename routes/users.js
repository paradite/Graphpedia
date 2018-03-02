// users.js
// Routes to CRUD users.

const User = require('../models/user');

/**
 * GET /users
 */
exports.list = function (req, res, next) {
  User.getAll((err, users) => {
    if (err) return next(err);
    res.render('users', {
      users,
    });
  });
};

/**
 * POST /users
 */
exports.create = function (req, res, next) {
  User.create({
    name: req.body.name,
  }, (err, user) => {
    if (err) return next(err);
    res.redirect(`/users/${user.id}`);
  });
};

/**
 * GET /users/:id
 */
exports.show = function (req, res, next) {
  User.get(req.params.id, (err, user) => {
    if (err) return next(err);
    // TODO also fetch and show followers? (not just follow*ing*)
    user.getFollowingAndOthers((err, following, others) => {
      if (err) return next(err);
      res.render('user', {
        user,
        following,
        others,
      });
    });
  });
};

/**
 * POST /users/:id
 */
exports.edit = function (req, res, next) {
  User.get(req.params.id, (err, user) => {
    if (err) return next(err);
    user.name = req.body.name;
    user.save((err) => {
      if (err) return next(err);
      res.redirect(`/users/${user.id}`);
    });
  });
};

/**
 * DELETE /users/:id
 */
exports.del = function (req, res, next) {
  User.get(req.params.id, (err, user) => {
    if (err) return next(err);
    user.del((err) => {
      if (err) return next(err);
      res.redirect('/users');
    });
  });
};

/**
 * POST /users/:id/follow
 */
exports.follow = function (req, res, next) {
  User.get(req.params.id, (err, user) => {
    if (err) return next(err);
    User.get(req.body.user.id, (err, other) => {
      if (err) return next(err);
      user.follow(other, (err) => {
        if (err) return next(err);
        res.redirect(`/users/${user.id}`);
      });
    });
  });
};

/**
 * POST /users/:id/unfollow
 */
exports.unfollow = function (req, res, next) {
  User.get(req.params.id, (err, user) => {
    if (err) return next(err);
    User.get(req.body.user.id, (err, other) => {
      if (err) return next(err);
      user.unfollow(other, (err) => {
        if (err) return next(err);
        res.redirect(`/users/${user.id}`);
      });
    });
  });
};
