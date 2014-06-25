var Term = require('../models/term');
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index');
};

/*
POST Search a term
*/
exports.search = function(req, res){
	var name = req.body['name'];
    Term.getByName(name, function (err, terms) {
        if (err) return next(err);
        if(terms.length == 0){
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