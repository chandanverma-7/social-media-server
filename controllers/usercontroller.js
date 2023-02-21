const user= require('../models/User')
const post= require('../models/Post')
const {error,success}=require('../utils/responsewraper');
const { mapPostOutput } = require('../utils/utils');
const cloudinary = require('cloudinary').v2;
const followOrUnfollowUserController= async (req,res)=>{
   try {
    const {userIdToFollow}=req.body;
    const currUserId=req._id;
    const userToFollow= await user.findById(userIdToFollow)
    const currUser= await user.findById(currUserId)
    if(currUserId===userIdToFollow){
        return res.send(error(409,'Can not follow yourself'))
    }
    if(!userToFollow){
        return res.send(error(404,'User not found'))
    }
    if(currUser.followings.includes(userIdToFollow )){
        // already followed
        const followingIndex= currUser.followings.indexOf(userIdToFollow);
        currUser.followings.splice(followingIndex,1);

        const followerIndex=userToFollow.followers.indexOf(currUserId); 
        userToFollow.followers.splice(followerIndex,1);
    }else{
        // if not following 
        currUser.followings.push(userIdToFollow);
        userToFollow.followers.push(currUserId);
    }
    await userToFollow.save()
    await currUser.save()
    return res.send(success(200,{user:userToFollow}))
   } catch (e) {
    console.log(e);
    return res.send(error(500,e.message))
   }
}
const getFeedData=async (req,res)=>{
      try {
        const userId=req._id;
        const currUser=await user.findById(userId).populate('followings')
        const fullPosts=await post.find({
            'owner':{
                $in:currUser.followings
            }
        }).populate('owner')

        const posts=fullPosts.map(item=>mapPostOutput(item,req._id)).reverse() 

        const followingsIds =currUser.followings.map(item =>item._id)
        followingsIds.push(req._id)

        const suggestions= await user.find({
            _id:{
                $nin:followingsIds
            }
        })

        return res.send(success(200,{...currUser._doc,suggestions,posts}))
      } catch (e) {
        console.log(e);
        return res.send(error(500,e.message))
      }
}

const getMyPosts= async(req,res)=>{
    const currUserId=req._id;
    try {
         const allUserPosts=await post.find({
            owner:currUserId
         }).populate('likes')
         return res.send(success(200,{allUserPosts}))
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message))
        
    }
}

const getUserPosts= async(req,res)=>{
    const {userId}=req.body;
    if(!userId){
        return res.send(error(400,'UserId is required'))
    }
    try {
         const allUserPosts=await post.find({
            owner:userId
         }).populate('likes')
         return res.send(success(200,{userId}))
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message))
        
    }
}

const deleteMyProfile=async (req,res)=>{
    try {
        const userId=req._id;
        const currUser= await user.findById(userId)
        //delete all posts
        await post.deleteMany({
            owner:userId
        })
        // remove myself from followers' followings
        currUser.followers.forEach(async(followerId) =>{
            const follower= await user.findById(followerId)
            const index=follower.followings.indexOf(currUserId)
            follower.followings.splice(index,1)
            await follower.save();
        })
        // remove myself from my followings' follower 
        currUser.followings.forEach(async(followingId) =>{
            const following = await user.findById(followingId)
            const index=following.followers.indexOf(currUserId)
            following.followers.splice(index,1)
            await follower.save();
        })
        // remove my self from all likes
        const allposts=await post.find()
        allposts.forEach(async(post) =>{
            const index= post.likes.indexOf(userId)
            post.likes.splice(index,1)
            await post.save();

        })
        await currUser.remove();
        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true
        })
        return res.send(success(200,'User deleted'))
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message))
    }
}

const getMyInfo=async (req,res)=>{
    try {
      const userId=req._id;
      const currUser=await user.findById(userId)
      return res.send(success(200,{currUser}))
    } catch (e) {
      console.log(e);
      return res.send(error(500,e.message))
    }
}
const updateUserProfile=async (req,res)=>{
    try {
      const {name,bio,img}=req.body
      const curruser=await user.findById(req._id)
      if(name){
        curruser.name=name
      }
      if(bio){
        curruser.bio=bio
      }
      if(img){
        const cloudImg=await cloudinary.uploader.upload(img,{
            folder:'profileImg'
        })
        curruser.avatar={
            url:cloudImg.secure_url,
            publicId:cloudImg.public_id
        }
        
    }
    await curruser.save();
      return res.send(success(200,{curruser}))
    } catch (e) {
      console.log(e);
      return res.send(error(500,e.message))
    }
}

const getUserProfile=async (req,res)=>{
    try {
      const userId=req.body.userId;
      const currUser=await user.findById(userId).populate({
        path:'posts',
        populate:{
            path:'owner'
        }
      })

      const fullPosts=currUser.posts
      const posts=fullPosts.map(item=>mapPostOutput(item,req._id)).reverse()

      return res.send(success(200,{...currUser._doc,posts}))
    } catch (e) {
      return res.send(error(500,e.message))
    }
}

module.exports={followOrUnfollowUserController,
    getFeedData,
    getMyPosts,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile
};