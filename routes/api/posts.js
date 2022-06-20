const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const User = require("../../models/User");
const auth = require("../../middlewares/Auth");

//Create Post
//Private Route
router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    });
    const post = await newPost.save();
    res.send(post);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//All posts
//private Router
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.send(posts);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//get Single Post
//Private Route
router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      res.status(404).json({ msg: "Post not found" });
    } else res.json(post);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//delete Post
//Private Router
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (req.user.id != post.user.toString()) {
      return res.status(401).send("Authorization failed");
    }
    await post.remove();
    res.send("Post deleted Succesfully");
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//like Post
//Private Route
router.put("/like/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    const user = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    );
    console.log(user);
    if (user.length == 0) {
      post.likes.unshift({ user: req.user.id });
    }
    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//unlike post
//private route
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    const user = post.likes.filter(
      (like) => like.user.toString() === req.user.id
    );
    const index = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    console.log(index);
    if (index != -1) post.likes.splice(index, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//Comment
//Private Route
router.post("/comment/:id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    const user = await User.findById(req.user.id).select("-password");
    const comment = {
      user: req.user.id,
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
    };
    post.comments.unshift(comment);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

//delete comment
//priavte route
router.delete("/comment/:id/:comm_id", auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    const index = post.comments
      .map((comment) => comment.id.toString())
      .indexOf(req.params.comm_id);
    console.log(index);
    if (index != -1) {
      console.log("hi", post.comments[index]);
      if (post.comments[index].user.toString() === req.user.id) {
        console.log("right");
        post.comments.splice(index, 1);
      } else {
        console.log("wrong");
        return res.status(400).json({ msg: "Authorization failed" });
      }
    }
    await post.save();
    res.json(post);
    post.likes.map((like) => like.user.toString()).indexOf(req.user.id);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
