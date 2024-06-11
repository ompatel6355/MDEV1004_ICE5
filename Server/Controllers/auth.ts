import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import mongoose from 'mongoose';

import User from '../Models/user';

/**
 * Processes the Registration Request
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function ProcessRegistration(req:Request, res:Response, next:NextFunction): void
{
    // instantiate a new user object
    let newUser = new User
    ({
        username: req.body.username,
        emailAddress: req.body.emailAddress,
        displayName: req.body.firstName + " " + req.body.lastName
    });

    User.register(newUser, req.body.password, (err) =>
    {
        if(err instanceof mongoose.Error.ValidationError)
        {
            console.error("All Fields are Required");
            return res.status(400).json({success: false, msg: "ERROR: User not registered. All Fields are Required", data: null});
        }

        if(err)
        {
            console.error("ERROR: Inserting New User");
            if(err.name == "UserExistsError")
            {
                console.error("ERROR: User already exists");
            }
            return res.status(400).json({success: false, msg: "ERROR: User not registered", data: null});
        }

        return passport.authenticate('local')(req, res, () =>
        {
            return res.json({success: true, msg: "User Logged in successfully", data: newUser});
        });
    });
}

/**
 * Processes the Login Request
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function ProcessLogin(req:Request, res:Response, next:NextFunction): void
{
    passport.authenticate('local', (err: any, user: any, info: any)=>
    {
        // are there any server errors?
        if(err)
        {
            console.error(err);
            return res.status(400).json({success: false, msg: "ERROR: Server Error", data: null});
        }

        // are there any login errors?
        if(!user)
        {
            console.error("Login Error: User Credentials Error or User Not Found");
            return res.status(400).json({success: false, msg: "ERROR: Login Error", data: null});
        }

        req.login(user, (err) =>
        {
            // are there any database errors?
            if(err)
            {
                console.error(err);
                return res.status(400).json({success: false, msg: "ERROR: Database Error", data: null});
            }

            return res.json({success: true, msg: "User Logged in successfully", data: user});
        });
    })(req, res, next);
}

/**
 * Processes the Logout Request
 *
 * @export
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export function ProcessLogout(req:Request, res:Response, next:NextFunction): void
{
    req.logOut(()=>{
        console.log("User Logged out successfully");
        return res.json({success: true, msg: "User Logged out successfully", data: null});
    });
}