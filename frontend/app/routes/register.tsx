import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/auth` || 'http://localhost:3000/api/auth';
axios.defaults.withCredentials = true;

export default function RegisterPage() {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [redirect, setRedirect] = useState(false);
	const [error, setError] = useState('');

	async function registerUser(ev: FormEvent<HTMLFormElement>) {
		ev.preventDefault();
		setError('');

		if (password !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		try {
			await axios.post(`${BACKEND_URL}/register`, {
				name,
				email,
				password,
			});
			setRedirect(true);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setError(error.response?.data?.error || 'Registration failed');
			} else {
				setError('An unexpected error occurred');
			}
		}
	}

	if (redirect) {
		return <Navigate to={'/login'} />;
	}

	return (
		<div className="min-h-screen h-screen bg-[rgb(18,11,26)] flex flex-col lg:flex-row relative overflow-hidden">
			<div className="hidden lg:flex w-full lg:w-1/2 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-radial from-blue-300/80 via-blue-400/60 to-blue-600/70" />

				<div className="absolute inset-0 opacity-10">
					<div className="grid grid-cols-6 h-full">
						{[...Array(24)].map((_, i) => (
							<div key={i} className="aspect-square border border-white/20 backdrop-blur-sm" />
						))}
					</div>
				</div>

				<div className="relative w-full flex flex-col items-center justify-center space-y-12 p-8 ml-40">
					<div className="text-left space-y-4">
						<h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-white 
              bg-clip-text text-transparent animate-text-shimmer tracking-wide text-center">
							Join Us Today
						</h2>
						<div className="text-7xl font-extrabold h-[84px] overflow-hidden">
							<div className="animate-text-slide">
								<span className="block bg-clip-text text-transparent bg-gradient-to-r 
                  from-blue-400 via-pink-400 to-blue-400">
									Create Events
								</span>
								<span className="block bg-clip-text text-transparent bg-gradient-to-r 
                  from-blue-400 via-pink-400 to-blue-400">
									View Events
								</span>
								<span className="block bg-clip-text text-transparent bg-gradient-to-r 
                  from-blue-400 via-pink-400 to-blue-400">
									Manage Events
								</span>
								<span className="block bg-clip-text text-transparent bg-gradient-to-r 
                  from-blue-400 via-pink-400 to-blue-400">
									Join Events
								</span>
								<span className="block bg-clip-text text-transparent bg-gradient-to-r 
                  from-blue-400 via-pink-400 to-blue-400">
									Create Events
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="absolute top-0 right-20 w-96 h-96 bg-blue-200/5 rounded-full filter blur-3xl" />
				<div className="absolute bottom-20 right-70 w-60 h-64 bg-pink-200/30 rounded-full filter blur-3xl" />

				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[600px] h-[600px] bg-white/5 rounded-full filter blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          w-[200px] h-[200px] bg-blue-200/20 rounded-full filter blur-3xl animate-pulse" />
			</div>

			<div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-[rgb(18,11,26)] relative min-h-screen">
				<div className="absolute inset-0 opacity-10">
					<div className="grid grid-cols-6 h-full mt-10">
						{[...Array(24)].map((_, i) => (
							<div key={i} className="aspect-square border border-white/20 backdrop-blur-sm" />
						))}
					</div>
				</div>

				<div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 lg:p-8 w-full max-w-md space-y-4 lg:space-y-6 relative z-10 my-auto">
					<form className="flex flex-col space-y-4 lg:space-y-6" onSubmit={registerUser}>
						<h1 className="text-xl lg:text-2xl font-bold text-center">Create Account</h1>

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
									<path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
								</svg>
								<input
									type="text"
									placeholder="Full Name"
									className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
									value={name}
									onChange={(ev) => setName(ev.target.value)}
									required
								/>
							</div>

							<div className="relative flex items-center">
								<svg className="absolute left-3 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
									<path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
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
									<path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
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
											<path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
											<path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
											<path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
										</svg>
									)}
								</button>
							</div>

							<div className="relative flex items-center">
								<svg className="absolute left-3 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
									<path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
								</svg>
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder="Confirm Password"
									className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
									value={confirmPassword}
									onChange={(ev) => setConfirmPassword(ev.target.value)}
								/>
							</div>
						</div>

						<button
							type="submit"
							className="w-full py-2.5 lg:py-3 bg-gradient-to-r from-purple-800 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm lg:text-base"
						>
							Create Account
						</button>

						<p className="text-center text-xs lg:text-sm">
							Already have an account?{' '}
							<Link to="/login" className="text-purple-800 hover:underline">
								Sign In
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
		</div>
	);
}