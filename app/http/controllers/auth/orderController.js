const Order=require("../../../models/order")
const moment=require('moment')
const stripe=require('stripe')(process.env.STRIPE_PRIVATE_KEY)
// const nodemailer=require('nodemailer')






function orderController() {
    return{
        store(req,res){
            
            //validate request
            const {address,phone,stripeToken,paymentType}=req.body
            if(!phone||!address){
                return res.status(422).json({message:'All fields are required!!!'});
                // req.flash('error',"All fields are required!!!")
                // return res.redirect('/cart')
            }
            const order=new Order({
                customerId:req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save().then(result=>{
            Order.populate(result,{path:'customerId'},(err,placedOrder)=>{
                // req.flash("success","Order Placed Successfully :)");
                
          //nodemailer
          

    // var transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       user: 'pizzaria202120@gmail.com',
    //       pass: 'Pizzaria#123'
    //     }
    //   });
    //   var mailOptions = {
    //     from: 'pizzaria202120@gmail.com',
    //     to: `nilkanthabhattacharjee452@gmail.com`,
    //     subject: 'Order details from PizzaBoy',
    //     text: `Thank you for ordering...
    //     `
    //   };
    //   transporter.sendMail(mailOptions, function(error, info){
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       console.log('Email sent: ' + info.response);
    //     }
    //   });







                //stripe Payment
                if(paymentType==='card'){
                    stripe.charges.create({
                        amount: req.session.cart.totalPrice *100,
                        source:stripeToken,
                        currency:'inr',
                        description:`Pizza Order:${placedOrder._id}`
                    }).then(()=>{

                        placedOrder.paymentStatus=true;
                        placedOrder.paymentType=paymentType;
                        placedOrder.save().then((ord)=>{
                            
                            //emit
                        const eventEmitter=req.app.get('eventEmitter')
                        eventEmitter.emit('orderPlaced',ord)
                        delete req.session.cart
                        return res.json({message:'Payment Successful, Order Placed Successfully:)'});
                        }).catch((err)=>{
                            console.log(err)
                        })
                    }).catch((err)=>{
                        delete req.session.cart
                        return res.json({message:'Order Placed but Payment failed...You can pay at delivery time'});
                    })
                }
                else{
                    delete req.session.cart
                    return res.json({message:'Order Placed Successfully!!!'});
                }
                
                
               
              //  return res.redirect("/customers/orders");
            })
                
            }).catch(err=>{
                return res.status(500).json({message:'Something Went Wrong'});
                // req.flash('error',"Something Went Wrong :(")
                // return res.redirect("/cart")
            })
        },
        async index(req,res){

            const orders= await Order.find({customerId: req.user._id},null,{sort:{'createdAt':-1}})
            res.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-scale=0,post-check=0,precheck=0')
            res.render('customers/orders',{orders : orders,moment})

        },
       async show(req,res){
            const order=await Order.findById(req.params.id)
            //authorize user

            if(req.user._id.toString() ===order.customerId.toString()){
                   return res.render('customers/singleOrder',{order: order})
            } 
               return res.redirect('/')
            
        }
    }
}
module.exports=orderController;