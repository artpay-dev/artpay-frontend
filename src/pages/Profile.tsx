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
import ProfileStepsList from "../components/ProfileStepsList.tsx";

export interface ProfileProps {
}

const Profile: React.FC<ProfileProps> = ({}) => {
  const data = useData();
  const auth = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();
  const [favoriteArtworks, setFavoriteArtworks] = useState<number[]>([]);
  const [favoriteGalleries, setFavoriteGalleries] = useState<number[]>([]);

  if (!auth.isAuthenticated) {
    auth.login()
  }

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const [profileData, artworks, galleries] = await Promise.all([
          data.getUserProfile(),
          data.getFavouriteArtworks().catch(() => []),
          data.getFavouriteGalleries().catch(() => [])
        ]);

        setProfile(profileData);
        setFavoriteArtworks(artworks);
        setFavoriteGalleries(galleries);
        setIsReady(true);
      } catch (error) {
        console.error('Error loading profile data:', error);
        setIsReady(true);
      }
    };

    loadProfileData();
  }, [data]);

  // Calculate completion steps based on profile data
  const calculateCompletionSteps = (profile: UserProfile | undefined): number => {
    if (!profile) return 0;

    let completedSteps = 0;

    // Step 1: Personal data completed (first_name, last_name)
    const isPersonalDataComplete =
      profile.first_name?.trim() !== '' &&
      profile.last_name?.trim() !== '';

    if (isPersonalDataComplete) completedSteps++;

    // Step 2: Addresses completed (billing AND shipping, or billing with same_as_shipping flag)
    const isBillingComplete = profile.billing &&
      profile.billing.first_name?.trim() !== '' &&
      profile.billing.last_name?.trim() !== '' &&
      profile.billing.address_1?.trim() !== '' &&
      profile.billing.city?.trim() !== '' &&
      profile.billing.postcode?.trim() !== '' &&
      profile.billing.country?.trim() !== '' &&
      profile.billing.phone?.trim() !== '';

    const isShippingComplete = profile.shipping &&
      profile.shipping.first_name?.trim() !== '' &&
      profile.shipping.last_name?.trim() !== '' &&
      profile.shipping.address_1?.trim() !== '' &&
      profile.shipping.city?.trim() !== '' &&
      profile.shipping.postcode?.trim() !== '' &&
      profile.shipping.country?.trim() !== '' &&
      profile.shipping.phone?.trim() !== '';

    // Check if addresses are complete (either both filled or billing with same_as_shipping)
    const areAddressesComplete = isBillingComplete && (profile.billing.same_as_shipping || isShippingComplete);

    if (areAddressesComplete) completedSteps++;

    // Step 3: At least one followed gallery
    if (favoriteGalleries.length > 0) completedSteps++;

    // Step 4: At least one favorite artwork
    if (favoriteArtworks.length > 0) completedSteps++;

    return completedSteps;
  };
  return (
    <DefaultLayout authRequired>
      <section className={'pt-35 md:pt-0 space-y-6 px-3 md:px-0'}>
        <ProfileHeader
          profile={profile}
        />

        {/* Step Progress + Steps List - Side by side on desktop, stacked on mobile */}
        <div className="flex flex-col md:flex-row gap-6 bg-[#fafafb] p-6 rounded-lg">
          <StepProgress
            currentStep={calculateCompletionSteps(profile)}
            totalSteps={4}
            title="Completamento del profilo"
          />
          <ProfileStepsList
            profile={profile}
            favoriteArtworks={favoriteArtworks}
            favoriteGalleries={favoriteGalleries}
          />
        </div>
      </section>

      <section className={'mb-24 px-3 md:px-0'}>
        {!isReady && !profile ? (<ProfileSettingsSkeleton />) : (
          <ProfileSettings />
        )}
        <OrdersHistory mode={["completed"]} title={'La tua collezione di opere acquistate'} />
      </section>
    </DefaultLayout>
  );
};

export default Profile;