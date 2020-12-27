const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const User = require('./models/User');
const Post = require('./models/Post');
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser');
require('./lib/mongoose');
const app = express();

app.use(express.json())
app.use(express.urlencoded())
app.use(methodOverride('_method'))
app.use(express.static('./public'))
app.use(cookieParser());
app.set('view engine', 'ejs')
app.use(session({
  secret: '($*YA)*@#12asd^%#',
  resave: false,
  saveUninitialized: true
}))

app.get('/', (req, res) => {
  if(req.cookies['user']) req.session.user = req.cookies['user'];
  const { message } = req.query;
  return res.render('main', { user: req.session.user, message })
  
})

app.get('/posts', async (req, res) => {
  if(!req.session.user) return res.redirect('/');

  const posts = await Post.find()
  res.render('posts', { posts, user: req.session.user })
})

app.get('/posts/create', (req, res) => {
  if (!req.session.user) return res.redirect('/')
  res.render('createPost')
})


app.get('/posts/:postId', async (req, res) => {
  if(!req.session.user) return res.redirect('/');

  const postId = req.params.postId
  const post = await Post.findOneAndUpdate({ _id: postId }, { $inc: { hit: 1 } }, { new: true })
  res.render('postDetail', { post, user: req.session.user })
})

app.get('/registry', (req, res) => {
  res.render('registry')
})

app.post('/posts', (req, res) => {
  // 로그인 안돼있을 때 메인으로 가는 코드
  if (!req.session.user) return res.redirect('/')

  const { body: { title, content } } = req
  // DB에 실제로 들어가는 코드
  Post.create({ title, content, writer: req.session.user._id })
  res.redirect('/posts')
})

app.post('/login', async (req, res) => {
  const { body: { id, pw, remember_user } } = req
  // encrypted password
  const epw = crypto.createHash('sha512').update(id + 'digitech' + pw + '회장 강현구').digest('base64')
  const data = await User.findOne({ id, pw: epw })
  if (data) {
    if(remember_user) {
      let date = new Date(Date.now() + 86400e3);
      res.cookie('user', data, { expires: date });
    } 
    req.session.user = data;
    res.redirect('/');
  } else {
    res.redirect('/?message=로그인에 실패하셨습니다.')
  }
})

app.post('/posts/:postId/comments', async (req, res) => {
  const postId = req.params.postId;
  const writer = req.session.user._id;
  const writer_name = req.session.user.name;
  const { body : { content } } = req;
  
  await Post.update({_id : postId}, { $push: { comments : { content, writer, writer_name } }});
  res.redirect(`/posts/${postId}`);
})

app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  await Post.updateOne({ _id: postId }, { $pull: {comments: {_id: commentId} } } );

  res.redirect(`/posts/${postId}`);
})

app.delete('/posts/:postId', async (req, res) => {
  if(!req.session.user) return res.redirect('/');

  const postId = req.params.postId
  await Post.deleteOne({ _id: postId })
  res.redirect('/posts')
})

// 원래는 페이지를 보여주는 API 이기 때문에 get으로 해야됨
app.put('/posts/:postId', async (req, res) => {
  if(!req.session.user) return res.redirect('/');

  console.log("test");

  const postId = req.params.postId
  let searchPost = await Post.findOne({ _id: postId });
  res.render('updatePost', { searchPost });
})

app.put('/posts/:postId/update', async (req, res) => {
  const postId = req.params.postId;
  const { body : { title, content } } = req;
  
  const post = await Post.updateOne({_id : postId}, { title, content });
  res.redirect(`/posts/${postId}`);
})

app.get('/logout', (req, res) => {
  delete req.session.user
  res.clearCookie('user');
  res.redirect('/')
})

app.post('/registry', (req, res) => {
  const { body: { id, pw, name } } = req
  const epw = crypto.createHash('sha512').update(id + 'digitech' + pw + '회장 강현구').digest('base64')
  User.create({ id, pw: epw, name }).catch(console.log)
  res.redirect('/')
})

app.post('/users', async (req, res) => {
  const { body : { pw } } = req;
  let data = "당신은 관리자가 아니군요?";;

  if(pw === 'dokdogalmaegi') data = await User.find({ });  

  res.json(data);
})

const port = 8000
app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})