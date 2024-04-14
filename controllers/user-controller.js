const { prisma } = require('../prisma/prisma-client')
const bcrypt = require('bcryptjs')
const Jdenticon = require('jdenticon')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')



const secret = process.env.SECRET

const UserController = {
	register: async (req, res) => {
		const { email, password, name } = req.body

		if (!email || !password || !name) return res.status(400).json({ error: 'All fields are required' })

		try {
			const isUser = await prisma.user.findUnique({
				where: {
					email,
				},
			})

      if (isUser) return res.status(400).json({error: 'user with such email exists'}) 

      const hashPassword = await bcrypt.hash(password, 10)

      const png = Jdenticon.toPng(`${name}_${Date.now()}`, 200)
      const avatarName = `${name}_${Date.now()}.png`
      const avatarPath = path.join(__dirname, '/../uploads', avatarName)
      fs.writeFileSync(avatarPath, png)

      const user = await prisma.user.create({
        data: {
          email,
          password: hashPassword,
          name,
          avatartUrl: `/uploads/${avatarName}`
        }
      })

      res.json(user)
      
		} catch (e) {
      console.log(e);
      res.status(500).json({error: 'Internal server ERROR'})
    }
	},
	login: async (req, res) => {
    const {email, password} = req.body 

		if (!email || !password) return res.status(400).json({ error: 'All fields are required' })
    try {
      const isUser = await prisma.user.findUnique({ where: { email } })
		  if (!isUser) return res.status(400).json({ error: 'user with such email does not exist' })

      const isValid = await bcrypt.compare(password, isUser.password)
      if (!isValid) return res.status(400).json({ error: 'Invalid password' })
      if (!secret) return res.status(400).json({ error: 'no secret' })

      const token = jwt.sign({ userId: isUser.id }, secret, { expiresIn: '30d' }) 

      res.json({token})
    } catch (e) {
      console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
    }
  },
	current: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {id: req.user.userId},
        include: {
          followers: {
            include: {
              follower: true
            }
          },

          following: {
            include: {
              following: true
            }
          }
        }
      })

      if (!user) return res.status(400).json({ error: 'could not find user' })

      res.json(user)
    } catch (e) {
      console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
    }
  },
	getUserById: async (req, res) => {
    const {id} = req.params
    const userId = req.user.userId

    try {
      const user = await prisma.user.findUnique({
        where: {id},
        include: {
          followers: true,
          following: true
        }
      })

      if (!user) return res.status(404).json({error: 'user with this id does not exist'})

      const isFollowing = await prisma.follows.findFirst({
        where: {
          AND: [
            {followerId: userId},
            {followingId: id}
          ]
        }
      })

      res.json({...user, isFollowing: Boolean(isFollowing)})

    } catch (e) {
      console.log(e);
      res.status(500).json({ error: 'Internal server ERROR' })
    }
  },
	updateUser: async (req, res) => {
    const { id } = req.params
    const {email, name, dataOfBirth, bio, location} = req.body

    let filePath

    if (req.file && req.file.path) {
      filePath = req.file.path
    }

    if (id !== req.user.userId) return res.status(403).json({error: 'No access'})

    try {
      if (email) {
        const isEmail = await prisma.user.findUnique({
          where: {
            email
          }
        })

        if (isEmail && isEmail.id !== id) return res.status(400).json({error: 'user with such email exists'})
      }

      const user = await prisma.user.update({
				where: {
					id,
				},
				data: {
					email: email || undefined,
					name: name || undefined,
					avatartUrl: filePath ? `/${filePath}` : undefined,
					dataOfBirth: dataOfBirth || undefined,
					bio: bio || undefined,
					location: location || undefined,
				},
			})

      res.json(user)
    } catch (e) {
			console.log(e)
			res.status(500).json({ error: 'Internal server ERROR' })
		}
  },
}

module.exports = UserController
