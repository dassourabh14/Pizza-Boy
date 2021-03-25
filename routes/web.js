
const homeController = require("../app/http/controllers/homeController");
const cartController = require("../app/http/controllers/auth/cartController");
const registerController = require("../app/http/controllers/auth/registerController");
const loginController = require("../app/http/controllers/auth/loginController");
const orderController=require("../app/http/controllers/auth/orderController");
const adminOrderController=require("../app/http/controllers/admin/orderController");
const statusController=require("../app/http/controllers/admin/statusController");
//middlewares
const guest=require("../app/http/middleware/guest");
const auth=require("../app/http/middleware/auth");
const admin=require('../app/http/middleware/admin');


function initRoutes(app)
{
    app.get('/',homeController().index);
    
    app.get('/login',guest,loginController().login);
    app.post('/login',loginController().postLogin);

    app.get('/register',guest,registerController().register);
    app.post('/register',registerController().postRegister);
    app.post('/logout',registerController().logout);
    app.get('/cart',cartController().cart);
    app.post('/update-cart',cartController().update)
    
    //customer routes
    app.post('/orders',auth,orderController().store)
    app.get('/customers/orders',auth,orderController().index)
    app.get('/customers/orders/:id',auth,orderController().show)

//admin routes
app.get('/admin/orders',admin,adminOrderController().index)
app.post('/admin/order/status',admin,statusController().update)

}
module.exports=initRoutes;