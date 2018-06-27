var express = require('express')
var app = express()
var mysql = require('mysql')
var connect = require('express-myconnection')
var csrf = require('csurf')
var port = 3000
var db = {
	host: 'localhost',
	user: 'root',
	pass: '',
	database  : 'golix'
};

// db.connect(function(err){
// 	if(err) throw err 
// console.log('Database Connected!')
// })

app.use(connect(mysql, db, 'pool'))
app.set('view engine', 'ejs')



var index = require('./routes/index')
var users = require('./routes/users')
var csrfProtection = csrf({ cookie: true })
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

var evalid = require('express-validator')
app.use(evalid())

var methodOverride = require('method-override')

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser('keyboard cat'))
app.use(session({ 
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
	cookie: { maxAge: 6000000 } //60000 = 1 menit
}))
app.use(express.static('public'))

app.use(csrf({ cookie: true }))
app.get('*', function (req, res, next) {
  res.locals.csrfToken = req.csrfToken()
  next()
})
app.post('*', function (req, res, next) {
  res.locals.csrfToken = req.csrfToken()
  next()
})
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
  // handle CSRF token errors here
  res.status(403)
  res.render('error', {
    message: 'Error No Token Found!',
    error: {}
  })
})

app.use(flash())
app.use('/', index)
app.use('/users', users)
app.listen(port, () => console.log('Server RUN in localhost:'+port))

//module.exports = app;