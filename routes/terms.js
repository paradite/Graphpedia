// terms.js
// Routes to CRUD terms.
const request = require('request');
const Term = require('../models/term');
const moment = require('moment');
const Relationship = require('../models/relationship');
/**
 * GET /terms
 */
exports.list = function (req, res, next) {
  Term.getAll((err, terms) => {
    if (err) return next(err);
    res.render('terms', {
      user: req.user,
      terms,
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
  Term.getAll((err, terms) => {
    if (err || terms == null) {
      console.log('error in random');
      return res.render('wrong', {
        user: req.user,
      });
    }
    const random_term = terms[Math.floor(Math.random() * terms.length)];
    res.redirect(`/terms/${random_term.id}`);
  });
};

/**
 * POST /terms
 */
// Save the name, lower case name, description, creation time, last viewed, last modified
// Prevent creating the term if the term with the same name(ignore cases) already exists
exports.create = function (req, res, next) {
  const logged_in = (req.user != null);
  if (!logged_in) {
    return res.render('create_disabled', {
      user: req.user,
    });
  }
  const current_time = moment().format();
  Term.getByName(req.body.name, (err, terms) => {
    if (err) {
      console.log(err);
      return res.redirect('/');
    }
    console.log('%s', `trying to create: ${req.body.name}. found in database? ${terms}`);
    // Matched
    if (terms != null && terms.length > 0) {
      if (terms.length > 1) {
        res.render('terms', {
          user: req.user,
          terms,
          info: 'The term already exists.',
        });
      } else if (terms.length == 1) {
        // Toggle session to signal already existed term
        req.session.already = true;
        res.redirect(`/terms/${terms[0].id}`);
      } else {
        // This should never happen
        console.log('%s', 'term not found partially');
        res.render('notfound', {
          user: req.user,
          name,
        });
      }
      // Not matched
    } else if (terms == null || terms.length == 0) {
      console.log('%s', 'The term does not exist yet. Ready to create.');
      // Create the term
      console.log(`time for creation of ${req.body.name}: ${current_time}`);
      Term.create({
        name: req.body.name,
        description: req.body.description,
        // Save a lower case name of the term for search matching
        name_lower_case: req.body.name.toLowerCase(),
        created_at: current_time,
        last_viewed_at: current_time,
        last_modified_at: current_time,
      }, (err, term) => {
        if (err) return next(err);
        req.session.create = true;
        res.redirect(`/terms/${term.id}`);
      });

      // This should never happen
    } else {
      console.log('%s', 'term not found but not null or empty?');
      res.render('notfound', {
        user: req.user,
        name,
      });
    }
  });
};

/**
 * GET /terms/:id
 */
// Add the new fields for old terms when they are requested

exports.show = function (req, res, next) {
  // Check if the user is logged in
  // console.log(req.user);
  // console.log(req.user != null);
  const logged_in = (req.user != null);
  console.log(`user logged in: ${logged_in}`);
  Term.get(req.params.id, (err, term) => {
    // console.log('%s', term.description + " " + term.name);
    if (err) {
      console.log('error in show');
      return res.render('wrong', {
        user: req.user,
      });
    }

    // Add the missing fields
    if (!term.created_at) {
      term.created_at = moment().format();
    }
    if (!term.last_modified_at) {
      term.last_modified_at = moment().format();
    }
    // Update the last_viewed_at anyway
    term.last_viewed_at = moment().format();

    // Save the additional fields
    term.save((err) => {
      if (err) return next(err);
      // res.redirect('/terms/' + term.id);
    });
    term.getOutgoingAndOthers((err, all_others, rel_names, rel_terms) => {
      if (err) return next(err);

      // Construct model instance
      const relationship = new Relationship();
      // Get the relationship types
      const relationship_types = relationship.getAll();

      // Parse all related terms for d3.js
      const terms_list = term.parse(req, rel_terms);

      // Set up the 2D array for d3 with [rel index][term object]
      const d3_list = new Array(relationship_types.length);
      for (var i = 0; i < d3_list.length; i++) {
        d3_list[i] = [];
      }
      // Set up another 2D array for jade to render
      const jade_list = new Array(relationship_types.length);
      for (var i = 0; i < jade_list.length; i++) {
        jade_list[i] = [];
      }

      // Generate list for jade with id
      const including_list_full = [];
      const is_part_of_list_full = [];
      const is_successor_of_list_full = [];
      const is_predecessor_of_list_full = [];
      const depend_list_full = [];
      const related_list_full = [];
      const synonym_list_full = [];
      const supports_list_full = [];


      for (var i = rel_terms.length - 1; i >= 0; i--) {
        // console.log("d3 term list: " + terms_list[i].name + relationship.getIndex(rel_names[i]));
        d3_list[relationship.getIndex(rel_names[i])].push(terms_list[i]);
        jade_list[relationship.getIndex(rel_names[i])].push(rel_terms[i]);
        if (rel_names[i] == relationship.INC) {
          including_list_full.push(rel_terms[i]);
        } else if (rel_names[i] == relationship.DEP) {
          depend_list_full.push(rel_terms[i]);
        } else if (rel_names[i] == relationship.PRE) {
          is_predecessor_of_list_full.push(rel_terms[i]);
        } else if (rel_names[i] == relationship.SUC) {
          is_successor_of_list_full.push(rel_terms[i]);
        } else if (rel_names[i] == relationship.PAR) {
          is_part_of_list_full.push(rel_terms[i]);
        } else if (rel_names[i] == relationship.REL) {
          related_list_full.push(rel_terms[i]);
        } else if (rel_names[i] == relationship.SYN) {
          synonym_list_full.push(rel_terms[i]);
        } else if (rel_names[i] == relationship.SUP) {
          supports_list_full.push(rel_terms[i]);
        }
      }
      // console.log(d3_list);
      // console.log(jade_list);
      // Transform the array into array of objects following d3.js syntax
      const obj_array = new Array(d3_list.length);
      for (var i = 0; i < obj_array.length; i++) {
        obj_array[i] = {
          name: relationship_types[i],
          children: d3_list[i],
        };
      }
      // console.log("list: " + d3_list);
      // Remove the relationship if it has 0 outgoing terms, to save space in the visualization
      let dynamic_length = obj_array.length;
      for (var i = 0; i < dynamic_length; i++) {
        if (d3_list[i] == null || d3_list[i].length == 0) {
          // console.log("list " + i + ": " + d3_list[i]);
          obj_array.splice(i, 1);
          d3_list.splice(i, 1);
          i--;
          dynamic_length--;
        }
      }
      // console.log(JSON.stringify(obj_array));
      // Create actual JSON object for d3.js rendering

      const term_obj = {
        name: term.name,
        description: term.description,
        children: obj_array,
      };

      // Pass in additional info when newly created
      let info = null;
      // Add default info
      const tips = ['Click on the relationship to hide the terms inside',
        'Click on the term to go to the relevant page',
        'The reverse relationship is automatically added when you create a new relationship',
      ];
      info = `Tip: ${tips[Math.floor(Math.random() * tips.length)]}`;
      if (req.session.create) {
        res.statusCode = 201;
        req.session.create = false;
        console.log('new term created');
        info = 'New term added. Thanks for your contribution!';
      }
      if (req.session.suggested) {
        res.statusCode = 201;
        req.session.suggested = false;
        console.log('new relationship created');
        info = 'New relationship added. Thanks for your contribution!';
      }
      if (req.session.already) {
        req.session.already = false;
        console.log('Redirection due to term already exists');
        info = `The term ${term.name} already exists.`;
      }
      // Format the moment time for display purposes
      const created_at = moment(term.created_at).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss');
      const last_modified_at = moment(term.last_modified_at).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss');
      const last_viewed_at = moment(term.last_viewed_at).utcOffset('+0800').format('YYYY-MM-DD HH:mm:ss');

      // Get recent terms for sidebar
      Term.getRecent((err, recent_terms) => {
        if (err) return next(err);
        res.render('term', {
          user: req.user,
          logged_in,
          json: JSON.stringify(term_obj),
          term,
          created_at,
          last_modified_at,
          last_viewed_at,
          is_part_of: is_part_of_list_full,
          including: including_list_full,
          depend: depend_list_full,
          successor: is_successor_of_list_full,
          predecessor: is_predecessor_of_list_full,
          related: related_list_full,
          synonym: synonym_list_full,
          support: supports_list_full,
          all_others,
          relationship_types,
          relationship,
          recent_terms,
          info,
        });
      });
    });
  });
};

/**
 * POST /terms/:id
 */
exports.edit = function (req, res, next) {
  const logged_in = (req.user != null);
  if (!logged_in) {
    return res.render('create_disabled', {
      user: req.user,
    });
  }
  Term.get(req.params.id, (err, term) => {
    if (err) return next(err);
    term.name = req.body.name;

    // Update the term's lower case name
    // Check if input is null
    if (req.body.name != null && req.body.name != '') {
      term.name_lower_case = req.body.name.toLowerCase();
    }
    if (req.body.description != null && req.body.description != '') {
      term.description = req.body.description;
    }
    term.last_modified_at = moment().format();
    term.save((err) => {
      if (err) return next(err);
      res.redirect(`/terms/${term.id}`);
    });
  });
};

/**
 * DELETE /terms/:id
 */
exports.del = function (req, res, next) {
  const logged_in = (req.user != null);
  if (!logged_in) {
    return res.render('create_disabled', {
      user: req.user,
    });
  }
  Term.get(req.params.id, (err, term) => {
    if (err) return next(err);
    term.del((err) => {
      if (err) return next(err);
      res.redirect('/terms');
    });
  });
};

/**
 * POST /terms/:id/custom
 */
exports.custom = function (req, res, next) {
  Term.get(req.params.id, (err, term) => {
    if (err) return next(err);
    Term.get(req.body.term.id, (err, other) => {
      if (err) return next(err);
      term.custom(other, req.body.relationship.name.replace(/ /g, '_'), (err) => {
        if (err) return next(err);
        term.last_modified_at = moment().format();
        term.save((err) => {
          if (err) return next(err);
          other.last_modified_at = moment().format();
          other.save((err) => {
            if (err) return next(err);
            res.redirect(`/terms/${term.id}`);
          });
        });
      });
    });
  });
};

/**
 * POST /terms/:id/uncustom
 */
exports.uncustom = function (req, res, next) {
  console.log(`${req.params.id} and ${req.body.term.id}and ${req.body.relationship.name.replace(/ /g, '_')}`);
  Term.get(req.params.id, (err, term) => {
    if (err) return next(err);
    Term.get(req.body.term.id, (err, other) => {
      if (err) return next(err);
      term.uncustom(other, req.body.relationship.name.replace(/ /g, '_'), (err) => {
        if (err) return next(err);
        term.last_modified_at = moment().format();
        term.save((err) => {
          if (err) return next(err);
          res.redirect(`/terms/${term.id}`);
        });
      });
    });
  });
};

/**
 * POST /terms/:id/newcustom
 */
exports.newcustom = function (req, res, next) {
  const logged_in = (req.user != null);
  if (!logged_in) {
    return res.render('create_disabled', {
      user: req.user,
    });
  }
  Term.get(req.params.id, (err, term) => {
    if (err) return next(err);
    Term.create({
      name: req.body.name,
      description: req.body.description,
    }, (err, new_term) => {
      if (err) return next(err);
      term.custom(new_term, req.body.relationship.name.replace(/ /g, '_'), (err) => {
        if (err) return next(err);
        res.redirect(`/terms/${term.id}`);
      });
    });
  });
};
