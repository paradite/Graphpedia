//
// User model tests. These are basically CRUD tests, ordered to let us test
// all cases, plus listing all users and following/unfollowing between users.
//
// It's worth noting that there may already be users in the database, so these
// tests must not assume the initial state is empty.
//
// High-level test plan:
//
// - List initial users.
// - Create a user A.
// - Fetch user A. Should be the same.
// - List users again; should be initial list plus user A.
// - Update user A, e.g. its name.
// - Fetch user A again. It should be updated.
// - Delete user A.
// - Try to fetch user A again; should fail.
// - List users again; should be back to initial list.
//
// - Create two users in parallel, B and C.
// - Fetch both user's "following and others"; both should show no following.
// - Have user B follow user C.
// - Have user B follow user C again; should be idempotent.
// - Fetch user B's "following and others"; should show following user C.
// - Fetch user C's "following and others"; should show not following user B.
// - Have user B unfollow user C.
// - Have user B unfollow user C again; should be idempotent.
// - Fetch both users' "following and others" again; both should follow none.
//
// - Create a user D.
// - Have user B follow user C follow user D.
// - Fetch all users' "following and others"; should be right.
// - Delete user B.
// - Fetch user C's and D's "following and others"; should be right.
// - Delete user D.
// - Fetch user C's "following and others"; should be right.
// - Delete user C.
//
// NOTE: I struggle to translate this kind of test plan into BDD style tests.
// E.g. what am I "describing", and what should "it" do?? Help welcome! =)
//


const expect = require('chai').expect;
const User = require('../../models/user');


// Shared state:

let INITIAL_USERS;
let USER_A,
  USER_B,
  USER_C,
  USER_D;


// Helpers:

/**
 * Asserts that the given object is a valid user model.
 * If an expected user model is given too (the second argument),
 * asserts that the given object represents the same user with the same data.
 */
function expectUser(obj, user) {
  expect(obj).to.be.an('object');
  expect(obj).to.be.an.instanceOf(User);

  if (user) {
    ['id', 'name'].forEach((prop) => {
      expect(obj[prop]).to.equal(user[prop]);
    });
  }
}

/**
 * Asserts that the given array of users contains the given user,
 * exactly and only once.
 */
function expectUsersToContain(users, expUser) {
  let found = false;

  expect(users).to.be.an('array');
  users.forEach((actUser) => {
    if (actUser.id === expUser.id) {
      expect(found, 'User already found').to.equal(false);
      expectUser(actUser, expUser);
      found = true;
    }
  });
  expect(found, 'User not found').to.equal(true);
}

/**
 * Asserts that the given array of users does *not* contain the given user.
 */
function expectUsersToNotContain(users, expUser) {
  expect(users).to.be.an('array');
  users.forEach((actUser) => {
    expect(actUser.id).to.not.equal(expUser.id);
  });
}

/**
 * Fetches the given user's "following and others", and asserts that it
 * reflects the given list of expected following and expected others.
 * The expected following is expected to be a complete list, while the
 * expected others may be a subset of all users.
 * Calls the given callback (err, following, others) when complete.
 */
function expectUserToFollow(user, expFollowing, expOthers, callback) {
  user.getFollowingAndOthers((err, actFollowing, actOthers) => {
    if (err) return callback(err);

    expect(actFollowing).to.be.an('array');
    expect(actFollowing).to.have.length(expFollowing.length);
    expFollowing.forEach((expFollowingUser) => {
      expectUsersToContain(actFollowing, expFollowingUser);
    });
    expOthers.forEach((expOtherUser) => {
      expectUsersToNotContain(actFollowing, expOtherUser);
    });

    expect(actOthers).to.be.an('array');
    expOthers.forEach((expOtherUser) => {
      expectUsersToContain(actOthers, expOtherUser);
    });
    expFollowing.forEach((expFollowingUser) => {
      expectUsersToNotContain(actOthers, expFollowingUser);
    });

    // and neither list should contain the user itself:
    expectUsersToNotContain(actFollowing, user);
    expectUsersToNotContain(actOthers, user);

    return callback(null, actFollowing, actOthers);
  });
}


// Tests:

describe('User models:', () => {
  // Single user CRUD:

  it('List initial users', (next) => {
    User.getAll((err, users) => {
      if (err) return next(err);

      expect(users).to.be.an('array');
      users.forEach((user) => {
        expectUser(user);
      });

      INITIAL_USERS = users;
      return next();
    });
  });

  it('Create user A', (next) => {
    const name = 'Test User A';
    User.create({ name }, (err, user) => {
      if (err) return next(err);

      expectUser(user);
      expect(user.id).to.be.a('number');
      expect(user.name).to.be.equal(name);

      USER_A = user;
      return next();
    });
  });

  it('Fetch user A', (next) => {
    User.get(USER_A.id, (err, user) => {
      if (err) return next(err);
      expectUser(user, USER_A);
      return next();
    });
  });

  it('List users again', (next) => {
    User.getAll((err, users) => {
      if (err) return next(err);

      // the order isn't part of the contract, so we just test that the
      // new array is one longer than the initial, and contains user A.
      expect(users).to.be.an('array');
      expect(users).to.have.length(INITIAL_USERS.length + 1);
      expectUsersToContain(users, USER_A);

      return next();
    });
  });

  it('Update user A', (next) => {
    USER_A.name += ' (edited)';
    USER_A.save(err => next(err));
  });

  it('Fetch user A again', (next) => {
    User.get(USER_A.id, (err, user) => {
      if (err) return next(err);
      expectUser(user, USER_A);
      return next();
    });
  });

  it('Delete user A', (next) => {
    USER_A.del(err => next(err));
  });

  it('Attempt to fetch user A again', (next) => {
    User.get(USER_A.id, (err, user) => {
      expect(user).to.not.exist; // i.e. null or undefined
      expect(err).to.be.an('object');
      expect(err).to.be.an.instanceOf(Error);
      return next();
    });
  });

  it('List users again', (next) => {
    User.getAll((err, users) => {
      if (err) return next(err);

      // like before, we just test that this array is now back to the
      // initial length, and *doesn't* contain user A.
      expect(users).to.be.an('array');
      expect(users).to.have.length(INITIAL_USERS.length);
      expectUsersToNotContain(users, USER_A);

      return next();
    });
  });

  // Two-user following:

  it('Create users B and C', (next) => {
    const nameB = 'Test User B';
    const nameC = 'Test User C';

    function callback(err, user) {
      if (err) return next(err);

      expectUser(user);

      switch (user.name) {
        case nameB:
          USER_B = user;
          break;
        case nameC:
          USER_C = user;
          break;
        default:
          // trigger an assertion error:
          expect(user.name).to.equal(nameB);
      }

      if (USER_B && USER_C) {
        return next();
      }
    }

    User.create({ name: nameB }, callback);
    User.create({ name: nameC }, callback);
  });

  it('Fetch user B’s “following and others”', (next) => {
    expectUserToFollow(USER_B, [], [USER_C], (err, following, others) => {
      if (err) return next(err);

      // our helper tests most things; we just test the length of others:
      expect(others).to.have.length(INITIAL_USERS.length + 1);

      return next();
    });
  });

  it('Fetch user C’s “following and others”', (next) => {
    expectUserToFollow(USER_C, [], [USER_B], (err, following, others) => {
      if (err) return next(err);

      // our helper tests most things; we just test the length of others:
      expect(others).to.have.length(INITIAL_USERS.length + 1);

      return next();
    });
  });

  it('Have user B follow user C', (next) => {
    USER_B.follow(USER_C, err => next(err));
  });

  it('Have user B follow user C again', (next) => {
    USER_B.follow(USER_C, err => next(err));
  });

  it('Fetch user B’s “following and others”', (next) => {
    expectUserToFollow(USER_B, [USER_C], [], next);
  });

  it('Fetch user C’s “following and others”', (next) => {
    expectUserToFollow(USER_C, [], [USER_B], next);
  });

  it('Have user B unfollow user C', (next) => {
    USER_B.unfollow(USER_C, err => next(err));
  });

  // NOTE: skipping this actually causes the next two tests to fail!
  it('Have user B unfollow user C again', (next) => {
    USER_B.unfollow(USER_C, err => next(err));
  });

  it('Fetch user B’s “following and others”', (next) => {
    expectUserToFollow(USER_B, [], [USER_C], next);
  });

  it('Fetch user C’s “following and others”', (next) => {
    expectUserToFollow(USER_C, [], [USER_B], next);
  });

  // Multi-user-following deletions:

  it('Create user D', (next) => {
    const name = 'Test User D';
    User.create({ name }, (err, user) => {
      if (err) return next(err);

      expectUser(user);
      expect(user.name).to.be.equal(name);

      USER_D = user;
      return next();
    });
  });

  it('Have user B follow user C follow user D', (next) => {
    let remaining = 2;

    function callback(err) {
      if (err) return next(err);
      if (--remaining === 0) {
        next();
      }
    }

    USER_B.follow(USER_C, callback);
    USER_C.follow(USER_D, callback);
  });

  it('Fetch all user’s “following and others”', (next) => {
    let remaining = 3;

    function callback(err) {
      if (err) return next(err);
      if (--remaining === 0) {
        next();
      }
    }

    expectUserToFollow(USER_B, [USER_C], [USER_D], callback);
    expectUserToFollow(USER_C, [USER_D], [USER_B], callback);
    expectUserToFollow(USER_D, [], [USER_B, USER_C], callback);
  });

  it('Delete user B', (next) => {
    USER_B.del(err => next(err));
  });

  it('Fetch user C’s and D’s “following and others”', (next) => {
    let remaining = 2;

    function callback(err) {
      if (err) return next(err);
      if (--remaining === 0) {
        next();
      }
    }

    expectUserToFollow(USER_C, [USER_D], [], callback);
    expectUserToFollow(USER_D, [], [USER_C], callback);
  });

  it('Delete user D', (next) => {
    USER_D.del(err => next(err));
  });

  it('Fetch user C’s “following and others”', (next) => {
    expectUserToFollow(USER_C, [], [], next);
  });

  it('Delete user C', (next) => {
    USER_C.del(err => next(err));
  });
});
