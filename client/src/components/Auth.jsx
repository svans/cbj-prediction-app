// client/src/components/Auth.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
// Import Firestore methods
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const inputStyle = "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-goal-red focus:border-transparent";

    const handleSubmit = async (e, type) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        const db = getFirestore();

        try {
            if (type === 'signup') {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Create a user document in Firestore after sign-up
                const userDocRef = doc(db, "users", user.uid);
                await setDoc(userDocRef, {
                    email: user.email,
                    totalScore: 0, // Initialize score to 0
                    userId: user.uid
                });

            } else { // This is the 'signin' logic
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // --- NEW: Check for and create user doc for existing users on sign-in ---
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);

                if (!docSnap.exists()) {
                    // If the user document doesn't exist, create it.
                    console.log("User document not found, creating one for existing user.");
                    await setDoc(userDocRef, {
                        email: user.email,
                        totalScore: 0,
                        userId: user.uid
                    });
                }
                // --- End of new code ---
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
                Sign in or create an account
            </h2>
            <form className="space-y-6">
                <input type="hidden" name="remember" defaultValue="true" />
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputStyle} rounded-t-md`} placeholder="Email address" />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputStyle} rounded-b-md`} placeholder="Password" />
                    </div>
                </div>

                {error && <p className="text-sm text-goal-red text-center">{error}</p>}

                <div className="flex gap-4">
                    <button onClick={(e) => handleSubmit(e, 'signin')} disabled={isSubmitting} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-union-blue hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                        Sign In
                    </button>
                    <button onClick={(e) => handleSubmit(e, 'signup')} disabled={isSubmitting} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-goal-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400">
                        Sign Up
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Auth;
