const express = require('express');
const app = express();
const path = require('path')
const usermodel = require('./models/user');

app.set("view engine" , "ejs")
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req,res){
    res.render("index");
    console.log("Running home route")
})
app.get('/read', async function(req,res){
    let allusers = await usermodel.find();
    res.render("read", {users: allusers});
    console.log("Running read route")
})
app.get('/delete/:id', async function(req,res){
    let allusers = await usermodel.findByIdAndDelete(req.params.id);
    res.redirect("/read");
    console.log("Deleting User")
})

app.get('/edit/:id', async function(req,res){
    let allusers = await usermodel.findById(req.params.id);
    res.render("edit", {user : allusers});
    console.log("editing User")
})

app.post('/update/:id', async function(req,res){
    let {name , email , image}=req.body;
    let allusers = await usermodel.findByIdAndUpdate(req.params.id, {name , email , image} , {new:true});
    res.redirect('/read');
    console.log("updating User")
})
app.post('/create', async function(req,res){
    let{name,email,image} = req.body;
    let createduser = await usermodel.create({
        name:name,
        email:email,
        image:image
    }) 

    res.redirect('/');
    console.log("Create route")
})

app.listen(3000);
