import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { UserProfile } from "../types/user.ts";
import ProfileHeader from "../components/ProfileHeader.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import ProfileSettings from "../components/ProfileSettings.tsx";
import OrdersHistory from "../components/OrdersHistory.tsx";
import ProfileSettingsSkeleton from "../components/ProfileSettingsSkeleton.tsx";
import StepProgress from "../components/StepProgress.tsx";

export interface ProfileProps {
}

const Profile: React.FC<ProfileProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();

  if (!auth.isAuthenticated) {
    auth.login()
  }

  useEffect(() => {
    data.getUserProfile().then((resp) => {
      setProfile(resp);
      setIsReady(true);
    });
  }, [data]);

  // Calculate completion steps based on profile data
  const calculateCompletionSteps = (profile: UserProfile | undefined): number => {
    if (!profile) return 1;
    
    let completedSteps = 1; // Base step (profile exists)
    
    if (profile.billing) completedSteps++;
    if (profile.shipping) completedSteps++;
    if (profile.avatar_url) completedSteps++;
    
    return completedSteps;
  };
  return (
    <DefaultLayout authRequired>
      <section className={'pt-35 md:pt-0 space-y-6 mb-24 px-3 md:px-0'}>
      <ProfileHeader
        profile={profile}
      />
        <StepProgress 
          currentStep={calculateCompletionSteps(profile)} 
          totalSteps={4}
          title="Completamento del profilo"
        />

      </section>
      <section className={'mb-24 px-3 md:px-0'}>
        {!isReady && !profile ? (<ProfileSettingsSkeleton />) : (
          <ProfileSettings />
        )}
        <OrdersHistory mode={"all"} title={'La tua collezione di opere acquistate'} />
      </section>
    </DefaultLayout>
  );
};

export default Profile;