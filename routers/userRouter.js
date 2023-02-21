const router=require('express').Router();
const { followOrUnfollowUserController, 
    getFeedData, getMyPosts,
     getUserPosts, deleteMyProfile ,getMyInfo,updateUserProfile,getUserProfile} = require('../controllers/usercontroller');
const requireuser = require('../middleware/requireuser');

router.post('/follow',requireuser,followOrUnfollowUserController)
router.get('/getFeedData',requireuser,getFeedData)
router.get('/getmyposts',requireuser,getMyPosts)
router.get('/getuserposts',requireuser,getUserPosts)
router.delete('/',requireuser,deleteMyProfile)
router.get('/getmyinfo',requireuser,getMyInfo)
router.put('/',requireuser,updateUserProfile)
router.post('/getuserprofile',requireuser,getUserProfile)
module.exports=router;