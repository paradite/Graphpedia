const util = require('util');
const crypto = require('crypto');
const LocalStrategy = require('passport-local').Strategy;
const BadRequestError = require('./badrequesterror');

module.exports = function (schema, options) {
  options = options || {};
  options.saltlen = options.saltlen || 32;
  options.iterations = options.iterations || 25000;
  options.keylen = options.keylen || 512;
  options.encoding = options.encoding || 'hex';

  // Populate field names with defaults if not set
  options.usernameField = options.usernameField || 'username';

  // option to convert username to lowercase when finding
  options.usernameLowerCase = options.usernameLowerCase || false;

  options.hashField = options.hashField || 'hash';
  options.saltField = options.saltField || 'salt';

  options.incorrectPasswordError = options.incorrectPasswordError || 'Incorrect password';
  options.incorrectUsernameError = options.incorrectUsernameError || 'Incorrect username';
  options.missingUsernameError = options.missingUsernameError || 'Field %s is not set';
  options.missingPasswordError = options.missingPasswordError || 'Password argument not set!';
  options.userExistsError = options.userExistsError || 'User already exists with name %s';
  options.noSaltValueStoredError = options.noSaltValueStoredError || 'Authentication not possible. No salt value stored in mongodb collection!';

  // Error for wrong Invitation code
  options.wrongInvitationCodeError = options.wrongInvitationCodeError || 'The invitation code you entered is invalid.';

  // Invitation code
  const INTIVATION_CODE = process.env.INTIVATION_CODE;

  const schemaFields = {};
  if (!schema.path(options.usernameField)) {
    	schemaFields[options.usernameField] = String;
  }
  schemaFields[options.hashField] = String;
  schemaFields[options.saltField] = String;

  schema.add(schemaFields);

  schema.pre('save', function (next) {
    // if specified, convert the username to lowercase
    if (options.usernameLowerCase) {
      this[options.usernameField] = this[options.usernameField].toLowerCase();
    }

    next();
  });

  schema.methods.setPassword = function (password, cb) {
    if (!password) {
      return cb(new BadRequestError(options.missingPasswordError));
    }

    const self = this;

    crypto.randomBytes(options.saltlen, (err, buf) => {
      if (err) {
        return cb(err);
      }

      const salt = buf.toString(options.encoding);

      crypto.pbkdf2(password, salt, options.iterations, options.keylen, 'sha512', (err, hashRaw) => {
        if (err) {
          return cb(err);
        }

        self.set(options.hashField, new Buffer(hashRaw, 'binary').toString(options.encoding));
        self.set(options.saltField, salt);

        cb(null, self);
      });
    });
  };

  schema.methods.authenticate = function (password, cb) {
    const self = this;

    if (!this.get(options.saltField)) {
      return cb(null, false, { message: options.noSaltValueStoredError });
    }

    crypto.pbkdf2(password, this.get(options.saltField), options.iterations, options.keylen, 'sha512', (err, hashRaw) => {
      if (err) {
        return cb(err);
      }

      const hash = new Buffer(hashRaw, 'binary').toString(options.encoding);

      if (hash === self.get(options.hashField)) {
        return cb(null, self);
      }
      return cb(null, false, { message: options.incorrectPasswordError });
    });
  };

  schema.statics.authenticate = function () {
    const self = this;

    return function (username, password, cb) {
      self.findByUsername(username, (err, user) => {
        if (err) { return cb(err); }

        if (user) {
          return user.authenticate(password, cb);
        }
        return cb(null, false, { message: options.incorrectUsernameError });
      });
    };
  };

  schema.statics.serializeUser = function () {
    return function (user, cb) {
      cb(null, user.get(options.usernameField));
    };
  };

  schema.statics.deserializeUser = function () {
    const self = this;

    return function (username, cb) {
      self.findByUsername(username, cb);
    };
  };

  schema.statics.register = function (user, password, code, cb) {
    // Create an instance of this in case user isn't already an instance
    if (!(user instanceof this)) {
      user = new this(user);
    }

    if (!user.get(options.usernameField)) {
      return cb(new BadRequestError(util.format(options.missingUsernameError, options.usernameField)));
    }

    // Check the invitation code
    console.log('%s', `Current Invitation code: ${INTIVATION_CODE}\nNew registration attempt with: ${code}`);
    if (code != INTIVATION_CODE) {
      return cb(new BadRequestError(options.wrongInvitationCodeError));
    }

    const self = this;
    self.findByUsername(user.get(options.usernameField), (err, existingUser) => {
      if (err) { return cb(err); }

      if (existingUser) {
        return cb(new BadRequestError(util.format(options.userExistsError, user.get(options.usernameField))));
      }

      user.setPassword(password, (err, user) => {
        if (err) {
          return cb(err);
        }

        user.save((err) => {
          if (err) {
            return cb(err);
          }

          cb(null, user);
        });
      });
    });
  };

  schema.statics.findByUsername = function (username, cb) {
    const queryParameters = {};

    // if specified, convert the username to lowercase
    if (username !== undefined && options.usernameLowerCase) {
      username = username.toLowerCase();
    }

    queryParameters[options.usernameField] = username;

    const query = this.findOne(queryParameters);
    if (options.selectFields) {
      query.select(options.selectFields);
    }

    if (options.populateFields) {
      query.populate(options.populateFields);
    }

    if (cb) {
      query.exec(cb);
    } else {
      return query;
    }
  };

  schema.statics.createStrategy = function () {
    return new LocalStrategy(options, this.authenticate());
  };
};
