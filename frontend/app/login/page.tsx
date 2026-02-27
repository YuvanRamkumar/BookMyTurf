"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Trophy, Loader2, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

function LoginContent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Redirect handling
            if (callbackUrl) {
                router.push(callbackUrl);
            } else if (data.user.role === "SUPER_ADMIN") {
                router.push("/super-admin/dashboard");
            } else if (data.user.role === "ADMIN") {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center relative overflow-hidden font-sans">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/10 blur-[100px] rounded-full" />

            <div className="relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="sm:mx-auto sm:w-full sm:max-w-md text-center"
                >
                    <Link href="/" className="inline-flex items-center space-x-2 mb-8 group">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-xl shadow-blue-900/40">
                            <Trophy className="text-white w-7 h-7" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-white">BookMyTurf</span>
                    </Link>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">Welcome Back</h2>
                    <p className="mt-3 text-slate-400 font-medium">
                        Log in to manage your bookings and stadiums
                    </p>
                </motion.div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-slate-900/50 backdrop-blur-xl py-10 px-6 shadow-2xl rounded-3xl border border-white/5 sm:px-10"
                    >
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20 flex items-center space-x-3"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-widest text-[10px]">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-widest text-[10px]">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="block w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center items-center py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl shadow-lg shadow-blue-900/20 text-sm font-bold text-white transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin w-5 h-5" />
                                    ) : (
                                        <>
                                            <span>Sign In to Dashboard</span>
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                    <span className="px-4 bg-[#0a0f1e] text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    type="button"
                                    onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard" })}
                                    className="w-full flex justify-center items-center py-3.5 px-4 bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-sm text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-[0.98]"
                                >
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3" alt="Google" />
                                    <span>Google Account</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-800">
                            <p className="text-center text-sm text-slate-400">
                                Don't have an account?{" "}
                                <Link href="/register" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                    Create one now
                                </Link>
                            </p>
                        </div>
                    </motion.div>

                    {/* Demo Credentials Helper */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl sm:mx-auto sm:w-full sm:max-w-md"
                    >
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Quick Demo Access</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Super Admin:</span>
                                <span className="text-slate-300 font-mono">superadmin@test.com / admin123</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Admin:</span>
                                <span className="text-slate-300 font-mono">admin@test.com / admin123</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
