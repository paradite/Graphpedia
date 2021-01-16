// relationship.js
// Relationship model logic.

const list = [
  'is_part_of',
  'includes',
  'depends_on',
  'is_required_by',
  'is_successor_of',
  'is_predecessor_of',
  'is_related_to',
  'is_synonym_for',
];

const Relationship = module.exports = function Relationship() {
  // Base list of relationships
  this.list = list;

  // Generate list with spaces instead of underscores
  this.list_space = list.map(item => item.replace(/_/g, ' '));

  // Map the relationship type to the index
  this.map = {};
  for (let i = 0; i < list.length; i++) {
    this.map[list[i]] = i;
  }

  // Define relationships
  this.PAR = 'is_part_of';
  this.INC = 'includes';
  this.SUC = 'is_successor_of';
  this.PRE = 'is_predecessor_of';
  this.DEP = 'depends_on';
  this.SUP = 'is_required_by';
  this.REQ = 'is_required_by';
  this.REL = 'is_related_to';
  this.SYN = 'is_synonym_for';

  // Define the reverse relationships
  this.reverse = {};
};

// Method to return all the relationships
Relationship.prototype.getAll = function () {
  return this.list_space;
};

// Method to return the index of a relationship
Relationship.prototype.getIndex = function (name) {
  return this.map[name];
};

// Method to get the reverse relationship for a relationship
// for adding by-directional reltionships
Relationship.prototype.getReverse = function (name) {
  if (name == 'is_part_of') {
    return 'includes';
  } else if (name == 'includes') {
    return 'is_part_of';
  } else if (name == 'is_successor_of') {
    return 'is_predecessor_of';
  } else if (name == 'is_predecessor_of') {
    return 'is_successor_of';
  } else if (name == 'depends_on') {
    return 'is_required_by';
  } else if (name == 'is_required_by') {
    return 'depends_on';
  } else if (name == 'is_synonym_for') {
    return 'is_synonym_for';
  } else if (name == 'is_related_to') {
    return 'is_related_to';
  }
  return null;
};
