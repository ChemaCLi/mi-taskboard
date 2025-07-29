import { defineMiddleware } from 'astro:middleware';
import { verifyToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, redirect } = context;
  
  // Define protected routes
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/auth'];
  
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => url.pathname.startsWith(route));
  
  // Get token from cookie
  const cookieHeader = request.headers.get('cookie');
  let token = null;
  
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    token = cookies['auth_token'];
  }
  
  // Verify token and get user
  const user = token ? verifyToken(token) : null;
  const isAuthenticated = !!user;
  
  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    return redirect('/auth');
  }
  
  if (isAuthRoute && isAuthenticated) {
    return redirect('/dashboard');
  }
  
  // For root path, redirect based on auth status
  if (url.pathname === '/') {
    return redirect(isAuthenticated ? '/dashboard' : '/auth');
  }
  
  // Add user to context for use in pages
  if (isAuthenticated) {
    context.locals.user = user;
  }
  
  return next();
}); 