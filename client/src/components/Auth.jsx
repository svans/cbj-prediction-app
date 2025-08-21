// client/src/components/Auth.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);

    const inputStyle = "appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-gray/50 bg-slate-gray/20 placeholder-star-silver text-ice-white focus:outline-none focus:ring-2 focus:ring-goal-red focus:border-transparent";

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const db = getFirestore();
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    username: user.displayName || user.email.split('@')[0],
                    totalScore: 0,
                    userId: user.uid,
                });
            }
        } catch (error) {
            setError(error.message.replace('Firebase: ', ''));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        const db = getFirestore();

        try {
            if (!isLoginView) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, {
                    email: user.email,
                    username: username,
                    totalScore: 0,
                    userId: user.uid
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-gray/20 backdrop-blur-md border border-slate-gray/30 rounded-lg p-8 space-y-6">
            <h2 className="text-center text-3xl font-extrabold text-ice-white font-quantico">
                {isLoginView ? 'Welcome Back' : 'Create an Account'}
            </h2>
            
            <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-200">
                <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 261.8S110.3 11.6 244 11.6c70.3 0 129.8 27.8 174.4 72.4l-69.3 67.4c-24.5-23-58.6-37.5-95.1-37.5-71.3 0-129.5 58.2-129.5 129.5s58.2 129.5 129.5 129.5c82.3 0 117-57.4 121.2-87.5H244v-83.3h239.1c4.7 25.4 7.9 53.8 7.9 83.9z"></path></svg>
                Sign in with Google
            </button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-gray/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-gray text-star-silver">Or continue with</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginView && (
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className={inputStyle} placeholder="Username" />
                    </div>
                )}
                <div>
                    <label htmlFor="email-address" className="sr-only">Email address</label>
                    <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} placeholder="Email address" />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} placeholder="Password" />
                </div>

                {error && <p className="text-sm text-goal-red text-center">{error}</p>}

                <div>
                    <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-union-blue hover:bg-blue-800 disabled:bg-gray-400">
                        {isLoginView ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </form>
            <p className="text-center text-sm text-star-silver">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-blue-400 hover:text-blue-300 ml-1">
                    {isLoginView ? 'Sign up' : 'Sign in'}
                </button>
            </p>
        </div>
    );
};

export default Auth;
