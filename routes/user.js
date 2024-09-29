const { Router } = require ("express");
const { userModel } = require("../db");
const jwt = require("jsonwebtoken")
const {JWT_USER_PASSWORD} = require("../config")

const userRouter = Router();

userRouter.post('/signup', async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    try {
        await userModel.create({
            email:email,
            password:password,
            firstName:firstName,
            lastName:lastName 
        })
    } catch (error) {
        res.json({
            message: "Signup failed"
        })
    }

    res.json({
        message: "Signup succeeded"
    })

})

userRouter.post('/signin', async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await userModel.findOne({
        email: email,
        password: password
    })

    if(user){
        const token = jwt.sign({
            id: user._id
        },JWT_USER_PASSWORD);

        res.json({
            token: token
        })
    }else{
        res.status(403).json({
            message:"Incorrect Credentials"
        })
    }
})

userRouter.get("/purchases", userMiddleware, async function(req, res) {
    const userId = req.userId;

    const purchases = await purchaseModel.find({
        userId,
    });

    const coursesData = await courseModel.find({
        _id: { $in: purchases.map(x => x.courseId) }
    })

    res.json({
        purchases,
        coursesData
    })
})

module.exports = {
    userRouter: userRouter
}