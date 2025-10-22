import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { Box, IconButton, Tab, Tooltip, Typography } from "@mui/material";
import TabPanel from "../components/TabPanel.tsx";
import GalleryInfo, { GalleryInfoProps } from "../components/GalleryInfo.tsx";
import { GalleryContactsProps } from "../components/GalleryContacts.tsx";
import { useData } from "../hoc/DataProvider.tsx";
import { useParams } from "react-router-dom";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import { artistsToGalleryItems, artworksToGalleryItems, galleryToGalleryContent, useNavigate } from "../utils.ts";
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
import GallerySkeleton from "../components/GallerySkeleton.tsx";
import CardGridSkeleton from "../components/CardGridSkeleton.tsx";
import useToolTipStore from "../features/cdspayments/stores/tooltipStore.ts";

export interface GalleryProps {
  selectedTab?: number;
}

const Gallery: React.FC<GalleryProps> = ({ selectedTab = 0 }) => {
  const data = useData();
  const auth = useAuth();
  const urlParams = useParams();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const { showToolTip } = useToolTipStore();

  const [isReady, setIsReady] = useState(false);
  const [selectedTabPanel, setSelectedTabPanel] = useState(selectedTab);
  const [galleryContent, setGalleryContent] = useState<GalleryContent>();
  const [galleryArtworks, setGalleryArtworks] = useState<ArtworkCardProps[]>();
  const [galleryContacts, setGalleryContacts] = useState<GalleryContactsProps>();
  const [galleryArtists, setGalleryArtists] = useState<ArtistCardProps[]>();
  const [favouriteGalleries, setFavouriteGalleries] = useState<number[]>();
  const [isFavourite, setIsFavourite] = useState(false);
  const [hasCheckedFollow, setHasCheckedFollow] = useState(false);
  const [showFollowTooltip, setShowFollowTooltip] = useState(false);

  const [galleryInfo, setGalleryInfo] = useState<GalleryInfoProps>();

  console.log(galleryContacts)

  useEffect(() => {
    if (!urlParams.slug) {
      navigate("/");
      return;
    }
    data
      .getGalleryBySlug(urlParams.slug)
      .then(async (gallery) => {
        //const description = gallery.shop.description.split("\n")[0];

        const user = await auth.user

        if (gallery.id == 220 && user?.id != 125) navigate('/')

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

        // Carica le favouriteGalleries subito per anticipare il follow automatico
        if (auth.isAuthenticated) {
          data.getFavouriteGalleries()
            .then((favourites) => {
              setFavouriteGalleries(favourites);
            })
            .catch((e) => {
              console.error("Error fetching favourite galleries:", e);
            });
        }

        const getGalleryInfo = async () => {
          try {
            const artworks = await data.listArtworksForGallery(gallery.id.toString());
            if (!artworks) throw new Error("Error fetching artworks");
            setGalleryArtworks(
              artworksToGalleryItems(artworks, "large").sort((a, b) => a.title.localeCompare(b.title)),
            );

            const artists = await data.listArtistsForGallery(gallery.id.toString());
            console.log(artists)
            if (!artists) throw new Error("Error fetching artists");
            setGalleryArtists(artistsToGalleryItems(artists));
          } catch (e) {
            console.error(e);
          }
        };

        getGalleryInfo();

        const galleryDescription = (gallery.shop?.description || "").split("\r\n").filter((val) => !!val);
        setGalleryInfo({ description: galleryDescription });
      })
      .catch((err) => {
        console.log("ERR", err);
        if (err === "Gallery not found") {
          navigate("/errore/404");
        }
      })
      .finally(() => {
        setIsReady(true);
      });

    // TODO: loadData
  }, [urlParams.slug]);

  // Controlla se l'utente segue la galleria e gestisce il follow automatico
  useEffect(() => {
    if (!auth.isAuthenticated || !galleryContent?.id || !favouriteGalleries || hasCheckedFollow) {
      return;
    }

    const isFollowing = favouriteGalleries.indexOf(galleryContent.id) !== -1;
    setIsFavourite(isFollowing);

    // Se l'utente non segue la galleria
    if (!isFollowing) {
      // Se non ha nessuna galleria seguita, seguila automaticamente
      if (favouriteGalleries.length === 0) {
        data.addFavouriteGallery(galleryContent.id.toString()).then(() => {
          setIsFavourite(true);
          showToolTip({
            message: "Hai iniziato a seguire questa galleria!",
            visible: true,
            type: "success"
          });
        }).catch((e) => {
          console.error("Error auto-following gallery:", e);
        });
      } else {
        // Altrimenti mostra un tooltip sul bottone Follow
        setShowFollowTooltip(true);
        // Nascondi il tooltip dopo 5 secondi
        setTimeout(() => setShowFollowTooltip(false), 5000);
      }
    }

    setHasCheckedFollow(true);
  }, [favouriteGalleries, galleryContent?.id, auth.isAuthenticated, hasCheckedFollow]);

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

  //const px = getDefaultPaddingX();

  console.log(galleryArtists)

  return (
    <DefaultLayout>
      {!isReady || !galleryContent ? (
        <GallerySkeleton />
      ) : (
        <div className={"flex gap-6 flex-col md:flex-row md:pb-24"}>
          <div className={"relative pb-12 md:sticky md:top-6 md:self-start"}>
            <Box
              sx={{
                width: { xs: "100%", md: "420px", lg: "612px", xl: "612px" },
                height: { xs: "100%", md: "420px" },
                maxWidth: "100%",
                objectFit: "contain",
              }}>
              <img
                src={galleryContent?.coverImage}
                className="object-cover w-full min-h-96 max-h-96 md:min-h-[420px] md:max-h-[420px] md:w-[420px] lg:min-h-[612px] lg:max-h-[612px] lg:w-[612px] rounded-b-2xl md:rounded-2xl "
              />
            </Box>
            <Box
              position="relative"
              sx={{
                position: { xs: "absolute", md: "absolute" },
                maxHeight: { xs: "64px", sm: "100px" },
                maxWidth: { xs: "64px", sm: "100px" },
                top: { xs: undefined, md: "360px", lg: "560px" },
                bottom: { xs: "0", sm: "16px", md: undefined },
                left: { xs: "24px" },
                display: { xs: "block" },
              }}>
              <img
                className="borderRadius md:hidden"
                src={galleryContent?.logoImage}
                style={{ width: "100%", maxHeight: "100px" }}
              />
            </Box>
          </div>
          <div className={"flex flex-col px-8 md:px-0 md:w-full"}>
            <div className={"flex items-center mb-2 md:mb-10"}>
              {auth.isAuthenticated && (
                <Tooltip
                  open={showFollowTooltip && !isFavourite}
                  title="Segui questa galleria per vederla nel tuo feed!"
                  placement="bottom-start"
                  arrow
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: [0, -8],
                          },
                        },
                      ],
                    },
                  }}>
                  <span>
                    <FollowButton isFavourite={isFavourite} onClick={handleSetFavourite} />
                  </span>
                </Tooltip>
              )}
              <Box flexGrow={1} />
              <IconButton onClick={handleShare} color="primary" size="small">
                <ShareIcon />
              </IconButton>
            </div>

            <Typography variant="h1">{galleryContent?.title}</Typography>
            <Typography variant="h4" color="textSecondary" sx={{ mt: 3 }}>
              {galleryContent?.subtitle}
              {galleryContent?.foundationYear ? `, ${galleryContent.foundationYear}` : ""}
            </Typography>
            <div className={"hidden md:block h-auto w-24 mt-6 overflow-hidden rounded"}>
              <img
                src={galleryContent?.logoImage}
                className="object-cover w-full h-full"
                alt={galleryContent?.description}
              />
            </div>
            <Typography variant="subtitle1" sx={{ mt: 6, maxWidth: { md: "400px" } }}>
              {galleryContent?.description ? galleryContent.description : (
                galleryInfo?.description
              )}
            </Typography>
            {galleryContent?.productsCount != 0 && (
              <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 3 }}>
                {galleryContent?.productsCount} opere presenti su Artpay
              </Typography>
            )}
          </div>
        </div>
      )}

      <div className={"mb-24 pt-12 md:pt-18"}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "#CDCFD3",
          }}>
          <ResponsiveTabs
            value={selectedTabPanel}
            onChange={(_, newValue) => {
              setSelectedTabPanel(newValue);
            }}>
            <Tab label="Opere d'arte" />
            {galleryArtists && galleryArtists.length > 0 && (<Tab label="Artisti" />)}
            {galleryContent && <Tab label="Galleria" />}
          </ResponsiveTabs>
        </Box>
          {!galleryArtworks ? (
            <>
              <Typography sx={{ mb: { xs: 3, md: 6 } }} variant="h3" className={'pt-12 md:pt-24'}>
                {"Le nostre opere"}
              </Typography>
              <CardGridSkeleton className={'pb-6 md:pb-12'} />
            </>
            ) : (
        <TabPanel value={selectedTabPanel} index={0}>
            <GalleryArtworksList
              artworks={galleryArtworks}
              onSelect={handleSelectArtwork}
              onLoadMore={
                galleryArtworks?.length &&
                galleryContent?.productsCount &&
                galleryArtworks.length < galleryContent?.productsCount
                  ? handleLoadMoreArtworks
                  : undefined
              }
            />
        </TabPanel>
          )}
            <TabPanel value={selectedTabPanel} index={1}>
          {galleryArtists && galleryArtists?.length > 0 ? (
              <GalleryArtistsList artists={galleryArtists || []} />
          ) : (
            <>
            </>
          )}
            </TabPanel>
        <TabPanel value={selectedTabPanel} index={galleryArtists && galleryArtists.length > 0 ? 2 : 1}>
          {galleryInfo && <GalleryInfo {...galleryInfo} contacts={galleryContacts} />}
        </TabPanel>
      </div>
    </DefaultLayout>
  );
};
export default Gallery;
