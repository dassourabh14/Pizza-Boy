const passport = require("passport");

function loginController()
{
    const _getRedirectUrl = (req)=>{
        return req.user.role==='admin' ? '/admin/orders' : '/customers/orders'
    }
    return{
        login(req,res){
            res.render("auth/login");
        },
        postLogin(req,res,next){
            //validate request
            const {email,password}=req.body
            if(!email || !password)
            {
                req.flash("error","All fields are required!!!")
                
                req.flash("email",email);
                req.flash("password",password);
                return res.redirect("/login");
            }
            passport.authenticate('local',(err,user,info)=>{
                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }
               
                req.login(user,(err)=>{
                    if(err){
                    req.flash('error',info.message)
                    return next(err)
                    }

                    return res.redirect(_getRedirectUrl(req))
                })
            })(req,res,next)
        },
    }
}
module.exports=loginController;