var db = require('../models');

function handle(err,doc){
 if (err)
  return err;
 return doc;
}

module.exports = {	
	index:function(req, res, next) {
		db.Settings.list({}, function(err, doc) {
			return res.send(handle(err, doc));
		})
	},
	create:function(req, res, next){
		var obj = req.body;
		db.Settings.add(obj, function(err, doc) {
			return res.send(handle(err, doc));	
		});
	}
};