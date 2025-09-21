import { createRoleMiddleware } from './lib/middleware';

export default createRoleMiddleware();

export const config = {
  matcher: [
    '/admin/:path*',
    '/moderator/:path*',
  ],
};


