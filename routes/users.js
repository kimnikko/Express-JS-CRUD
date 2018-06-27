var express = require('express');
var app = express();
var md5 = require('md5');

app.get('/register', function(req,res){
	if(typeof req.session.user == "string"){
		req.session.destroy();
		res.redirect('/login');
	}
	res.render('register', {title: "Register Page"});
})



app.post('/register', function(req,res){

	req.assert('user',  "User tidak boleh kosong!").notEmpty()
	req.assert('user',  "Panjang Username harus 6 - 14 karakter").len(6,14)
	req.assert('email', "Email tidak boleh kosong!").notEmpty()
	req.assert('email', "Email tidak valid!").isEmail()
	req.assert('passwd', "Password tidak boleh kosong!").notEmpty()
	req.assert('passwd',  "Panjang Password harus 6 - 14 karakter").len(6,14)
	req.assert('passwd2', "Password2 tidak boleh kosong!").notEmpty()
	req.assert('passwd2',  "Panjang Password2 harus 6 - 14 karakter").len(6,14)

	var errors = req.validationErrors();	
    if( !errors ) { 

    	var data = 
		{
    		email: req.sanitize('email').escape().trim(),
    		user: req.sanitize('user').escape().trim(),
			pass: req.sanitize('passwd').escape(),
			pass2: req.sanitize('passwd2').escape()
		}

		if(data.pass != data.pass2){
			res.render('register', {title: 'Fail register', message: 'Password Anda tidak sama!'});
			return false;
		}

		req.getConnection(function(error,conn){
			var que = "INSERT INTO `user` (`id`, `email`, `username`, `password`) VALUES (NULL, ?, ?, ?);"
			conn.query(que, [data.email,data.user,md5(data.pass)], function(err, result){
				

				if(!err){
					if(result.affectedRows == 1){
					req.flash('succes', 'Register Succesfuly with username', data.user);
					res.render('register',{title: 'Succes Register'});
				}else{
					res.render('register',{message: err,title:'Fail Register'});
					return false;
				}
			}

			if (err) {
					console.log(JSON.stringify(err));
				if(err.code == "ER_DUP_ENTRY"){
					req.flash('error', 'Sudah ada data yang sama!');
					res.render('register', {title:'Fail Register'})
					return false;
					}
				}
				
			})
		})
    }else{
    	var message = ''
		errors.forEach(function(error) {
			message += error.msg + '<br>'
		})				
		req.flash('error', message)		
    	
    	res.render('register', {title:'Fail Register!'});
    }

})

app.get('/edit/(:id)', function(req,res,next){

		if (typeof req.session.user != "string") {
		res.redirect('/login');
		return false;

	}

	req.getConnection(function(error, conn){
		var que = "SELECT * FROM user where id= "+req.params.id;
		conn.query(que,function(err,row,field){
			if(err) throw err;
			if(row.length <= 0){
				req.flash('error', 'Data tidak ditemukan!');
				res.redirect('/');

			}else{
				res.render('edit',{
					title: 'Edit your data',
					id: row[0].id,
					email: row[0].email,
					username:row[0].username});
			}


		})
	})
})

app.post('/edit/(:id)', function(req,res){
	req.assert('email',  "email tidak boleh kosong!").notEmpty()
	req.assert('user',   "user tidak boleh kosong!").notEmpty()

	var errors = req.validationErrors();
	if(!errors){
	var data = 
		
		{
    		email: req.sanitize('email').escape().trim(),
    		user: req.sanitize('user').escape().trim(),
    		id: req.sanitize('id').escape().trim()
		}
		req.getConnection(function(error,conn){
			var que  = "UPDATE `user` SET `email` = ?, `username` = ? WHERE `user`.`id` = ?;";
			conn.query(que,[data.email,data.user,data.id],function(err,result){
				if(err)throw err;
				if(result.changedRows == 1)
				{
					res.redirect('/');
				}else{
					res.redirect('/users/edit/'+data.id);
				}
			})

		})

	}
})

app.delete('/delete/(:id)', function(req, res, next) {
	var user = { id: req.params.id }
	
	req.getConnection(function(error, conn) {
		conn.query('DELETE FROM user WHERE id = ' + req.params.id, user, function(err, result) {
			//if(err) throw err
			if (err) {
				req.flash('error', err)
				// redirect to users list page
				res.redirect('/')
			} else {
				req.flash('success', 'User deleted successfully! id = ' + req.params.id)
				// redirect to users list page
				res.redirect('/')
			}
		})
	})
})


module.exports = app;