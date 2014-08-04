// relationship.js
// Relationship model logic.

var list = [
		"is_part_of",
		"includes",
		"depends_on",
        "supports",
        "is_successor_of",
        "is_predecessor_of",
		"is_related_to",
		"is_synonym_for"
	];

var Relationship = module.exports = function Relationship() {
	// Base list of relationships
	this.list = list;

	// Generate list with spaces instead of underscores
	this.list_space = list.map(function(item){
		return item.replace(/_/g," ");
	});

	// Map the relationship type to the index	
	this.map = {};
	for (var i = 0; i < list.length; i++) {
		this.map[list[i]] = i;
	};

    //Define relationships
    this.PAR = "is_part_of";
    this.INC = "includes";
    this.SUC = "is_successor_of";
    this.PRE = "is_predecessor_of";
    this.DEP = "depends_on";
    this.SUP = "supports";
    this.REL = "is_related_to";
    this.SYN = "is_synonym_for";

    // Define the reverse relationships
    this.reverse = {};
}

// Method to return all the relationships
Relationship.prototype.getAll = function() {
    return this.list_space;
}

// Method to return the index of a relationship
Relationship.prototype.getIndex = function(name) {
	return this.map[name];
}

// Method to get the reverse relationship for a relationship 
// for adding by-directional reltionships
Relationship.prototype.getReverse = function(name) {
    if(name == "is_part_of"){
        return "includes";
    }else if(name == "includes"){
        return "is_part_of";
    }else if(name == "is_successor_of"){
        return "is_predecessor_of";
    }else if(name == "is_predecessor_of"){
        return "is_successor_of";
    }else if(name == "depends_on"){
        return "supports";
    }else if(name == "supports"){
        return "depends_on";
    }else if(name == "is_synonym_for"){
        return "is_synonym_for";
    }else if(name == "is_related_to"){
        return "is_related_to";
    }else{
        return null;
    }
}

// Old method
//Heroku neo4j database
/*var base_url = process.env['NEO4J_URL'] ||
process.env['GRAPHENEDB_URL'] ||
'http://localhost:7474'

//Use neo4j REST API to get all relationship
var options = {
    url: base_url + '/db/data/relationship/types',
    headers: {
        'User-Agent': 'request'
    }
};

function callback(error, response, body) {
    if (error || response.statusCode != 200) {
        console.log("error in neo4j API callback");
        return res.render('wrong');
    }
    var relationship_types = JSON.parse(body);

        //deal with old relationship types
        var index = relationship_types.indexOf("follows");
        if (index > -1) {
            relationship_types.splice(index, 1);
        }
        var index = relationship_types.indexOf("contains");
        if (index > -1) {
            relationship_types.splice(index, 1);
        }

        // Parse the underscore
        relationship_types = relationship_types.map(function(rel){return rel.replace(/_/g," ")});

        //Add default ones
        if(relationship_types.length < 6){
            relationship_types = random_term_1.getAllRelationships();
        }
        // console.log(relationship_types);
        res.render('index', {
            user : req.user,
            random_term_1: random_term_1,
            random_term_2: random_term_2,
            relationship_types: relationship_types
        });
    }
    request(options, callback);
});*/
