import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useSaveCallerUserProfile, useRegisterWithReferral } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { getUrlParameter } from '../../utils/urlParams';
import type { UserProfile } from '../../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');

  const referrerCode = getUrlParameter('ref') || '';

  const saveProfile = useSaveCallerUserProfile();
  const registerWithReferral = useRegisterWithReferral();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !referralCode.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      joinDate: BigInt(Date.now()) * BigInt(1_000_000),
      status: 'ACTIVE',
      referralCode: referralCode.trim(),
      referredBy: undefined,
    };

    try {
      if (referrerCode) {
        await registerWithReferral.mutateAsync({ profile, referrerCode });
        toast.success('Profile created successfully with referral!');
      } else {
        await saveProfile.mutateAsync(profile);
        toast.success('Profile created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  const isLoading = saveProfile.isPending || registerWithReferral.isPending;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to FNGV!</DialogTitle>
          <DialogDescription>Please complete your profile to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {referrerCode && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm">
              <p className="text-foreground">
                You were referred! Your referrer code: <span className="font-semibold">{referrerCode}</span>
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralCode">Your Referral Code</Label>
            <Input
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Choose a unique code"
              required
            />
            <p className="text-xs text-muted-foreground">This code will be used by others to join under you.</p>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
