const router = require('express').Router()  ;
const authcontroller=require('../controllers/authcontroller')

router.post('/signup',authcontroller.signupcontroller)
router.post('/login',authcontroller.logincontroller)
router.get('/refresh',authcontroller.refershaccesstokencontroller)
router.post('/logout',authcontroller.logoutController)

module.exports=router;