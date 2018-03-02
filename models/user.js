// user.js
// User model logic.

const neo4j = require('neo4j');

const db = new neo4j.GraphDatabase(process.env.NEO4J_URL ||
    process.env.GRAPHENEDB_URL ||
    'http://localhost:7474');

// private constructor:

const User = module.exports = function User(_node) {
  // all we'll really store is the node; the rest of our properties will be
  // derivable or just pass-through properties (see below).
  this._node = _node;
};

// public instance properties:

Object.defineProperty(User.prototype, 'id', {
  get() { return this._node.id; },
});

Object.defineProperty(User.prototype, 'name', {
  get() {
    return this._node.data.name;
  },
  set(name) {
    this._node.data.name = name;
  },
});

// public instance methods:

User.prototype.save = function (callback) {
  this._node.save((err) => {
    callback(err);
  });
};

User.prototype.del = function (callback) {
  // use a Cypher query to delete both this user and his/her following
  // relationships in one transaction and one network request:
  // (note that this'll still fail if there are any relationships attached
  // of any other types, which is good because we don't expect any.)
  const query = [
    'MATCH (user:User)',
    'WHERE ID(user) = {userId}',
    'DELETE user',
    'WITH user',
    'MATCH (user) -[rel:follows]- (other)',
    'DELETE rel',
  ].join('\n');

  const params = {
    userId: this.id,
  };

  db.query(query, params, (err) => {
    callback(err);
  });
};

User.prototype.follow = function (other, callback) {
  this._node.createRelationshipTo(other._node, 'follows', {}, (err, rel) => {
    callback(err);
  });
};

User.prototype.unfollow = function (other, callback) {
  const query = [
    'MATCH (user:User) -[rel:follows]-> (other:User)',
    'WHERE ID(user) = {userId} AND ID(other) = {otherId}',
    'DELETE rel',
  ].join('\n');

  const params = {
    userId: this.id,
    otherId: other.id,
  };

  db.query(query, params, (err) => {
    callback(err);
  });
};

// calls callback w/ (err, following, others) where following is an array of
// users this user follows, and others is all other users minus him/herself.
User.prototype.getFollowingAndOthers = function (callback) {
  // query all users and whether we follow each one or not:
  const query = [
    'MATCH (user:User), (other:User)',
    'OPTIONAL MATCH (user) -[rel:follows]-> (other)',
    'WHERE ID(user) = {userId}',
    'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
  ].join('\n');

  const params = {
    userId: this.id,
  };

  const user = this;
  db.query(query, params, (err, results) => {
    if (err) return callback(err);

    const following = [];
    const others = [];

    for (let i = 0; i < results.length; i++) {
      const other = new User(results[i].other);
      const follows = results[i]['COUNT(rel)'];

      if (user.id === other.id) {
        continue;
      } else if (follows) {
        following.push(other);
      } else {
        others.push(other);
      }
    }

    callback(null, following, others);
  });
};

// static methods:

User.get = function (id, callback) {
  db.getNodeById(id, (err, node) => {
    if (err) return callback(err);
    callback(null, new User(node));
  });
};

User.getAll = function (callback) {
  const query = [
    'MATCH (user:User)',
    'RETURN user',
  ].join('\n');

  db.query(query, null, (err, results) => {
    if (err) return callback(err);
    const users = results.map(result => new User(result.user));
    callback(null, users);
  });
};

// creates the user and persists (saves) it to the db, incl. indexing it:
User.create = function (data, callback) {
  // construct a new instance of our class with the data, so it can
  // validate and extend it, etc., if we choose to do that in the future:
  const node = db.createNode(data);
  const user = new User(node);

  // but we do the actual persisting with a Cypher query, so we can also
  // apply a label at the same time. (the save() method doesn't support
  // that, since it uses Neo4j's REST API, which doesn't support that.)
  const query = [
    'CREATE (user:User {data})',
    'RETURN user',
  ].join('\n');

  const params = {
    data,
  };

  db.query(query, params, (err, results) => {
    if (err) return callback(err);
    const user = new User(results[0].user);
    callback(null, user);
  });
};
