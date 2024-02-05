import React, { ReactNode, useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { UserProfile } from "../types/user.ts";
import countries from "../countries.ts";
import Avatar from "./Avatar.tsx";

export interface ProfileHeaderProps {
  profile?: UserProfile;
  controls?: ReactNode | ReactNode[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, controls }) => {
  const theme = useTheme();

  const [joinYear, setJoinYear] = useState<number>();

  useEffect(() => {
    if (profile) {
      try {
        const joinYear = new Date(profile.date_created).getFullYear();
        setJoinYear(joinYear);
      } catch (e) {
        console.warn(e);
      }
    }
  }, [profile]);

  const country = countries.find((c) => c.code === profile?.shipping?.country)?.name;

  return (
    <Box
      mt={14}
      display="flex"
      gap={3}
      sx={{
        px: { xs: 3, md: 6 },
        mt: { xs: 10, md: 14 },
        maxWidth: theme.breakpoints.values.xl,
        marginLeft: "auto",
        marginRight: "auto",
        flexDirection: { xs: "column", md: "row" },
      }}
      alignItems="center">
      <Avatar src={profile?.avatar_url} />
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h1" sx={{ mt: { xs: 0, md: -1 }, typography: { xs: "h3", md: "h1" } }}>
          {profile?.username}
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ textAlign: { xs: "center", md: "left" } }}>
          membro dal {joinYear}
          {country && `, ${country}`}
        </Typography>
      </Box>
      <Box sx={{ display: { xs: "none", md: "block" } }} flexGrow={1}></Box>
      <Box display="flex" flexDirection="column" gap={1}>
        {controls}
      </Box>
    </Box>
  );
};

export default ProfileHeader;
