const {Router} = require ("express")
const {adminModel, courseModel} = require("../db")
const jwt = require("jsonwebtoken")
const {JWT_ADMIN_PASSWORD} = require("../config")
const { adminMiddleware } = require("../middleware/admin")
const { default: mongoose } = require("mongoose")

const adminRouter = Router()

adminRouter.post('/signup', async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    try {
        await adminModel.create({
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

adminRouter.post('/signin', async function (req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const user = await adminModel.findOne({
        email: email,
        password: password
    })

    if(user){
        const token = jwt.sign({
            id: user._id
        },JWT_ADMIN_PASSWORD);

        res.json({
            token: token
        })
    }else{
        res.status(403).json({
            message:"Incorrect Credentials"
        })
    }
})

adminRouter.post('/course', adminMiddleware, async function(req,res){
    const adminId = req.userId;
    
    const {title, description, price, imageUrl} = req.body
    
    const course = await courseModel.create({
        title,
        description,
        price,
        imageUrl,
        creatorId: adminId
    })

    res.json({
        message:"Course Created",
        courseId: course._id
    })
})

adminRouter.put("/course", adminMiddleware, async function(req, res) {
    const adminId = req.userId;

    const { title, description, imageUrl, price, courseId } = req.body;
    
    const course = await courseModel.updateOne({
        _id: courseId, 
        creatorId: adminId 
    }, {
        title: title, 
        description: description, 
        imageUrl: imageUrl, 
        price: price
    })

    res.json({
        message: "Course updated",
        courseId: course._id
    })
})

adminRouter.get("/course/bulk", adminMiddleware,async function(req, res) {
    const adminId = req.userId;

    const courses = await courseModel.find({
        creatorId: adminId 
    });

    res.json({
        message: "Course updated",
        courses
    })
})

module.exports= {
    adminRouter: adminRouter
}