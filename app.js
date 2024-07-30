const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const usermodel = require("./models/user")
const postmodel = require("./models/post")

app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(express.static('public'));

app.get("/" , (req,res)=>{
    res.render("index")
})
app.post("/register" , async (req,res)=>{
    let{email,password,username,age,name,image}=req.body
    let user = await usermodel.findOne({email});
    if(user) return res.status(300).send("User Already Registered");
    
    bcrypt.genSalt(10 , (err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
            let user = await usermodel.create({
                username : username,
                image:image,
                email:email,
                age:age,
                name:name,
                password: hash
            })

            let token = jwt.sign({email:email, userid: user._id},"SECRETKEY")
            res.cookie("token", token)
            res.redirect("/login")
        })
    })
})
app.get("/login" , (req,res)=>{
    res.render("login")
})
app.post("/login" , async (req,res)=>{
    let{email,password,username,age,name,image}=req.body
    let user = await usermodel.findOne({email});
    if(!user) return res.status(300).send("Something Went Wrong");

    bcrypt.compare(password , user.password , (err,result)=>{
        if(result) {
            let token = jwt.sign({email:email, userid: user._id},"SECRETKEY")
            res.cookie("token", token)
            res.status(200).redirect("/profile")
        }

        else res.redirect("/login")
    }) 

})

app.get("/logout" , (req,res)=>{
    res.cookie("token", "")
    res.redirect("login")
})

//Middleware
function isLoggedIn (req,res,next){
    if(req.cookies.token === "") res.redirect("/login")
        else{
              let data = jwt.verify(req.cookies.token, "SECRETKEY")
              req.user = data;
        }
        next();
}

app.get("/profile", isLoggedIn , async (req,res)=>{
    let user = await usermodel.findOne({email: req.user.email}).populate("posts");  //to populate post's content
    res.render("profile" , {user})
})
app.post("/post", isLoggedIn , async (req,res)=>{
    let user = await usermodel.findOne({email: req.user.email});
    let {content} = req.body;
    let post = await postmodel.create({
        user : user._id,
        content : content
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile")
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
    let post = await postmodel.findOne({_id: req.params.id}).populate("user");
    
    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid);
    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    
    await post.save();
    res.redirect("/profile"); 
});

app.listen(3000);