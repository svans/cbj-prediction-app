// client/src/components/Auth.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // <-- New state for username
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true); // State to toggle between login/signup

    const inputStyle = "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-goal-red focus:border-transparent";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        const db = getFirestore();

        try {
            if (!isLoginView) { // Sign-up logic
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, {
                    email: user.email,
                    username: username, // <-- Save the new username
                    totalScore: 0,
                    userId: user.uid
                });

            } else { // Sign-in logic
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);

                if (!docSnap.exists()) {
                    console.log("User document not found, creating one for existing user.");
                    await setDoc(userDocRef, {
                        email: user.email,
                        username: user.email.split('@')[0], // Fallback username
                        totalScore: 0,
                        userId: user.uid
                    });
                }
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-8 space-y-6">
            <h2 className="text-center text-3xl font-extrabold text-union-blue">
                {isLoginView ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {!isLoginView && (
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <input id="username" name="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className={`${inputStyle} rounded-t-md`} placeholder="Username" />
                    </div>
                )}
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${isLoginView ? 'rounded-t-md' : ''} ${inputStyle}`} placeholder="Email address" />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputStyle} rounded-b-md`} placeholder="Password" />
                    </div>
                </div>

                {error && <p className="text-sm text-goal-red text-center">{error}</p>}

                <div>
                    <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-union-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                        {isLoginView ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </form>
            <p className="text-center text-sm text-gray-600">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-blue-600 hover:text-blue-500 ml-1">
                    {isLoginView ? 'Sign up' : 'Sign in'}
                </button>
            </p>
        </div>
    );
};

export default Auth;
