import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { UserProfile } from "../types/user.ts";
import ProfileHeader from "../components/ProfileHeader.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import ProfileSettings from "../components/ProfileSettings.tsx";
import OrdersHistory from "../components/OrdersHistory.tsx";
import ProfileSettingsSkeleton from "../components/ProfileSettingsSkeleton.tsx";

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

  console.log(profile)


  useEffect(() => {
    data.getUserProfile().then((resp) => {
      setProfile(resp);
      setIsReady(true);
    });
  }, [data]);
  return (
    <DefaultLayout authRequired>
      <section className={'pt-35 md:pt-0 space-y-6 mb-24'}>
      <ProfileHeader
        profile={profile}
      />
        <div className={'bg-[#fafafb] p-6 rounded-lg flex space-x-6 '}>
          <div className={'relative w-18 h-18 rotate-45'}>
            <div className={'h-18 w-18 aspect-square border-7 rounded-full border-[#C2C9FF] absolute top-0 left-0'}></div>
            <div className={'h-18 w-18 aspect-square border-7 rounded-full border-transparent border-t-primary absolute top-0 left-0'}></div>
          </div>
          <div className={'space-y-2'}>
            <h4 className={'text-secondary'}>Completamento del profilo</h4>
            <span>Step 1/4</span>
          </div>
        </div>

      </section>
      <section className={'mb-24'}>
        {!isReady && !profile ? (<ProfileSettingsSkeleton />) : (
          <ProfileSettings />
        )}
        <OrdersHistory mode={"all"} title={'La tua collezione di opere acquistate'} />
      </section>
    </DefaultLayout>
  );
};

export default Profile;

{/* <Box>
        <TabPanel value={selectedTabPanel} index={0}>
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={1}>
          <OrdersHistory mode="on-hold" title="Opere bloccate" />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={2}>
          <FavouriteGalleriesGrid />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={3}>
          <FavouriteArtists />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={4}>
          <FavouriteArtworks />
        </TabPanel>
      </Box>*/}
