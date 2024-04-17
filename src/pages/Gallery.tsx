import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Grid, IconButton, Tab, Typography, useMediaQuery, useTheme } from "@mui/material";
import TabPanel from "../components/TabPanel.tsx";
import GalleryInfo, { GalleryInfoProps } from "../components/GalleryInfo.tsx";
import { GalleryContactsProps } from "../components/GalleryContacts.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { useParams } from "react-router-dom";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import {
  artistsToGalleryItems,
  artworksToGalleryItems,
  galleryToGalleryContent,
  getDefaultPaddingX, useNavigate
} from "../utils.ts";
import GalleryArtworksList from "../components/GalleryArtworksList.tsx";
import GalleryArtistsList from "../components/GalleryArtistsList.tsx";
import { ArtistCardProps } from "../components/ArtistCard.tsx";
import { GalleryContent } from "../types/gallery.ts";
import ResponsiveTabs from "../components/ResponsiveTabs.tsx";
import { CardItem } from "../types";
import { useDialogs } from "../hoc/DialogProvider.tsx";
import FollowButton from "../components/FollowButton.tsx";
import { useAuth } from "../hoc/AuthProvider.tsx";
import ShareIcon from "../components/icons/ShareIcon.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";

export interface GalleryProps {
  selectedTab?: number;
}

const subPageSlugs = ["", "tutti-gli-artisti", "galleria"];
const Gallery: React.FC<GalleryProps> = ({ selectedTab = 0 }) => {
  const data = useData();
  const auth = useAuth();
  const urlParams = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const snackbars = useSnackbars();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [isReady, setIsReady] = useState(false);
  const [selectedTabPanel, setSelectedTabPanel] = useState(selectedTab);
  const [galleryContent, setGalleryContent] = useState<GalleryContent>();
  const [galleryArtworks, setGalleryArtworks] = useState<ArtworkCardProps[]>();
  const [galleryContacts, setGalleryContacts] = useState<GalleryContactsProps>();
  const [galleryArtists, setGalleryArtists] = useState<ArtistCardProps[]>();
  const [isFavourite, setIsFavourite] = useState(false);

  const [galleryInfo, setGalleryInfo] = useState<GalleryInfoProps>();


  useEffect(() => {
    if (!urlParams.slug) {
      navigate("/");
      return;
    }
    data
      .getGalleryBySlug(urlParams.slug)
      .then(async (gallery) => {
        //const description = gallery.shop.description.split("\n")[0];
        setGalleryContent(galleryToGalleryContent(gallery));

        const galleryAddress = [gallery.address.address_1, gallery.address.address_2].join(" ");

        setGalleryContacts({
          address: galleryAddress,
          country: gallery.address.country,
          city: gallery.address.city,
          postcode: gallery.address.postcode,
          email: gallery.email,
          phoneNumbers: [gallery.address.phone],
          website: gallery.shop.url,
          social: { linkedin: gallery.social.linkdin, ...gallery.social }
        });

        const [artworks, artists, favouriteGalleries] = await Promise.all([
          data.listArtworksForGallery(gallery.id.toString()),
          data.listArtistsForGallery(gallery.id.toString()).catch((err) => {
            console.error(err);
            return [];
          }),
          data.getFavouriteGalleries().catch((err) => {
            if (auth.isAuthenticated) {
              snackbars.error(err);
            }
            return [] as number[];
          })
        ]);
        setGalleryArtworks(artworksToGalleryItems(artworks, "large"));
        setGalleryArtists(artistsToGalleryItems(artists));
        if (favouriteGalleries.indexOf(gallery.id) !== -1) {
          setIsFavourite(true);
        }
        const galleryDescription = (gallery.shop?.description || "").split("\r\n").filter((val) => !!val);
        setGalleryInfo({ description: galleryDescription });
      })
      .finally(() => {
        setIsReady(true);
      });
    //data.getGallery()
    // TODO: loadData
  }, [urlParams.slug]);

  const handleSetFavourite = async (isFavourite: boolean) => {
    if (!auth.isAuthenticated) {
      auth.login();
      return;
    }
    if (galleryContent?.id) {
      try {
        if (isFavourite) {
          await data.removeFavouriteGallery(galleryContent.id.toString()).then(() => {
            setIsFavourite(false);
          });
        } else {
          await data.addFavouriteGallery(galleryContent.id.toString()).then(() => {
            setIsFavourite(true);
          });
        }
      } catch (e) {
        //TODO: notify error
        console.error(e);
      }
    }
  };

  const handleSelectArtwork = (item: CardItem) => {
    if (galleryArtworks?.length) {
      navigate(`/opere/${item.slug}`);
    }
  };
  const handleLoadMoreArtworks = async () => {
    navigate(`/gallerie/${urlParams.slug}/tutte-le-opere`);
  };

  const handleShare = async () => {
    await dialogs.share(window.location.href);
  };


  /*const galleryContacts: GalleryContactsProps = {
        address: "via della Rocca 39/A 10100, Torino",
        email: "info@galleria.it",
        phoneNumbers: ["+39 011 11 22 333", "+39 393 11 22 333"],
        website: "galleria.it",
      };*/

  const px = getDefaultPaddingX();

  return (
    <DefaultLayout pageLoading={!isReady || !galleryContent}>
      <Grid sx={{ px: { ...px, xs: 0, sm: 0 }, mt: { xs: 0, md: 16 } }} container>
        <Grid
          item
          xs={12}
          md="auto"
          sx={{ position: "relative" }}>
          <Box sx={{
            width: { xs: "100%", md: "420px", lg: "612px", xl: "612px" },
            height: { xs: "100%", md: "420px", lg: "612px", xl: "612px" },
            maxWidth: "100%",
            objectFit: "contain"
          }}>
            <img src={galleryContent?.coverImage}
                 style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: isMobile ? "0" : "4px" }} />
          </Box>
          <Box
            position="absolute"
            sx={{
              maxHeight: { xs: "64px", sm: "100px" },
              maxWidth: { xs: "64px", sm: "100px" },
              bottom: { xs: "24px" },
              left: { xs: "24px" },
              display: { xs: "block" }
            }}>
            <img className="borderRadius" src={galleryContent?.logoImage}
                 style={{ width: "100%", maxHeight: "100px" }} />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          sx={{ pt: { xs: 3, md: 0 }, pl: { xs: px.xs, sm: px.sm, md: 3 }, pr: { xs: px.xs, sm: px.sm, md: 0 } }}
          md
          display="flex"
          justifyContent="flex-start"
          flexDirection="column">
          <Box display="flex" alignItems="center" mb={{ xs: 1, md: 5 }}>
            <FollowButton isFavourite={isFavourite} onClick={handleSetFavourite} />
            <Box flexGrow={1} />
            <IconButton onClick={handleShare} color="primary" size="small">
              <ShareIcon />
            </IconButton>
          </Box>
          <Typography variant="h1">
            {galleryContent?.title}
          </Typography>
          <Typography variant="h4" color="textSecondary" sx={{ mt: 3 }}>
            {galleryContent?.subtitle}
            {galleryContent?.foundationYear ? `, ${galleryContent.foundationYear}` : ""}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 6, maxWidth: { md: "400px" } }}>
            {galleryContent?.description}
          </Typography>
          {galleryContent?.productsCount && (
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 3 }}>
              {galleryContent?.productsCount} opere presenti su Artpay
            </Typography>
          )}
        </Grid>
      </Grid>
      <Box sx={{ mt: { xs: 6, md: 12 }, mb: 12, px: px }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "#CDCFD3"
          }}>
          <ResponsiveTabs
            value={selectedTabPanel}
            onChange={(_, newValue) => {
              window.history.replaceState(null, "", `/gallerie/${urlParams.slug}/${subPageSlugs[newValue]}`);
              setSelectedTabPanel(newValue);
            }}>
            <Tab label="Opere d'arte" />
            <Tab label="Artisti" />
            <Tab label="Galleria" />
          </ResponsiveTabs>
        </Box>
        <TabPanel value={selectedTabPanel} index={0}>
          <GalleryArtworksList
            artworks={galleryArtworks}
            onSelect={handleSelectArtwork}
            onLoadMore={handleLoadMoreArtworks}
          />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={1}>
          <GalleryArtistsList artists={galleryArtists || []} />
        </TabPanel>
        <TabPanel value={selectedTabPanel} index={2}>
          {galleryInfo && <GalleryInfo {...galleryInfo} contacts={galleryContacts} />}
        </TabPanel>
      </Box>
    </DefaultLayout>
  );
};
export default Gallery;
