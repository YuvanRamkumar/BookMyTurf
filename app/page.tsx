import Link from "next/link";
import { Trophy, Calendar, MapPin, CheckCircle, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-200 bg-white sticky top-0 z-50">
        <Link className="flex items-center justify-center space-x-2" href="#">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Trophy className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">BookMyTurf</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-indigo-600 transition-colors" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors" href="/register">
            Register
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900">
                  Book Your Game, <span className="text-indigo-600">Anytime, Anywhere</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400">
                  The easiest way to find and book sports turfs. Football, Cricket, Pickleball - your favorite game is just a click away.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-8 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  Start Booking Now
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-8 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50"
                >
                  Partner with Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-indigo-100 rounded-full">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Instant Booking</h3>
                <p className="text-slate-500">Real-time slot availability. No more waiting for phone confirmations.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-emerald-100 rounded-full">
                  <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Prime Locations</h3>
                <p className="text-slate-500">Discover premium turfs in your neighborhood with ease.</p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-violet-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Secure Payments</h3>
                <p className="text-slate-500">Fast and secure checkout process for every booking.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-500">© 2026 BookMyTurf Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
