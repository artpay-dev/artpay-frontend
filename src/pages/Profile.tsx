import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Button, Tab, Typography, useTheme } from "@mui/material";
import { useData } from "../hoc/DataProvider.tsx";
import { UserProfile } from "../types/user.ts";
import countries from "../countries.ts";
import ResponsiveTabs from "../components/ResponsiveTabs.tsx";
import TabPanel from "../components/TabPanel.tsx";
import FavouriteArtworks from "../components/FavouriteArtworks.tsx";
import FavouriteArtists from "../components/FavouriteArtists.tsx";

export interface ProfileProps {}

const Profile: React.FC<ProfileProps> = ({}) => {
  const data = useData();
  const theme = useTheme();

  const [selectedTabPanel, setSelectedTabPanel] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();
  const [joinYear, setJoinYear] = useState<number>();

  const country = countries.find((c) => c.code === profile?.shipping?.country)?.name;

  useEffect(() => {
    data.getUserProfile().then((resp) => {
      setProfile(resp);
      try {
        const joinYear = new Date(resp.date_created).getFullYear();
        setJoinYear(joinYear);
      } catch (e) {
        console.warn(e);
      }
      setIsReady(true);
    });
  }, [data]);
  return (
    <DefaultLayout pageLoading={!isReady} authRequired maxWidth={false}>
      <Box
        mt={14}
        display="flex"
        gap={3}
        sx={{ px: { xs: 3, md: 6 }, maxWidth: theme.breakpoints.values.xl, marginLeft: "auto", marginRight: "auto" }}
        alignItems="center">
        <Box
          sx={{ height: "150px", width: "150px", borderRadius: "5px", backgroundColor: "#D9D9D9", overflow: "hidden" }}>
          <img
            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
            src={profile?.avatar_url}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h1" sx={{ mt: { xs: 0, md: -1 } }}>
            {profile?.username}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            membro dal {joinYear}
            {country && `, ${country}`}
          </Typography>
        </Box>
        <Box flexGrow={1}></Box>
        <Box>
          <Button variant="outlined">Impostazioni profilo</Button>
        </Box>
      </Box>
      <Box
        mt={6}
        sx={{
          borderBottom: 1,
          borderColor: "secondary",
          mx: { xs: 0 },
        }}>
        <ResponsiveTabs
          value={selectedTabPanel}
          onChange={(_, newValue) => {
            setSelectedTabPanel(newValue);
          }}>
          <Tab label="Home" />
          <Tab label="In via di acquisizione" />
          <Tab label="Opere preferite" />
          <Tab label="Seguiti" />
          <Tab label="Opere acquistate" />
        </ResponsiveTabs>
      </Box>
      <Box>
        <TabPanel value={selectedTabPanel} index={0}></TabPanel>
        <TabPanel value={selectedTabPanel} index={1}></TabPanel>
        <TabPanel value={selectedTabPanel} index={2}>
          <FavouriteArtworks />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={3}>
          <FavouriteArtists />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={4}></TabPanel>
      </Box>
    </DefaultLayout>
  );
};

export default Profile;
