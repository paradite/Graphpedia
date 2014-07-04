var Term = require('../models/term');
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index');
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
        if(terms == null || terms.length == 0){
            console.log('%s', "term not found");
            res.render('notfound', {
                name: name
            });
        }else if(terms.length == 1){
        	res.redirect('/terms/' + terms[0].id);
        }else{
        	res.render('terms',{
        		terms: terms
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
