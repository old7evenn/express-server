const { prisma } = require('../prisma/prisma-client')

const PostController = {
	createPost: async (req, res) => {
		const { content } = req.body

		const authorId = req.user.userId

		if (!content)
			return res.status(400).json({ error: 'All fields are required' })

		try {
			const post = await prisma.post.create({
				data: {
					content,
					authorId,
				},
			})

			res.json(post)
		} catch (e) {
			console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
		}
	},
	getAllPost: async (req, res) => {
		const userId = req.user.userId

		try {
			const posts = await prisma.post.findMany({
				include: {
					likes: true,
					comments: true,
					author: true,
				},
				orderBy: {
					createAt: 'desc',
				},
			})

			const postWithLikeInfo = posts.map(post => ({
				...post,
				likeByUser: post.likes.some(like => like.userId === userId),
			}))

			res.json(postWithLikeInfo)
		} catch (e) {
			console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
		}
	},
	getPostById: async (req, res) => {
		const { id } = req.params
		const userId = req.user.userId

		try {
			const post = await prisma.post.findUnique({
				where: { id },

				include: {
					comments: {
						include: {
							user: true,
						},
					},
					likes: true,
					author: true,
				},
			})

			if (!post) return res.status(404).json({ error: 'post no found' })

			const postWithLikeInfo = {
				...post,
				likeByUser: post.likes.some(like => like.userId === userId),
			}

			res.json(postWithLikeInfo)
		} catch (e) {
			console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
		}
	},
	deletePost: async (req, res) => {
		const { id } = req.params
    console.log(id);

		const post = await prisma.post.findUnique({
			where: { id },
		})

		if (!post) return res.status(404).json({ error: 'Post not found' })

		if (post.authorId !== req.user.userId)
			return res.status(403).json({ error: 'You cannot delete this post' })

		try {
			const transaction = await prisma.$transaction([
				prisma.comment.deleteMany({ where: { postId: id } }),
				prisma.like.deleteMany({ where: { postId: id } }),
				prisma.post.delete({ where: { id } }),
			])

			res.json(transaction)
		} catch (e) {
			console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
		}
	},
}

module.exports = PostController
