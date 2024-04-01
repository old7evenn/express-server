const { prisma } = require("../prisma/prisma-client")

const LikeController = {
  likePost: async (req, res) => {
    const postId = req.params.id
    const userId = req.user.userId

    if (!postId) return res.status(400).json({ error: 'All fields are required' })

    try {
      const isLike = await prisma.like.findFirst({
        where: {postId, userId}
      })
      
      if (isLike) return res.status(400).json({ error: 'you have already liked' })

      const like = await prisma.like.create({
        data: {
          postId, 
          userId
        }
      })

      res.json(like)
    } catch (e) {
      console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
    }
  },
  unlikePost: async (req, res) => {
    const postId = req.params.id
    const userId = req.user.userId
    
    if (!postId) return res.status(400).json({ error: 'All fields are required' })

    try {
      const isLike = await prisma.like.findFirst({
				where: { postId, userId },
			})

			if (!isLike) return res.status(400).json({ error: 'you have already deleted the like' })

			const like = await prisma.like.deleteMany({
				where: {
					postId,
					userId,
				},
			})
			res.json(like)
    } catch (e) {
      console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
    }
  },
}

module.exports = LikeController