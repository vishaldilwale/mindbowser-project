const express = require('express');
const router = express.Router();
const User = require('../models/User');



router.post('/',  async (request , response) => {

    try {
        let email= request.body.email;
        console.log(email);

        // check user exist
        let user = await User.findOne({email : email});

        //create new user
        if(!user){
            let user = {
                email : request.body.email,
                favourites : request.body.favourites,
            };

            // save user to DB
            user = new User(user);
            user = await user.save();
            console.log(`newUser is ${user}`);
            response.status(200).json({
                result : 'success',
                user : user
            });
        }
        else{

            //Update existing user
            let result=JSON.stringify(request.body);
            console.log(`result is ${result}`);
            let email=request.body.email;
            let favourites=request.body.favourites;
            let _id=request.body._id;

            let updatedUser={
                email:email,
                favourites:favourites
            };

            // Get user id to be updated
            let userId= _id;

            //update user
            user = await User.findByIdAndUpdate(userId , {
                $set : updatedUser
            }, { new : false});
            console.log(`user added to database ${updatedUser}`)
            response.status(200).json({
                result : 'User is Updated',
                user : user
            })
        }
        }
    catch (error) {
        console.error(error);
        response.status(500).json({msg : 'Server Error'});
    }
});

// Get email params to fetch favourites
router.get('/:email' , async (request , response) => {
    try {
        let {email } = request.params;
        console.log(email);
        let user = await User.findOne({email : email});
        console.log(user);

        // Check user exist
        if(!user){
            return response.status(401).json({ errors : {msg : 'User Not Found'}});
        }

        // Send user data to client
        response.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        response.status(500).json({msg : 'Server Error'});
    }
});



module.exports = router;
