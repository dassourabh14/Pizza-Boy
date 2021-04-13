const User = require("../../../models/user");

const bcrypt = require('bcrypt');
function registerController(){
    return{
        register(req,res)
        {
            res.render("auth/register");
        },
        async postRegister(req,res)
        {
            const {fname,lname,email,reemail,pass,repass} =req.body;
            //validate request
            if(!fname || !lname || !email || !reemail ||!pass || !repass)
            {
                req.flash("error","All fields are required!!!")
                req.flash("fname",fname);
                req.flash("lname",lname);
                req.flash("email",email);
                req.flash("reemail",reemail);
                return res.redirect("/register");
            }
            if(email != reemail){
                req.flash('error','Email fields should match!!!');
                req.flash("fname",fname);
                req.flash("lname",lname);
                return res.redirect("/register");
            }
            if(pass!=repass){
                req.flash('error',"Password doesn't match");
                req.flash("fname",fname);
                req.flash("lname",lname);
                req.flash("email",email);
                req.flash("reemail",reemail);
                return res.redirect("/register");
            }
    
//email validation
User.exists({email: email },(err,result)=>{
    if(result){
        req.flash("error","email already exists!!!")
        req.flash("fname",fname);
        req.flash("lname",lname);   
        return res.redirect("/register");
    }
                })
//hashing my password
const hashedpassword=await bcrypt.hash(pass,10);
            //create user

            const user= new User({
               first_name:fname,
               last_name:lname,
               email:email,
               password:hashedpassword,
              
            })
            user.save().then((user) => {
                //login


                return res.redirect("/");
            }).catch(err =>{
                req.flash("error","Oops something went wrong!!!")
                req.flash("fname",fname);
                req.flash("lname",lname);
                req.flash("email",email);
                req.flash("reemail",reemail);
                return res.redirect("/register");
            })
        },    
           logout(req,res) {
               req.logout()
               return res.redirect('/login')
           }
        
        
            
    }
}
module.exports=registerController;