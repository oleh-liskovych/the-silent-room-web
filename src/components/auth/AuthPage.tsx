import { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  if (mode === 'signup') {
    return <SignUp onSwitchToSignIn={() => setMode('signin')} />;
  }
  return <SignIn onSwitchToSignUp={() => setMode('signup')} />;
}
