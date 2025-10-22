import React, { ReactNode, useEffect, useState } from "react";
import { Box, Typography, useTheme, Skeleton } from "@mui/material";
import { UserProfile } from "../types/user.ts";
import countries from "../countries.ts";
import Avatar from "./Avatar.tsx";

export interface ProfileHeaderProps {
  profile?: UserProfile;
  controls?: ReactNode | ReactNode[];
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
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


  if (!profile) {
    return (
      <Box
        display="flex"
        gap={3}
        sx={{
          maxWidth: theme.breakpoints.values.xl,
          marginLeft: "auto",
          marginRight: "auto",
          flexDirection: { xs: "column", md: "row" }
        }}
        alignItems="center">
        <Skeleton width={100} height={160} />
        <Box display="flex" flexDirection="column" gap={1} sx={{ maxWidth: "100%" }}>
          <Skeleton variant="text" sx={{ typography: { xs: "h4", sm: "h3", md: "h1" }, width: 200 }} />
          <Skeleton variant="text" width={150} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      gap={3}
      sx={{
        maxWidth: theme.breakpoints.values.xl,
        marginLeft: "auto",
        marginRight: "auto",
        flexDirection: { xs: "column", md: "row" }
      }}
      alignItems="center">
      <Avatar firstName={profile?.first_name} lastName={profile?.last_name} username={profile?.username} src={profile?.avatar_url} />
      <Box display="flex" flexDirection="column" gap={1} sx={{ maxWidth: "100%" }}>
        <Typography variant="h1" sx={{
          mt: { xs: 0, md: -1 },
          pb: 0.5,
          typography: { xs: "h4", sm: "h3", md: "h1" },
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%"
        }}>
          {profile?.first_name && profile?.last_name ? `${profile?.first_name}  ${profile?.last_name}` : profile?.username}
        </Typography>
        <span className={'text-secondary block leading-[125%] font-normal'}>
          membro dal {joinYear}
          {country && `, ${country}`}
        </span>
      </Box>
    </Box>
  );
};

export default ProfileHeader;
