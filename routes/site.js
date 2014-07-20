var Term = require('../models/term');
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { user : req.user });
};

/*
 * POST home page.
 */

exports.indexpost = function(req, res, next){
    res.render('index');
};

/*
POST Direct the search to the item-specific-url
*/
exports.searchinit = function(req, res){
	var name = req.body['name'];
		if(name == null){
		res.render('index');
	}
	res.redirect('/search?name=' + name);
}

/*
GET Render the path search view
*/
exports.pathrender = function(req, res){
    res.render('path');
}

/*
POST Get the ids for terms for path
*/
exports.pathinit = function(req, res){
    var name1 = req.body['name1'];
    var name2 = req.body['name2'];
        if(name1 == null || name2 == null){
        res.render('index');
    }
    res.redirect('/path?name1=' + name1 + '&name2=' + name2);
}

/*
GET Get the ids for terms for path
*/
exports.path = function(req, res){
    var name1 = req.query.name1;
    var name2 = req.query.name2;
        if(name1 == null || name2 == null){
        res.render('index');
    }
    //In case of multiple terms returned by name, use the first name
    Term.getByNames(name1, name2, function (err, terms1, terms2) {
        if (err){
            console.log('%s', "err occured");
            res.render('index');
        }
        //Matched both
        if(terms1 != null && terms2 != null && terms1.length > 0 && terms2.length > 0){
            //Find the path using two ids
            terms1[0].getPath(terms2[0], function (err, nodes, relationships){
                // Parse nodes and relationships for displaying
                if(err) console.log(err);
                console.log("path: " + path);
            });
        //Not matched for either
        }else{
            if(terms1 == null || terms1.length == 0) {
                console.log('%s', "path finding fails term 1: " + name1);
                res.render('notfound', {
                    name: name1
                });
            }else if(terms2 == null || terms2.length == 0) {
                console.log('%s', "path finding fails term 2: " + name2);
                res.render('notfound', {
                    name: name2
                });
            };
        }
    });
}

/*
GET Search a term
*/
exports.search = function(req, res){
	var name = req.query.name;
	if(name == null){
        console.log('%s', "name is null");
		res.render('index');
	}

    Term.getByName(name, function (err, terms) {
        if (err){
            console.log('%s', "err occured");
            res.render('index');
        }
        console.log('%s', "terms: " + terms);
        //Matched
        if(terms != null && terms.length > 0){
            if(terms.length > 1){
                res.render('terms',{
                    terms: terms
                });
            }else if(terms.length == 1){
                res.redirect('/terms/' + terms[0].id);
            }else{
                //This should never happen
                console.log('%s', "term not found partially");
                res.render('notfound', {
                    name: name
                });
            }
        //Not matched
        }else if(terms == null || terms.length == 0){
            console.log('%s', "before calling getByNamePartial.");
            //Instead of notfound, try partial matching
            Term.getByNamePartial(name, function (err, terms_partial) {
                console.log('%s', "inside partial callback");
                //Matched Partial
                if(terms_partial != null && terms_partial.length > 0){
                    //Show a list if partial matching finds more than one
                    if(terms_partial.length > 1){
                        res.render('terms',{
                            terms: terms_partial
                        });
                    //Redirect if partial match only finds one
                    }else if(terms_partial.length == 1){
                        res.redirect('/terms/' + terms_partial[0].id);
                    }
                //Not matched
                }else{
                    console.log('%s', "term not found partially");
                    res.render('notfound', {
                    name: name
                    });
                }
            });
        //This should never happen
        }else{
            console.log('%s', "term not found but not null or empty?");
            res.render('notfound', {
                name: name
            });
        }
    });
}

/*
 * GET home page.
 */

exports.wrong = function(req, res){
    res.render('wrong');
};
