import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import connectToDatabase from '@/lib/db/mongodb'
import User from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await connectToDatabase()
          
          // Находим пользователя по email
          const user = await User.findOne({ email: credentials.email }).select('+password')
          
          if (!user || !user.password) {
            return null
          }

          // Проверяем пароль
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase()
          
          // Проверяем, существует ли пользователь
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Создаем нового пользователя для Google OAuth
            const newUser = await User.create({
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'user',
            })
            
            // Обновляем объект user для сессии
            user.id = newUser._id.toString()
            user.role = newUser.role
          } else {
            user.id = existingUser._id.toString()
            user.role = existingUser.role
          }
          
          return true
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      return true
    }
  },
  pages: {
    signIn: '/ru/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
} 