const express = require('express')
const router = express.Router()
const multer = require('multer')
const {
	UserController,
	PostController,
	CommentController,
  LikeController,
  FollowController,
} = require('../controllers')
const { authenticateToken } = require('../middleware/auth')

const destination = 'uploads'

const storage = multer.diskStorage({
	destination,
	filename: function (req, file, cb) {
		cb(null, file.originalname)
	},
})

const uploads = multer({ storage })
// User
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get('/users/:id', authenticateToken, UserController.getUserById)
router.get('/current', authenticateToken, UserController.current)
router.put('/users/:id', authenticateToken, uploads.single('avatar'), UserController.updateUser)

//Post
router.post('/posts', authenticateToken, PostController.createPost)
router.get('/posts', authenticateToken, PostController.getAllPost)
router.delete('/post/:id', authenticateToken, PostController.deletePost)
router.get('/post/:id', authenticateToken, PostController.getPostById)

// Comment
router.post('/comment/:id', authenticateToken, CommentController.createComment)
router.delete(
	'/comment/:id',
	authenticateToken,
	CommentController.deleteComment
)

// Like 
router.post('/like/:id', authenticateToken, LikeController.likePost)
router.delete('/like/:id', authenticateToken, LikeController.unlikePost)

// Follow 
router.post('/follow/:id', authenticateToken, FollowController.followUser)
router.delete('/follow/:id', authenticateToken, FollowController.unfollowUser)

module.exports = router
