var express = require('express');
var app = express()
var md5 = require('md5')

app.get('/',function(req,res){
	if (typeof req.session.user != "string") {
		res.redirect('/login');
		return false;

	}
	req.getConnection(function(error,conn){
		var que = "SELECT * FROM user";
		conn.query(que,function(err,result){
			res.render('index', {title: 'Callestasia', data:result})
		})
	})
})

app.get('/logout', function(req,res){
	if (typeof req.session.user != "string") {
		req.session.destroy();
		res.redirect('/login');

	}
	req.session.destroy();
	res.redirect('/login');
	// res.end("Logged out! Redirecting...");
})

app.get('/login', function(req,res){
	// res.send(JSON.stringify(req.session));
	// return false;
	if (typeof req.session.user == "string") {
		res.send("You're already logged in!");
		return false;

	}
 	res.render('login');
})

app.post('/login',function(req,res,next){
	// console.log(JSON.stringify(req.body));
	// let name = req.body.user;
	// let pass = req.body.pass;

	req.assert('user', "User tidak boleh kosong!").notEmpty()
	req.assert('pass', "Password tidak boleh kosong!").notEmpty()

	var errors = req.validationErrors()	
    if( !errors ) {  

    	var data = 
		{
    		user: req.sanitize('user').escape().trim(), //
			pass: req.sanitize('pass').escape() //
		}
			
		
		req.getConnection(function(error,conn){
			var que = "SELECT * FROM user WHERE username = ? and password = ?";
			conn.query(que, [data.user,md5(data.pass)], function(err,result){
				if (err) {
					res.send(JSON.stringify(err));
					return false;

				}

				if(result.length){
					req.session.userid = result[0].id;
					req.session.user   = result[0].username;
					res.redirect('/');
					res.end("You're logged in! Redirecting...");

				}else{
					res.render('login', {message: 'Error Credential!'});

				}

			})
		})
    }
    else{
    	var message = ''
		errors.forEach(function(error) {
			message += error.msg + '<br>'
		})				
		req.flash('error', message)		
    	
    	res.render('login');
    }

})


module.exports = app;