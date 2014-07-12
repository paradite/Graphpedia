// term.js
// Term model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(
    process.env['NEO4J_URL'] ||
    process.env['GRAPHENEDB_URL'] ||
    'http://localhost:7474'
);

// private constructor:

var Term = module.exports = function Term(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

// public instance properties:

Object.defineProperty(Term.prototype, 'id', {
    get: function () { return this._node.id; }
});



Object.defineProperty(Term.prototype, 'data', {
    get: function () { return this._node.data; }
});

Object.defineProperty(Term.prototype, 'name', {
    get: function () {
        return this._node.data['name'];
    },
    set: function (name) {
        this._node.data['name'] = name;
    }
});

//Added lower case name for easy searching of the term
Object.defineProperty(Term.prototype, 'name_lower_case', {
    get: function () {
        return this._node.data['name_lower_case'];
    },
    set: function (name_lower_case) {
        this._node.data['name_lower_case'] = name_lower_case;
    }
});

//Added description field for term
Object.defineProperty(Term.prototype, 'description', {
    get: function () {
        return this._node.data['description'];
    },
    set: function (description) {
        this._node.data['description'] = description;
    }
});

//Define relationships



Object.defineProperty(Term.prototype, 'REL_IS_PART_OF', {
    get: function () { return "is_part_of"; }
});

Object.defineProperty(Term.prototype, 'REL_INCLUDE', {
    get: function () { return "includes"; }
});


// public instance methods:

Term.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

Term.prototype.del = function (callback) {
    // use a Cypher query to delete both this Term and his/her following
    // relationships in one transaction and one network request:
    // (note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
    var query = [
        'MATCH (term:Term)',
        'WHERE ID(term) = {termId}',
        'OPTIONAL MATCH term-[r]-()',
        'DELETE r, term',
    ].join('\n')

    var params = {
        termId: this.id
    };
    db.query(query, params, function (err) {
        console.log('%s', "Term deleted");
        callback(err);
    });
};

/*  New/Delete relationship
    Currently we have cutomized relationships, contain, 
*/

//Customized relationship methods
Term.prototype.custom = function (other, relationship_name, callback) {
    var formated_relationship_name = relationship_name.replace(/ /g,"_");
    this._node.createRelationshipTo(other._node, formated_relationship_name, {}, function (err, rel) {
        callback(err);
    });
};

Term.prototype.uncustom = function (other, relationship_name, callback) {
    //Create MATCH query
    var formated_relationship_name = relationship_name.replace(/ /g,"_");
    console.log("in uncustom: "+ formated_relationship_name);
    var match_rel = 'MATCH (term:Term) -[rel:'+formated_relationship_name+']-> (other:Term)'
    var query = [
        match_rel,
        'WHERE ID(term) = {termId} AND ID(other) = {otherId}',
        'DELETE rel',
    ].join('\n')

    var params = {
        termId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

// calls callback w/ (err, outgoing, others) where outgoing is an array of
// Terms this Term outgoes, and others is all other Terms minus him/herself.
// To search for all relationships, use
// MATCH (n:Term), n-[r]-m, (m:Term) WHERE n.`name`="nodejs"   RETURN n, type(r)

Term.prototype.getOutgoingAndOthers = function (callback) {
    // query all Terms and whether we follow each one or not:
    var query = [
        'MATCH (term:Term), (other:Term)',
        'OPTIONAL MATCH (term) -[rel:'+this.REL_INCLUDE+']-> (other)',
        'WHERE ID(term) = {termId}',
        'OPTIONAL MATCH (term) -[rel2:'+this.REL_IS_PART_OF+']-> (other)',
        'WHERE ID(term) = {termId}',
        'RETURN other, COUNT(rel), COUNT(rel2)', // COUNT(rel) is a hack for 1 or 0
    ].join('\n')

    var params = {
        termId: this.id,
    };

    var term = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);

        var including = [];
        var including_others = [];
        var is_part_of = [];
        var is_part_of_others = [];
        var all_others = [];

        for (var i = 0; i < results.length; i++) {
            var other = new Term(results[i]['other']);
            var include_true = results[i]['COUNT(rel)'];
            var is_part_of_true = results[i]['COUNT(rel2)'];

            if (term.id === other.id) {
                continue;
            } else {
                all_others.push(other);
            }

            if (term.id === other.id) {
                continue;
            } else if (include_true) {
                including.push(other);
            } else {
                including_others.push(other);
            }

            if (term.id === other.id) {
                continue;
            } else if (is_part_of_true) {
                is_part_of.push(other);
            } else {
                is_part_of_others.push(other);
            }
        }

        callback(null, including, is_part_of, all_others);
    });
};

// calls callback w/ (err, including, others) where including is an array of
// Terms this Term contains, and others is all other Terms minus him/herself.
// To search for all relationships, use
// MATCH (n:Term), n-[r]-m, (m:Term) WHERE n.`name`="nodejs"   RETURN n, type(r)
Term.prototype.getContainingAndOthers = function (callback) {
    // query all Terms and whether we follow each one or not:
    var query = [
        'MATCH (term:Term), (other:Term)',
        'OPTIONAL MATCH (term) -[rel:contains]-> (other)',
        'WHERE ID(term) = {termId}',
        'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
    ].join('\n')

    var params = {
        termId: this.id,
    };

    var term = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);

        var including = [];
        var others = [];

        for (var i = 0; i < results.length; i++) {
            var other = new Term(results[i]['other']);
            var contains = results[i]['COUNT(rel)'];

            if (term.id === other.id) {
                continue;
            } else if (contains) {
                including.push(other);
            } else {
                others.push(other);
            }
        }

        callback(null, including, others);
    });
};



// calls callback w/ (err, following, others) where following is an array of
// Terms this Term follows, and others is all other Terms minus him/herself.
// TODO:
// For all others, only send those not related to the term.
Term.prototype.getFollowingAndOthers = function (callback) {
    // query all Terms and whether we follow each one or not:
    var query = [
        'MATCH (term:Term), (other:Term)',
        'OPTIONAL MATCH (term) -[rel:follows]-> (other)',
        'WHERE ID(term) = {termId}',
        'RETURN other, COUNT(rel)', // COUNT(rel) is a hack for 1 or 0
    ].join('\n')

    var params = {
        termId: this.id,
    };

    var term = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);

        var following = [];
        var others = [];

        for (var i = 0; i < results.length; i++) {
            var other = new Term(results[i]['other']);
            var follows = results[i]['COUNT(rel)'];

            if (term.id === other.id) {
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

Term.get = function (id, callback) {
    console.log("get");
    db.getRelationshipIndexes(function (err, indexes) { 
        if (err) throw err; 
        console.log("no error " + indexes.length);
        indexes.forEach(function (name) { 
            console.log('Index'+ name+ 'has config:'+ indexes[name]); 
        }); 
    });
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        console.log("no error " + node);
        callback(null, new Term(node));
    });
};

/*
Get a term by name
*/
//Provided support for searching with lower case
Term.getByName = function (name, callback) {
    var query = [
        'MATCH (term:Term)',
        'WHERE term.name = {termName} OR term.name_lower_case = {termName}',
        'RETURN term',
    ].join('\n');

    var params = {
        termName: name,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var terms = results.map(function (result) {
            return new Term(result['term']);
        });
        callback(null, terms);
    });
};

Term.getAll = function (callback) {
    var query = [
        'MATCH (term:Term)',
        'RETURN term',
    ].join('\n');

    db.query(query, null, function (err, results) {
        if (err) return callback(err);
        var terms = results.map(function (result) {
            return new Term(result['term']);
        });
        callback(null, terms);
    });
};

// creates the Term and persists (saves) it to the db, incl. indexing it:
Term.create = function (data, callback) {
    // construct a new instance of our class with the data, so it can
    // validate and extend it, etc., if we choose to do that in the future:
    var node = db.createNode(data);
    var term = new Term(node);

    // but we do the actual persisting with a Cypher query, so we can also
    // apply a label at the same time. (the save() method doesn't support
    // that, since it uses Neo4j's REST API, which doesn't support that.)
    var query = [
        'CREATE (term:Term {data})',
        'RETURN term',
    ].join('\n');

    var params = {
        data: data
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var term = new Term(results[0]['term']);
        callback(null, term);
    });
};

/*
Method to parse the data from neo4j databse to json objects for rendering
Author: Zhu Liang
Date: 29 June
*/
Term.prototype.parse = function (arr_obs){
    var parsed = [];
    for (var item in arr_obs) {
        if(!arr_obs[item].description){
            arr_obs[item].description = "no description yet"
        }
        parsed.push({name: arr_obs[item].name, description: arr_obs[item].description});
    }
    return parsed;
}


/*MATCH n RETURN n LIMIT 5;*/
/*

/*Old methods*/

/*
//follow related methods
Term.prototype.follow = function (other, callback) {
    this._node.createRelationshipTo(other._node, 'follows', {}, function (err, rel) {
        callback(err);
    });
};

Term.prototype.unfollow = function (other, callback) {
    var query = [
        'MATCH (term:Term) -[rel:follows]-> (other:Term)',
        'WHERE ID(term) = {termId} AND ID(other) = {otherId}',
        'DELETE rel',
    ].join('\n')

    var params = {
        termId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

//is_part_of related methods
Term.prototype.is_part_of = function (other, callback) {
    this._node.createRelationshipTo(other._node, this.REL_IS_PART_OF, {}, function (err, rel) {
        callback(err);
    });
};

Term.prototype.unis_part_of = function (other, callback) {
    var query = [
        'MATCH (term:Term) -[rel:'+this.REL_IS_PART_OF+']-> (other:Term)',
        'WHERE ID(term) = {termId} AND ID(other) = {otherId}',
        'DELETE rel',
    ].join('\n')

    var params = {
        termId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};

//contains related methods
Term.prototype.contain = function (other, callback) {
    this._node.createRelationshipTo(other._node, this.REL_INCLUDE, {}, function (err, rel) {
        callback(err);
    });
};

Term.prototype.uncontain = function (other, callback) {
    var query = [
        'MATCH (term:Term) -[rel:'+this.REL_INCLUDE+']-> (other:Term)',
        'WHERE ID(term) = {termId} AND ID(other) = {otherId}',
        'DELETE rel',
    ].join('\n')

    var params = {
        termId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err) {
        callback(err);
    });
};
*/