const { prisma } = require('../prisma/prisma-client')

const FollowController = {
	followUser: async (req, res) => {
		const followingId = req.params.id
		const userId = req.user.userId

		console.log(followingId, userId)

		if (followingId === userId)
			return res.status(400).json({ error: 'you cannot subscribe' })

		try {
			const isSubscription = await prisma.follows.findFirst({
				where: {
					AND: [{ followerId: userId }, { followingId }],
				},
			})

			if (isSubscription)
				return res.status(400).json({ error: 'you cannot subscribe' })

			await prisma.follows.create({
				data: {
					follower: { connect: { id: userId } },
					following: { connect: { id: followingId } },
				},
			})

			res.status(201).json({ message: 'subscribe' })
		} catch (e) {
			console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
		}
	},
	unfollowUser: async (req, res) => {
		const followingId = req.params.id
		const userId = req.user.userId

		console.log(followingId, userId)

		if (followingId === userId)
			return res.status(400).json({ error: 'you cannot subscribe' })

		try {
			const follows = await prisma.follows.findFirst({
				where: {
					AND: [{ followerId: userId }, { followingId }],
				},
			})

			if (!follows)
				return res.status(400).json({ error: 'you cannot unsubscribe' })

			await prisma.follows.delete({
				where: {id: follows.id}
			})

			res.status(201).json({ message: 'unsubscribe' })
		} catch (e) {
			console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
		}
	},
}

module.exports = FollowController
