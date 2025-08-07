import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Tab } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { UserProfile } from "../types/user.ts";
import ResponsiveTabs from "../components/ResponsiveTabs.tsx";
import TabPanel from "../components/TabPanel.tsx";
import FavouriteArtworks from "../components/FavouriteArtworks.tsx";
import FavouriteArtists from "../components/FavouriteArtists.tsx";
import FavouriteGalleriesGrid from "../components/FavouriteGalleriesGrid.tsx";
import ProfileHeader from "../components/ProfileHeader.tsx";
import { useNavigate } from "../utils.ts";
import { useAuth } from "../hoc/AuthProvider.tsx";
import OrdersHistory from "../components/OrdersHistory.tsx";
import { useParams } from "react-router-dom";

export interface ProfileProps {
}

const subPageSlugs = ["opere-acquistate", "opere-bloccate", "gallerie", "artisti", "opere-preferite", "messaggi"];
const Profile: React.FC<ProfileProps> = ({}) => {
  const data = useData();
  const auth = useAuth();
  const navigate = useNavigate();
  const urlParams = useParams();

  const selectedTab = subPageSlugs.indexOf(urlParams?.slug || "") !== -1 ? subPageSlugs.indexOf(urlParams?.slug || "") : 0;
  const [selectedTabPanel, setSelectedTabPanel] = useState(selectedTab);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();

  const handleProfileSettings = () => {
    navigate("/profile/settings");
  };

  const handleLogout = async () => {
    await auth.logout();
    navigate("/");
  };


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
      <Box px={{ xs: 0, sm: 0 }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "#CDCFD3",
            mt: { xs: 3, md: 6 }
          }}>
          <ResponsiveTabs
            value={selectedTabPanel}
            onChange={(_, newValue) => {
              window.history.replaceState(null, "", `/profile/${subPageSlugs[newValue]}`);
              setSelectedTabPanel(newValue);
            }}>
            {/*gallerie-artisti-oepre-bloccate-acquistate*/}
            <Tab label="Opere acquistate" />
            <Tab label="Opere bloccate" />
            <Tab label="Gallerie seguite" />
            <Tab label="Artisti seguiti" />
            <Tab label="Opere preferite" />
            <Tab label="Messaggi" onClick={() => navigate("/messaggi")} />
          </ResponsiveTabs>
        </Box>
      </Box>
      <Box>
        <TabPanel value={selectedTabPanel} index={0}>
          <OrdersHistory mode="completed" subtitle="In questa sezione trovi tutte le tue opere già acquistate" />
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
      </Box>
    </DefaultLayout>
  );
};

export default Profile;
