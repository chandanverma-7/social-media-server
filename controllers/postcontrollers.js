const Post = require("../models/Post");
const User = require("../models/User");
const {success,error}=require('../utils/responsewraper');
const { mapPostOutput } = require("../utils/utils");
const cloudinary =require('cloudinary').v2

const createPostController= async (req,res)=>{
    try {
        const {caption,postImg}=req.body;
        if(!caption || !postImg){
            return res.send(error(400,'Caption and Post Image is required'))
        }
        
        const cloudImg=await cloudinary.uploader.upload(postImg,{
            folder:'postImg'
        })

        const owner=req._id;
        const user= await User.findById(req._id)

    const post= await Post.create({
        owner,
        caption,
        image:{
            publicId:cloudImg.public_id,
            url:cloudImg.url
        }
    });
    user.posts.push(post._id)
    await user.save();
    return res.json(success(200,{post}))
    } catch (e) {
        res.send(error(500,e.message))
    }
    
}

const likeAndUnlikePost= async (req,res)=>{
    try {
        const {postId}=req.body;
        const currUserId=req._id;
        const post=await Post.findById(postId).populate('owner');
        if(!post){
            return res.send(error(404,'post not found'))
        }
        if(post.Likes.includes(currUserId)){
            const index=post.Likes.indexOf(currUserId);
            post.Likes.splice(index,1)
        }else{
            post.Likes.push(currUserId);
        }
        await post.save();
        return res.send(success(200,{post:mapPostOutput(post,req._id)}));
    } catch (e) {
        console.log();
        return res.send(error(500,e.message))
    }
        
}

const updatePostController=async (req,res)=>{
    try {
        const {postId,caption}=req.body;
    const currUserId=req._id;
    const post=await Post.findById(postId)
    if(!post){
        return res.send(error(404,'Post not found'))
    }
    if(post.owner.toString()!==currUserId){
        return res.send(error(403,'Only owner can update their post'))
    }
    if(caption){
        post.caption=caption
    }
    await post.save();
    return res.send(success(200,{post}))
    // similarly if we want to update the image then we can do that too
    // if(caption){
    //     post.image=image
    // }
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message))
    }
}
const deletePostController=async (req,res)=>{
    try {
        const {postId}=req.body;
        const currUserId=req._id;
        const post=await Post.findById(postId)
        const currUser=await Post.findById(currUserId)
        if(!post){
            return res.send(error(404,'Post not found'))
        }
        if(post.owner.toString()!==currUserId){
            return res.send(error(403,'Only owner can delete their post'))
        }

        const index=await currUser.posts.indexOf(postId);
        currUser.posts.splice(index,1);
        await currUser.save();
        await post.remove();
        return res.send(success(200,'Post deleted successfully'))
    } catch (e) {
        console.log(e);
        return res.send(error(500,e.message))
    }
}



module.exports={createPostController,
    likeAndUnlikePost,
    updatePostController,
    deletePostController}