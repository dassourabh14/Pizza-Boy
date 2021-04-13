
import axios from 'axios'
import Noty from 'noty' 
import {initAdmin} from "./admin"
import moment from 'moment'
import { initStripe } from './stripe'

let addToCart=document.querySelectorAll('.add-to-cart')
let cartCounter=document.querySelector('.cartCounter');

function updateCart(pizza){
 
  axios.post('/update-cart', pizza).then(res=>{
cartCounter.innerText=res.data.totalQty;
   
        new Noty({
            type:'info',
            text: 'Item Added To Cart',
            timeout:1000
        }).show();
        
}).catch(err=>{
  new Noty({
    type:'error',
    text: 'Something Went Wrong',
    timeout:2000
}).show();
})

}
addToCart.forEach((btn)=>{
btn.addEventListener('click',(e)=>{
  
    let pizza=JSON.parse(btn.dataset.pizza);
    updateCart(pizza);
   
});
});


//remove the alert message at the cart successfull file
const alertMsg=document.querySelector('#success-alert')
if(alertMsg) {
  setTimeout(()=>
  {
    alertMsg.remove()
  },1000
  )
}


//change order status
let statuses=document.querySelectorAll('.status-line')
let order=document.querySelector('#hiddenInput')?document.querySelector('#hiddenInput').value: null
order=JSON.parse(order) ;
let time=document.createElement('small')


function updateStatus(order)
{
  statuses.forEach((status)=>{
    status.classList.remove('step-completed')
    status.classList.remove('current')
  })
let stepCompleted=true;

statuses.forEach((status)=>{
let dataProp=status.dataset.status
if(stepCompleted){
  status.classList.add('step-completed')
}
if(dataProp===order.status){
  stepCompleted=false;
  time.innerText=moment(order.updatedAt).format('hh:mm A')
  status.appendChild(time);
  if( status.nextElementSibling.classList){
    status.nextElementSibling.classList.add('current')
  }

}
})

}
updateStatus(order);

initStripe()



let socket=io()
initAdmin(socket)
if(order){
  socket.emit('join',`order_${order._id}`)
}
let adminAreaPath=window.location.pathname;
if(adminAreaPath.includes('admin')){
  socket.emit('join','adminRoom')
}
socket.on('orderUpdated',(data)=>{
  const updatedOrder={...order}
  updatedOrder.updatedAt=moment().format()
  updatedOrder.status=data.status
  updateStatus(updatedOrder)
  new Noty({
    type:'info',
    text: 'Your Order is Updated',
    timeout:2000
}).show();
})
