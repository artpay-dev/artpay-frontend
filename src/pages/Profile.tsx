import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Tab } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { UserProfile } from "../types/user.ts";
import ResponsiveTabs from "../components/ResponsiveTabs.tsx";
import TabPanel from "../components/TabPanel.tsx";
import FavouriteArtworks from "../components/FavouriteArtworks.tsx";
import FavouriteArtists from "../components/FavouriteArtists.tsx";
import FavouriteGalleries from "../components/FavouriteGalleries.tsx";
import ProfileHeader from "../components/ProfileHeader.tsx";
import { getDefaultPaddingX, useNavigate } from "../utils.ts";
import { useAuth } from "../hoc/AuthProvider.tsx";
import OrdersHistory from "../components/OrdersHistory.tsx";

export interface ProfileProps {
}

const Profile: React.FC<ProfileProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();

  const [selectedTabPanel, setSelectedTabPanel] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();

  const handleProfileSettings = () => {
    navigate("/profile/settings");
  };

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };

  const px = getDefaultPaddingX();

  useEffect(() => {
    data.getUserProfile().then((resp) => {
      setProfile(resp);
      setIsReady(true);
    });
  }, [data]);
  return (
    <DefaultLayout pageLoading={!isReady} authRequired>
      <ProfileHeader
        profile={profile}
        controls={[
          <Button key="settings-btn" onClick={() => handleProfileSettings()} variant="outlined">
            Impostazioni profilo
          </Button>,
          <Button key="logout-btn" color="error" onClick={() => handleLogout()}>
            Logout
          </Button>
        ]}
      />
      <Box px={{ ...px, xs: 0, sm: 0 }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "#CDCFD3",
            mt: { xs: 3, md: 6 }
          }}>
          <ResponsiveTabs
            breakpoint="md"
            value={selectedTabPanel}
            onChange={(_, newValue) => {
              setSelectedTabPanel(newValue);
            }}>
            {/*gallerie-artisti-oepre-bloccate-acquistate*/}
            <Tab label="Gallerie seguite" />
            <Tab label="Artisti seguiti" />
            <Tab label="Opere preferite" />
            <Tab label="Opere bloccate" />
            <Tab label="Opere acquistate" />
            <Tab label="Messaggi" onClick={() => navigate("/messaggi")} />
          </ResponsiveTabs>
        </Box>
      </Box>
      <Box>
        <TabPanel value={selectedTabPanel} index={0}>
          <FavouriteGalleries />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={1}>
          <FavouriteArtists />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={2}>
          <FavouriteArtworks />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={3}>
          <OrdersHistory mode="on-hold" title="Opere bloccate" />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={4}>
          <OrdersHistory mode="completed" subtitle="In questa sezione trovi tutte le tue opere già acquistate" />
        </TabPanel>
      </Box>
    </DefaultLayout>
  );
};

export default Profile;
