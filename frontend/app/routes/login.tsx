import { useContext, useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/auth` || 'http://localhost:3000/api/auth';
axios.defaults.baseURL = BACKEND_URL;
axios.defaults.withCredentials = true;

export default function LoginPage() {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [redirect, setRedirect] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [rememberMe, setRememberMe] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const { setUser } = useContext(UserContext);

	useEffect(() => {
		const checkRememberedUser = async () => {
			try {
				const { data } = await axios.get(`${BACKEND_URL}/check-remember-me`);

				if (data && data.email) {
					setEmail(data.email);
					setRememberMe(true);
				}
			} catch (error) {
				console.error('Remember me check failed:', error);
			}
		};

		checkRememberedUser();
	}, []);

	async function loginUser(ev: FormEvent<HTMLFormElement>) {
		ev.preventDefault();
		setError('');

		try {
			const { data } = await axios.post(`${BACKEND_URL}/login`, {
				email,
				password
			});

			setUser(data.user);

			if (rememberMe) {
				await axios.post(`${BACKEND_URL}/remember-me`, { email });
			} else {
				await axios.post(`${BACKEND_URL}/clear-remember-me`);
			}

			setRedirect(true);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setError(error.response?.data?.error || 'Login failed');
			} else {
				setError('An unexpected error occurred');
			}
		}
	}

	if (redirect) {
		return <Navigate to={'/feed'} />;
	}

	return (
		<div className="min-h-screen h-screen bg-[rgb(18,11,26)] flex flex-col lg:flex-row relative overflow-hidden">
			<div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-4 lg:p-8 bg-[rgb(18,11,26)] relative order-2 lg:order-1">
				<div className="absolute inset-0 opacity-10">
					<div className="grid grid-cols-6 h-full">
						{[...Array(24)].map((_, i) => (
							<div key={i} className="aspect-square border border-white/20 backdrop-blur-sm" />
						))}
					</div>
				</div>

				<div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 lg:p-8 w-full max-w-md space-y-4 lg:space-y-6 relative z-10 my-auto">
					<form className="flex flex-col space-y-4 lg:space-y-6" onSubmit={loginUser}>
						<h1 className="text-xl lg:text-2xl font-bold text-center">Sign In</h1>

						{error && (
							<div className="bg-red-50 border-l-4 border-red-500 p-3 lg:p-4 rounded text-sm">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<svg className="h-4 w-4 lg:h-5 lg:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
										</svg>
									</div>
									<p className="ml-2 text-red-700">{error}</p>
								</div>
							</div>
						)}

						<div className="space-y-4">
							<div className="relative flex items-center">
								<svg className="absolute left-3 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path fillRule="evenodd" d="M17.834 6.166a8.25 8.25 0 100 11.668.75.75 0 011.06 1.06c-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788 3.807-3.808 9.98-3.808 13.788 0A9.722 9.722 0 0121.75 12c0 .975-.296 1.887-.809 2.571-.514.685-1.28 1.179-2.191 1.179-.904 0-1.666-.487-2.18-1.164a5.25 5.25 0 11-.82-6.26V8.25a.75.75 0 011.5 0V12c0 .682.208 1.27.509 1.671.3.401.659.579.991.579.332 0 .69-.178.991-.579.3-.4.509-.99.509-1.671a8.222 8.222 0 00-2.416-5.834zM15.75 12a3.75 3.75 0 10-7.5 0 3.75 3.75 0 007.5 0z" clipRule="evenodd" />
								</svg>
								<input
									type="email"
									placeholder="Email"
									className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
									value={email}
									onChange={(ev) => setEmail(ev.target.value)}
									required
								/>
							</div>

							<div className="relative flex items-center">
								<svg className="absolute left-3 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path fillRule="evenodd" d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z" clipRule="evenodd" />
								</svg>
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder="Password"
									className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
									value={password}
									onChange={(ev) => setPassword(ev.target.value)}
									required
								/>
								<button
									type="button"
									className="absolute right-3"
									onClick={() => setShowPassword((prev) => !prev)}
								>
									{showPassword ? (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
											<path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
											<path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
											<path d="M3.53 2.47a.75.75 0 00-1.06 1.06l-18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
											<path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
											<path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
										</svg>
									)}
								</button>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs lg:text-sm">
							<label className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={rememberMe}
									onChange={() => setRememberMe((prev) => !prev)}
									className="rounded text-purple-800 w-4 h-4"
								/>
								<span>Remember Me</span>
							</label>
							<Link to="/forgotpassword" className="text-purple-800 hover:underline">
								Forgot Password?
							</Link>
						</div>

						<button
							type="submit"
							className="w-full py-2.5 lg:py-3 bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm lg:text-base"
						>
							Sign In
						</button>

						<p className="text-center text-xs lg:text-sm">
							Don't have an account?{' '}
							<Link to="/register" className="text-purple-800 hover:underline">
								Sign Up
							</Link>
						</p>

						<Link to="/" className="flex items-center justify-center text-xs lg:text-sm text-gray-600 hover:text-gray-800">
							<svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
								<path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
							</svg>
							Back to Home
						</Link>
					</form>
				</div>

				<div className="absolute bottom-30 left-100 w-120 h-120 bg-blue-200/25 rounded-full filter blur-3xl" />
				<div className="absolute top-40 left-80 w-60 h-64 bg-blue-200/15 rounded-full filter blur-3xl" />
			</div>

			<div className="hidden lg:flex w-full lg:w-1/2 relative overflow-hidden order-1 lg:order-2">
				<div className="absolute inset-0 bg-gradient-radial from-blue-300/80 via-blue-400/60 to-blue-600/70" />

				<div className="absolute inset-0 opacity-10">
					<div className="grid grid-cols-6 h-full">
						{[...Array(24)].map((_, i) => (
							<div key={i} className="aspect-square border border-white/20 backdrop-blur-sm" />
						))}
					</div>
				</div>

				<div className="relative w-full flex flex-col items-center justify-center space-y-12 p-8 mr-40">
					<div className="text-left space-y-4">
						<h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-white 
              bg-clip-text text-transparent animate-text-shimmer tracking-wide">
							Welcome to
						</h2>
						<div className="text-7xl font-extrabold">
							<span className="bg-clip-text text-transparent bg-gradient-to-r 
                from-blue-400 via-pink-400 to-blue-400 animate-text-shimmer">
								Event Manager
							</span>
						</div>
					</div>

					<div className="w-full max-w-xl px-8">
						<img
							src="/event-logo.png"
							alt="Team Collaboration Illustration"
							className="w-full h-auto rounded-xl scale-110 transform hover:scale-105 transition-transform duration-300"
						/>
					</div>
				</div>

				<div className="absolute top-0 right-20 w-96 h-96 bg-blue-200/5 rounded-full filter blur-3xl" />
				<div className="absolute bottom-20 right-70 w-60 h-64 bg-pink-200/30 rounded-full filter blur-3xl" />

				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[600px] h-[600px] bg-white/5 rounded-full filter blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[200px] h-[200px] bg-blue-200/20 rounded-full filter blur-3xl animate-pulse" />
			</div>
		</div>
	);
}