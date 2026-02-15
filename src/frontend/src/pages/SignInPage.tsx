import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useEffect } from 'react';

export default function SignInPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, navigate]);

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url(/assets/generated/fngv-background.dim_1920x1080.png)' }}
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <img src="/assets/generated/fngv-logo.dim_512x512.png" alt="FNGV" className="h-20 w-auto mx-auto" />
          <CardTitle className="text-2xl">Welcome to FNGV</CardTitle>
          <CardDescription>Sign in to access your associate dashboard and start growing your network.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={login} disabled={isLoggingIn} className="w-full" size="lg">
            {isLoggingIn ? 'Signing In...' : 'Sign In with Internet Identity'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
