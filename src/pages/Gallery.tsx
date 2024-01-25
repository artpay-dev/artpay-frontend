import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, Chip, Grid, IconButton, Tab, Typography } from "@mui/material";
import { Share } from "@mui/icons-material";
import TabPanel from "../components/TabPanel.tsx";
import GalleryInfo, { GalleryInfoProps } from "../components/GalleryInfo.tsx";
import { GalleryContactsProps } from "../components/GalleryContacts.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { artistsToGalleryItems, artworksToGalleryItems, galleryToGalleryContent } from "../utils.ts";
import GalleryArtworksList from "../components/GalleryArtworksList.tsx";
import GalleryArtistsList from "../components/GalleryArtistsList.tsx";
import { ArtistCardProps } from "../components/ArtistCard.tsx";
import { GalleryContent } from "../types/gallery.ts";
import ResponsiveTabs from "../components/ResponsiveTabs.tsx";
import { CardItem } from "../types";
import { useDialogs } from "../hoc/DialogProvider.tsx";
import FollowButton from "../components/FollowButton.tsx";

export interface GalleryProps {
  selectedTab?: number;
}

const subPageSlugs = ["", "tutti-gli-artisti", "galleria"];
const Gallery: React.FC<GalleryProps> = ({ selectedTab = 0 }) => {
  const [isReady, setIsReady] = useState(false);
  const [selectedTabPanel, setSelectedTabPanel] = useState(selectedTab);
  const [galleryContent, setGalleryContent] = useState<GalleryContent>();
  const [galleryArtworks, setGalleryArtworks] = useState<ArtworkCardProps[]>();
  const [galleryContacts, setGalleryContacts] = useState<GalleryContactsProps>();
  const [galleryArtists, setGalleryArtists] = useState<ArtistCardProps[]>();
  const [isFavourite, setIsFavourite] = useState(false);

  const [galleryInfo, setGalleryInfo] = useState<GalleryInfoProps>();

  const data = useData();
  const urlParams = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();

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
          social: { linkedin: gallery.social.linkdin, ...gallery.social },
        });
        const [artworks, artists, favouriteGalleries] = await Promise.all([
          data.listArtworksForGallery(gallery.id.toString()),
          data.listArtistsForGallery(gallery.id.toString()),
          data.getFavouriteGalleries(),
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
  }, [data, navigate, urlParams.slug]);

  const handleSetFavourite = async (isFavourite: boolean) => {
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
        console.log(e);
      }
    }
  };

  const handleSelectArtwork = (item: CardItem) => {
    if (galleryArtworks?.length) {
      navigate(`/gallerie/${urlParams.slug}/opere/${item.slug}`);
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

  return (
    <DefaultLayout pageLoading={!isReady || !galleryContent} authRequired>
      <Grid sx={{ p: 0, maxWidth: "1440px" }} container>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            maxHeight: { xs: "315px", sm: "660px", md: "100%" },
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}>
          <img src={galleryContent?.coverImage} style={{ width: "100%" }} />
          <Box
            position="absolute"
            sx={{
              height: { xs: "64px", sm: "100px" },
              width: { xs: "64px", sm: "100px" },
              bottom: { xs: "24px", sm: "48px" },
              left: { xs: "24px", sm: "48px" },
              display: { xs: "block" },
            }}>
            <img className="borderRadius" src={galleryContent?.logoImage} style={{ width: "100%" }} />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          p={3}
          sx={{ pt: { xs: 3, sm: 6, md: 12 } }}
          md
          display="flex"
          justifyContent="center"
          flexDirection="column">
          <Typography sx={{ typography: { sm: "h1", xs: "h3" }, pr: { xs: 0, md: 5 } }}>
            {galleryContent?.title}
          </Typography>
          <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
            {galleryContent?.subtitle}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 2, maxWidth: { md: "560px" } }}>
            {galleryContent?.description}
          </Typography>
          {galleryContent?.productsCount && (
            <Typography variant="h6" color="textSecondary" sx={{ mt: 2, maxWidth: { md: "560px" } }}>
              {galleryContent?.productsCount} opere presenti su Artpay
            </Typography>
          )}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 3, sm: 0 }}
            mt={{ xs: 3, md: 7 }}
            sx={{ maxWidth: { md: "560px" } }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between">
            <Box display="flex" gap={{ xs: 1, md: 2 }}>
              {(galleryContent?.categories || []).map((category, index) => (
                <Chip key={index} label={category} color="secondary" size="small" />
              ))}
            </Box>
            <Box display="flex" gap={2}>
              <FollowButton isFavourite={isFavourite} onClick={handleSetFavourite} />
              <IconButton onClick={handleShare} variant="outlined" color="primary" size="small">
                <Share />
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ mt: { xs: 6, md: 12 } }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "secondary",
            mx: { xs: 0, sm: 3, md: 6 },
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
