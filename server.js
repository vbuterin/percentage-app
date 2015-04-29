var Db              = require('mongodb').Db,
    Connection      = require('mongodb').Connection,
    Server          = require('mongodb').Server,
    BSON            = require('mongodb').BSON,
    ObjectID        = require('mongodb').ObjectID,
    express         = require('express'),
    cp              = require('child_process'),
    crypto          = require('crypto'),
    async           = require('async'),
    http            = require('http'),
    _               = require('underscore');

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null 
        ? process.env['MONGO_NODE_DRIVER_HOST'] 
        : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null 
        ? process.env['MONGO_NODE_DRIVER_PORT'] 
        : Connection.DEFAULT_PORT;

var db = new Db('people', new Server(host, port), {safe: false}, {auto_reconnect: true}, {});

var eh = function(fail, success) {
    return function(err, res) {
        if (err) {
            console.log('e',err,'f',fail,'s',success);
            if (fail) { fail(err); }
        }
        else {
            success.apply(this,Array.prototype.slice.call(arguments,1));
        }
    };
};

var mkrespcb = function(res,code,success) {
    return eh(function(msg) { res.json(msg,400);  },success);
}

var people;
var password;

db.open(function(err,dbb) {
    if (err) { throw err; }
    db = dbb;
    db.collection('people',function(err, collection) { 
        if (err) { throw err; }
        people = collection;
    });
    db.collection('password',function(err, collection) { 
        if (err) { throw err; }
        password = collection;
    });
});

var app = express();

app.configure(function(){                                                                 
     app.set('views',__dirname + '/views');                                                  
     app.set('view engine', 'jade'); app.set('view options', { layout: false });             
     app.use(express.bodyParser());                                                          
     app.use(express.methodOverride());                                                      
     app.use(app.router);                                                                    
     app.use(express.static(__dirname + '/public'));                                         
});

// { Name: ??, leadership: ??, fm: ??, november: ??, december: ??, january: ??, february: ??, march: ?? }
//
app.use('/submit',function(req,res) {
	people.findOne({ name: req.param('name') },mkrespcb(res,400,function(p) {
        password.findOne({ main: 'main' },mkrespcb(res,400,function(pw) {
		    var params = _.extend(req.query,req.body)
            if (pw && pw.pw && params.pw != pw.pw) return res.json('bad password', 400);
            delete params._id;
		    if (p) people.update(p,params,mkrespcb(res,400,function() { res.json('done') }))
		    else people.insert(params,mkrespcb(res,400,function() { res.json('done') }))
	    }));
	}));
});

app.use('/setpassword', function(req, res) {
    password.findOne({ main: 'main' },mkrespcb(res,400,function(pw) {
		var params = _.extend(req.query,req.body)
        if (pw && pw.pw && params.pw != pw.pw) return res.json('bad password', 400);
        delete params._id;
        var params2 = { main: 'main', pw: params.newpw };
		if (pw) password.update(pw,params2,mkrespcb(res,400,function() { res.json('done') }))
		else password.insert(params2,mkrespcb(res,400,function() { res.json('done') }))
    }));
});

app.use('/get',function(req,res) {
    people.find({}).toArray(mkrespcb(res,400,function(p) {
		res.json(p.filter(function(pp) { return pp.name }))
	}))
});

app.use('/me',function(req,res) {
    people.findOne({name: req.param('name') },mkrespcb(res,400,function(p) {
		res.json(p)
	}))
});

app.use('/',function(req,res) {                                                           
    res.render('app.jade',{});                                                           
});

app.listen(3193);

return app;
