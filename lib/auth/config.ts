/**
 * NextAuth v5 Configuration
 * https://authjs.dev/
 */

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import type { DefaultSession } from 'next-auth'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

const authConfig = {
  session: {
    strategy: 'jwt' as const, // Use JWT for serverless compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },

  trustHost: true, // Required for Next.js 16

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This authorize function runs on the server (not Edge Runtime)
        // So we can use Node.js modules here
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        // Import here to avoid Edge Runtime issues
        const { db } = await import('@/lib/db/client')
        const { users } = await import('@/lib/db/schema')
        const { eq } = await import('drizzle-orm')
        const { compare } = await import('bcryptjs')

        // Find user by email
        const userResults = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1)

        const foundUser = userResults[0]

        if (!foundUser) {
          throw new Error('Credenciais inválidas')
        }

        // Verify password
        if (!foundUser.passwordHash) {
          throw new Error('Usuário não possui senha configurada')
        }

        const isValidPassword = await compare(
          credentials.password as string,
          foundUser.passwordHash
        )

        if (!isValidPassword) {
          throw new Error('Credenciais inválidas')
        }

        // Return user object (will be encoded in JWT)
        return {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          image: foundUser.image,
          role: foundUser.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Update session (from client)
      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },

    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },

    async redirect({ url, baseUrl }: any) {
      // If a callback URL is provided, use it
      if (url.startsWith(baseUrl)) {
        return url
      }

      // Otherwise redirect to appropriate dashboard based on role
      // Note: We can't access the session here directly, so the proxy will handle final routing
      return baseUrl
    },
  },

  debug: false,
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig)
