import { type NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Routes that require billing check (chat uses AI tokens)
const BILLING_PROTECTED_PATTERNS = ['/chat'];

// Routes always accessible even when blocked
const BILLING_WHITELIST = [
  '/signin',
  '/signup',
  '/payment-required',
  '/callback',
];

function isProtectedRoute(pathname: string): boolean {
  return BILLING_PROTECTED_PATTERNS.some((pattern) => pathname.includes(pattern));
}

function isWhitelistedRoute(pathname: string): boolean {
  return BILLING_WHITELIST.some((pattern) => pathname.includes(pattern));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip billing checks for whitelisted routes and root
  if (isWhitelistedRoute(pathname) || pathname === '/') {
    return intlMiddleware(request);
  }

  // Only check billing for protected routes (chat)
  if (isProtectedRoute(pathname)) {
    // Create Supabase client for middleware
    const response = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Check billing blocks using admin-level query via anon key
      // We query billing_blocks directly - RLS allows users to see their own
      const { data: block } = await supabase
        .from('billing_blocks')
        .select('invoice_id')
        .eq('user_id', user.id)
        .is('unblocked_at', null)
        .limit(1)
        .single();

      if (block) {
        // Extract locale from pathname
        const localeMatch = pathname.match(/^\/(es|en)/);
        const locale = localeMatch ? localeMatch[1] : defaultLocale;
        const redirectUrl = new URL(`/${locale}/payment-required?invoice_id=${block.invoice_id}`, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
