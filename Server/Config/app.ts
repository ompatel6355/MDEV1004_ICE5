import createError, { HttpError } from 'http-errors';
import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

// modules for authentication
import session from 'express-session';
import passport from 'passport';
import passportLocal from 'passport-local';

// define authentication strategy
let strategy = passportLocal.Strategy; // alias

// import the User Model
import User from '../Models/user';

// import mongoose and related modules
import mongoose from 'mongoose';
import db from './db';

mongoose.connect(db.remoteURI);

// DB Connection Events
mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB Atlas`);
})


import indexRouter from '../Routes/index';
import { dot } from 'node:test/reporters';

// create an express application
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// setup express session
app.use(session({
  secret: db.secret,
  saveUninitialized: false,
  resave: false
}));

// initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// implement an authentication strategy
passport.use(User.createStrategy());

// serialize and deserialize the User info
passport.serializeUser(User.serializeUser() as any);
passport.deserializeUser(User.deserializeUser());

app.use('/api', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err: HttpError, req:Request, res:Response, next:NextFunction) 
{
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.end('error - please use /api as a route prefix for your API requests');
});

export default app;
