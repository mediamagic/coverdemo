//var ei = require('easyimage');
var fs = require('fs');
var url = require('url');
var db = require('../models');

exports.create = function(req, res, next){
	
	db.Users.upd({fbUid:req.body.user.id}, req.body.user, { new:true, upsert:true}, function(err, doc) {
		if(err)
			return res.send(err);

		console.log(doc);

		db.Covers.add({ ownerId: doc._id }, function(err, cover) {
			if(err)
				return res.send(err);
			if(doc.covers != undefined)
				doc.covers.push(cover._id);
			else
				doc.covers = [cover._id];
			doc.save();
			var data = req.body.src.replace(/^data:image\/\w+;base64,/, "");
			var buf = new Buffer(data, 'base64');
			fs.writeFile(global.root + 'public/images/covers/' + cover._id + '.png', buf, function(err){
				if (err) throw err
		        console.log('File saved.')
		    });

		    // TEMP
		    var data2 = req.body.thumbnail.replace(/^data:image\/\w+;base64,/, "");
			var buf2 = new Buffer(data2, 'base64');
			fs.writeFile(global.root + 'public/images/covers/thumb_' + cover._id + '.png', buf2, function(err){
				if (err) throw err
		        console.log('Thumbnail saved.')
		    });
		    //

			res.send(200);	
		});

		
	});
	
}

exports.read = function(req, res, next) {
	var http = require('http');
	if (req.query['picture'] === undefined)
		return res.send('no such image', 404)
	var path = req.query['picture'];
	var options = url.parse(path);

	var callback = function(response) {		
		response.setEncoding('binary');

		var str = '';
		response.on('data', function (chunk) {
			str += chunk;
		});
		response.on('end', function () {			
			//res.setHeader("Content-Type", "image/jpeg");			
			//  fs.writeFile('testfb.jpg', str, 'binary', function(err){
			//  	if (err) throw err
		 // //        console.log('File saved.')
		 //     });
			res.writeHead(200, {"Content-Type": "image/jpeg"});
    		res.write(str, "binary");
    		res.end();
		});
	}
	http.request(options, callback).end();
}