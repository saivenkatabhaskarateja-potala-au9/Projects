//controller
var express = require('express');
var postRouter = express.Router();
const mongodb = require('mongodb');
const url =
  "mongodb+srv://sai_test:1234@cluster0.3vhbk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var mongoClient = new mongodb.MongoClient(url);
let dbobj;

console.log("came to postrouter")
mongoClient.connect((err) => {
  if (err) throw err;
  dbobj = mongoClient.db("aryablog");
  console.log("inside postrouter mongo client dbobj", dbobj);
});


function postpage(){

    
    postRouter.route('/')
    .get((req,res) => {
        if(!req.session.user){
            res.redirect("/?errmessage=No Session Found! Please try again")
        }
        console.log("dbobj inside postRouter ",dbobj)
        dbobj.collection('posts').find({isActive:true}).toArray((err,data) => {
            //res.send({postdata:data,userdata:req.session.user})
            res.render('post',{postdata:data,userdata:req.session.user})
        })
    })


    postRouter.route('/displayAdd')
    .get((req,res) => {
        if(!req.session.user){
            res.redirect("/?errmessage=No Session Found! Please try again")
        }else{
            let user = req.session.user;
            let err = req.query.errmessage?req.query.errmessage:''
            res.render('addPost',{userdata:user,errmessage:err})
        }
    })

    postRouter.route('/addPost')
        .post((req,res) => {
            
            if(!req.session.user){
                res.redirect("/?errmessage=No Session Found! Please try again")
            }
            console.log(req.body)
            let data = {
                title:req.body.title,
                description:req.body.description,
                createBy:req.session.user.name,
                createrId:req.session.user._id,
                isActive:true,
                tags:req.body.tags,
                date:new Date(Date.now()).toISOString(),
                lastupdatedate:new Date(Date.now()).toISOString()
            }

            dbobj.collection('posts').insert(data,(err,result)=>{
                res.redirect('/post')
            })
    })

    //editpost
    postRouter.route('/edit/:id')
    .get((req,res) => {
        if(!req.session.user){
            res.redirect("/?errmessage=No Session Found! Please try again")
        }
        let Id = mongodb.ObjectID(req.params.id);
        dbobj.collection('posts').findOne({_id:Id,isActive:true},(err,data) => {
            console.log("edit data>>>",data)
            res.render('edit',{data,userdata:req.session.user})
        })
    })

    //updatepost
    postRouter.route('/editPost/:id')
    .post((req,res) => {
        if(!req.session.user){
            res.redirect("/?errmessage=No Session Found! Please try again")
        }
        let Id = mongodb.ObjectID(req.params.id);
        dbobj.collection('posts').update(
            {_id:Id},
            {
                $set:{
                    title:req.body.title,
                    description:req.body.description,
                    tags:req.body.tags,
                    lastupdatedate:new Date(Date.now()).toISOString()
                }
            },(err,result) => {
                if(err) throw err;
                res.redirect('/post')
            }
        )
    })

    //delete user
    postRouter.route('/deletePost/:id')
    .get((req,res) => {
        if(!req.session.user){
            res.redirect("/?errmessage=No Session Found! Please try again")
        }
        let Id = mongodb.ObjectID(req.params.id);
        dbobj.collection('posts').remove({_id:Id},(err,result) => {
                if(err) throw err;
                res.redirect('/post')
        })
    })

    return postRouter;
}



module.exports = postpage