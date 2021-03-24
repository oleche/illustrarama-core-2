const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const methodOverride = require('method-override');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const cron = require('node-cron');

const index = require('./routes/index');
const news = require('./routes/news');
const subscriptions = require('./routes/subscriptions');
const search = require('./routes/search');
const providers = require('./routes/providers');
const showcase = require('./routes/showcase');

const newsModel = require('./model/news');
const providersModel = require('./model/providers');
const newsContentModel = require('./model/news-content');
const subscriptionModel = require('./model/subscription');

const mailing = require('./service/mailing');

let database = require('./config/database');
const databaseTest = require('./config/database-test');

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'test') {
  database = databaseTest;
}

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(database.url)
  .then(() => {
    console.log('Successfully connected to the database');
  }).catch((err) => {
    console.log('Could not connect to the database. Exiting now...');
    console.log(err);
    process.exit();
  });

app.use((req, res, next) => {
  res.locals.news = newsModel;
  res.locals.newsContent = newsContentModel;
  res.locals.providers = providersModel;
  res.locals.subscription = subscriptionModel;
  res.locals.mongoose = mongoose;
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(cors());

app.use('/', index);
app.use('/api/v1/news', news);
app.use('/api/v1/subscriptions', subscriptions);
app.use('/api/v1/search', search);
app.use('/api/v1/providers', providers);
app.use('/api/v1/showcase', showcase);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  next(err);
});

// cronjobs
cron.schedule('0 0 * * SUN', () => {
  mailing.weekly(newsModel, subscriptionModel);
});

module.exports = app;
