var mongoose = require('mongoose');

mongoose.connect('mongodb://192.168.1.4/coverDemo');
var db = mongoose.connection, ObjectId = mongoose.Schema.ObjectId;

function extendStaticMethods(modelName, registerArr){
 var registerArr = (registerArr === undefined) ? [] : registerArr;
 var methods = {}
 var template = {
  list: function(search, cb){
   if (search != undefined)
    delete search._csrf;
   this.model(modelName).find(search,{},{sort:{dateCreated: 1}},function(err,doc){
    if (err)
     return cb(err);
    return cb(null,doc);
   });
  },
  get: function(params,cb){
   this.model(modelName).findOne(params, function(err,doc){
    if (err)
     return cb(err);
    return cb(null,doc);
   });
  },
  add: function(data,cb){
   var tmp = new this(data);
   tmp.save(function(err,doc){
    if(err)
     return cb(err);
    return cb(null,doc);
   });
  },
  edit: function(params,data,cb){
   this.model(modelName).findOne(params, function(err,doc){
    if (err)
     return cb(err);
    doc.set(data);
    doc.save(function(e,d){
     if (e)
      return cb(e);
     return cb(null,doc);
    });
   });
  },
  upd: function(params, data, options, cb){
   this.model(modelName).findOneAndUpdate(params, data, options, function(err,doc){
    if (err)
     return cb(err)
    return cb(null, doc);
   });
  },
  delete: function(params,cb){
   this.remove(params, function(err,doc){
    if (err)
     return cb(err);
    return cb(null,doc);
   });
  }
 }
 for (var i = 0; i < registerArr.length; i++){
  if (template[registerArr[i]] != undefined) {
   methods[registerArr[i]] = template[registerArr[i]];
  }
 }
 return methods;
}

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	var templatesSchema = new mongoose.Schema({
		url: {type: String, required: true},
		thumb: {type: String, required: true},
		mask: {
			posX:{type: Number, default:0},
			posY:{type: Number, default:0},
			width: {type: Number, default:150},
			height: {type: Number, default:150}
		}
	});

	templatesSchema.statics = extendStaticMethods('Templates', ['list', 'add']);
	exports.Templates = db.model('Templates', templatesSchema);

	var usersSchema = new mongoose.Schema({
		fbUid:{type:Number, required: true, index:true},
		name: {type: String, required: true},
		email: {type: String, required: true},
		fbuser: {}
	});

	usersSchema.statics = extendStaticMethods('Users', ['list', 'upd', 'get']);
	exports.Users = db.model('Users', usersSchema);

	var coversSchema = new mongoose.Schema({
		ownerId: {type: mongoose.Schema.Types.ObjectId, required:true, index: true}
	});

	coversSchema.statics = extendStaticMethods('Covers', ['list', 'add', 'get']);
	exports.Covers = db.model('Covers', coversSchema);
});