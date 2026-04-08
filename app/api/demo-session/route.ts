import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Demo is not configured." },
      { status: 503 }
    );
  }

  const home = new URL("/home", request.url);

  let response = NextResponse.redirect(home);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          response = NextResponse.redirect(home);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { message: "Could not start demo session." },
      { status: 500 }
    );
  }

  const demoRaw = process.env.DEMO_APP_NOW_ISO?.trim();
  if (demoRaw) {
    const d = new Date(demoRaw);
    if (!Number.isNaN(d.getTime())) {
      response.cookies.set("demo_app_now", d.toISOString(), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  } else {
    response.cookies.set("demo_app_now", "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
  }

  return response;
}
