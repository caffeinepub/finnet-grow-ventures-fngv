import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useSaveCallerUserProfile, useRegisterWithUplineId } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { getUrlParameter } from '../../utils/urlParams';
import type { UserProfile } from '../../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [associateId, setAssociateId] = useState('');
  const [uplineAssociateId, setUplineAssociateId] = useState('');

  const referrerCode = getUrlParameter('ref') || '';
  const isReferralContext = !!referrerCode;

  const saveProfile = useSaveCallerUserProfile();
  const registerWithUplineId = useRegisterWithUplineId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim() || !email.trim() || !phone.trim() || !associateId.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate upline associate ID only in referral context
    if (isReferralContext && !uplineAssociateId.trim()) {
      toast.error('Upline Associate ID Number is required when joining via referral');
      return;
    }

    // Generate a unique referral code for the new user
    const generatedReferralCode = `REF${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      joinDate: BigInt(Date.now()) * BigInt(1_000_000),
      status: 'ACTIVE',
      referralCode: generatedReferralCode,
      referredBy: undefined,
      referredByAssociateId: undefined,
      associateId: associateId.trim(),
    };

    try {
      if (isReferralContext) {
        // Register with upline associate ID
        await registerWithUplineId.mutateAsync({ 
          profile, 
          uplineAssociateId: uplineAssociateId.trim() 
        });
        toast.success('Profile created successfully with referral!');
      } else {
        // Register without referral
        await saveProfile.mutateAsync(profile);
        toast.success('Profile created successfully!');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create profile';
      if (errorMessage.includes('Invalid upline associate ID')) {
        toast.error('The Upline Associate ID Number you entered does not exist. Please check and try again.');
      } else if (errorMessage.includes('Associate ID already in use')) {
        toast.error('This Associate ID is already in use. Please choose a different one.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const isLoading = saveProfile.isPending || registerWithUplineId.isPending;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to FNGV!</DialogTitle>
          <DialogDescription>Please complete your profile to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isReferralContext && (
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
            <Label htmlFor="associateId">Associate ID Number</Label>
            <Input
              id="associateId"
              value={associateId}
              onChange={(e) => setAssociateId(e.target.value)}
              placeholder="Enter your Associate ID"
              required
            />
            <p className="text-xs text-muted-foreground">Your unique Associate ID number.</p>
          </div>
          {isReferralContext && (
            <div className="space-y-2">
              <Label htmlFor="uplineAssociateId">Upline Associate ID Number</Label>
              <Input
                id="uplineAssociateId"
                value={uplineAssociateId}
                onChange={(e) => setUplineAssociateId(e.target.value)}
                placeholder="Enter your upline's Associate ID"
                required
              />
              <p className="text-xs text-muted-foreground">The Associate ID of the person who referred you.</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
