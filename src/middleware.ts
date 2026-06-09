import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

// Protege todas las rutas bajo /dashboard, /proyectos, /cat, /importar
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/proyectos/:path*",
    "/cat/:path*",
    "/importar/:path*",
    "/cuotas/:path*"
  ]
}
