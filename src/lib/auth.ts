import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { turso } from "@/lib/db/turso"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Institucional",
      credentials: {
        email: { label: "Correo Institucional", type: "email", placeholder: "usuario@inia.cl" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          // 1. Buscar usuario en Turso
          const result = await turso.execute({
            sql: "SELECT * FROM user_roles WHERE email = ?",
            args: [credentials.email]
          })

          const userRow = result.rows[0]
          
          if (!userRow) {
            return null // Usuario no encontrado
          }

          // Nota: En producción, compararíamos credentials.password con un hash (ej. bcrypt)
          // Como es un prototipo con datos quemados iniciales, aceptaremos cualquier pass temporalmente
          // o validar una contraseña quemada: if (credentials.password !== "Inia2026") return null

          return {
            id: userRow.email as string,
            email: userRow.email as string,
            name: userRow.nombre as string,
            role: userRow.rol as string,
            centro: userRow.centro as string | null
          }
        } catch (e) {
          console.error("Error en auth:", e)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error NextAuth types don't include custom fields by default
        token.role = user.role
        // @ts-expect-error
        token.centro = user.centro
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // @ts-expect-error NextAuth session types don't include custom fields by default
        session.user.role = token.role
        // @ts-expect-error
        session.user.centro = token.centro
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
