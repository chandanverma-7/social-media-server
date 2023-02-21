const router=require('express').Router();
const postcontroller=require('../controllers/postcontrollers');
const requireuser=require('../middleware/requireuser');

router.post('/',requireuser,postcontroller.createPostController);
router.post('/like',requireuser,postcontroller.likeAndUnlikePost);
router.put('/',requireuser,postcontroller.updatePostController);
router.delete('/',requireuser,postcontroller.deletePostController);


module.exports=router;