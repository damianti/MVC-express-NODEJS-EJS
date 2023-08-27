var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var express = require('express');
var path = require('path');
var authenticationRouter = require('./routes/authenticationRoutes');
var apiRouter = require('./routes/apiRoutes');
const session = require('express-session');

var app = express();

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))
// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
// make public folder visible for static files (client side javascript)
app.use(express.static(path.join(__dirname, 'public')));



app.use(authenticationRouter);
app.use('/api',apiRouter);



// 404 error handler
app.use(function(req, res, next) {
  res.status(404);
  res.render('404', { url: req.url });
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { error: err });
});

module.exports = app;

