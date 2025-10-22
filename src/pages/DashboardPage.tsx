import { useEffect, useState } from "react";
import { useData } from "../hoc/DataProvider.tsx";
import { artworksToGalleryItems } from "../utils.ts";
import { ArtworkCardProps } from "../components/ArtworkCard.tsx";
import ArtworksList from "../components/ArtworksList.tsx";
import DefaultLayout from "../components/DefaultLayout.tsx";
import { PostList } from "../components/PostList.tsx";
import NewsletterBig from "../components/NewsletterBig.tsx";
import FavouriteGalleriesList from "../components/FavouriteGalleriesList.tsx";
import { useSnackbars } from "../hoc/SnackbarProvider.tsx";
import { NavLink } from "react-router-dom";
import { Gallery } from "../types/gallery.ts";
import StepProgress from "../components/StepProgress.tsx";
import ProfileStepsList from "../components/ProfileStepsList.tsx";
import { UserProfile } from "../types/user.ts";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
//import ArtMatch from "../components/ArtMatch.tsx";

const Skeleton = () => {
  return (
    <div className={`pl-4 lg:pl-0 h-full min-w-80 `}>
      <div className="w-full rounded-2xl overflow-hidden">
        <div className="bg-gray-300 animate-pulse h-full w-full aspect-square" />
      </div>

      <div className="mt-4 py-4 flex flex-col justify-between">
        <div className="flex">
          <div className="flex flex-col flex-1 h-full min-h-40 space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-1/3 animate-pulse" />
            <div className="h-6 bg-gray-300 rounded w-1/4 mt-4 animate-pulse" />
          </div>
          <div className="flex flex-col items-end justify-between max-w-[50px] ml-4">
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const STEP_PROGRESS_HIDDEN_KEY = 'artpay_step_progress_hidden';

const DashboardPage = () => {
  const [artworks, setArtworks] = useState<ArtworkCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFavouriteGallery, setLastFavouriteGallery] = useState<Gallery | null>(null);
  const [profile, setProfile] = useState<UserProfile | undefined>();
  const [favoriteArtworksIds, setFavoriteArtworksIds] = useState<number[]>([]);
  const [favoriteGalleriesIds, setFavoriteGalleriesIds] = useState<number[]>([]);
  const [isStepProgressVisible, setIsStepProgressVisible] = useState<boolean>(() => {
    // Initialize from localStorage
    const hidden = localStorage.getItem(STEP_PROGRESS_HIDDEN_KEY);
    return hidden !== 'true';
  });
  const data = useData();
  const snackbar = useSnackbars();

  const handleCloseStepProgress = () => {
    setIsStepProgressVisible(false);
    localStorage.setItem(STEP_PROGRESS_HIDDEN_KEY, 'true');
  };

  const loadData = async () => {
    try {
      // Load profile and favorites data
      const [profileData, artworkIds, galleryIds] = await Promise.all([
        data.getUserProfile().catch(() => undefined),
        data.getFavouriteArtworks().catch(() => []),
        data.getFavouriteGalleries().catch(() => [])
      ]);

      setProfile(profileData);
      setFavoriteArtworksIds(artworkIds);
      setFavoriteGalleriesIds(galleryIds);

      // Load favorite artworks
      if (!artworkIds || artworkIds.length === 0) {
        if (galleryIds && galleryIds.length > 0) {
          const lastGalleryId = galleryIds[galleryIds.length - 1];
          const gallery = await data.getGallery(String(lastGalleryId));
          setLastFavouriteGallery(gallery);
        }
        return;
      }

      const favArtworks = await data.getArtworks(artworkIds);
      if (!favArtworks) throw new Error("Failed to fetch artworks");
      const filteredArtworks = artworksToGalleryItems(favArtworks.filter((artwork) => artwork.status != "trash"));
      setArtworks(filteredArtworks);

      if (filteredArtworks.length === 0 && galleryIds && galleryIds.length > 0) {
        const lastGalleryId = galleryIds[galleryIds.length - 1];
        const gallery = await data.getGallery(String(lastGalleryId));
        setLastFavouriteGallery(gallery);
      }
    } catch (error) {
      snackbar.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
    if (favoriteGalleriesIds.length > 0) completedSteps++;

    // Step 4: At least one favorite artwork
    if (favoriteArtworksIds.length > 0) completedSteps++;

    return completedSteps;
  };

  return (
    <DefaultLayout hasNavBar>
      <section className="ps-8 pe-8 md:px-0 pt-36 md:pt-0">
        <h2 className={"text-5xl leading-[105%] font-light max-w-lg text-balance pb-16 text-primary"}>
          Inizia la tua collezione d’arte - a rate
        </h2>
      </section>
      <section className={"space-y-24 mb-22"}>
        {isStepProgressVisible && (
          <div className="relative flex flex-col md:flex-row gap-6 bg-[#fafafb] pt-10 p-6 rounded-lg">
             <IconButton
               onClick={handleCloseStepProgress}
               className={'!absolute right-2 top-2'}
               size="medium"
               aria-label="close"
             >
               <Close fontSize="small" />
             </IconButton>
            <StepProgress
              currentStep={calculateCompletionSteps(profile)}
              totalSteps={4}
              title="Completamento del profilo"
            />
            <ProfileStepsList
              profile={profile}
              favoriteArtworks={favoriteArtworksIds}
              favoriteGalleries={favoriteGalleriesIds}
            />
          </div>
        )}
        {/*<ArtMatch />*/}
        <div>
          {loading ? (
            <>
              <div className={"flex justify-between pe-8 md:pe-0"}>
                <div className="ps-8 md:px-0 animate-pulse">
                  <div className="h-9 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse hidden md:block">
                  <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <div className={"flex gap-8 my-12 overflow-x-hidden ps-4"}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={"flex justify-between pe-8 md:pe-0"}>
                <h3 className={"ps-8 md:px-0 text-3xl leading-[105%] font-normal max-w-lg text-balance"}>
                  Lista dei desideri
                </h3>
                {artworks.length !== 0 &&
                  (<NavLink
                    to={"/profile/opere-preferite"}
                    className={
                      "cursor-pointer border border-primary py-2 px-4 text-primary rounded-full hover:bg-primary hover:text-white transition-all hidden md:block"
                    }>
                    Vedi tutte
                  </NavLink>)
                }
              </div>
              <div className={`${artworks.length === 0 ? "h-fit" : "min-h-80 my-12 "}`}>
                {artworks.length === 0 ? (
                  <div className="p-8 md:ps-0 flex flex-col md:items-center justify-center py-16 md:text-center">
                    <p className="text-secondary text-xl mb-6">
                      Non hai ancora aggiunto opere alla tua lista dei desideri.
                    </p>
                    {lastFavouriteGallery && (
                      <p className="text-lg">
                        Scopri le opere di{" "}
                        <NavLink
                          to={`/gallerie/${lastFavouriteGallery.shop?.slug}`}
                          className="text-primary font-medium underline hover:no-underline">
                          {lastFavouriteGallery.display_name}
                        </NavLink>
                      </p>
                    )}
                  </div>
                ) : (
                  <ArtworksList items={artworks} disablePadding cardSize="medium" />
                )}
              </div>
            </>
          )}
        </div>
        <div className={"my-12 pl-8 md:pl-0"}>
          <FavouriteGalleriesList />
        </div>
        <div className={"tutorials-wrapper pl-8 md:pl-0"}>
          <div className={"flex justify-between pe-8 md:pe-0 items-center"}>
            <div className={"space-y-2"}>
              <h3 className={"md:px-0 text-3xl leading-[105%] font-normal max-w-lg text-balance"}>
                Hai bisogno di aiuto? Parti da qui.
              </h3>
              <p className={"text-secondary text-xl max-w-xl "}>
                Scopri come esplorare gli spazi, salvare le tue opere preferite e acquistare con artpay in modo semplice
                e sicuro.
              </p>
            </div>
            <NavLink
              to={"/guide"}
              className={
                "cursor-pointer border border-primary py-2 px-4 text-primary rounded-full hover:bg-primary hover:text-white transition-all hidden md:block mb-6"
              }>
              Leggi tutto
            </NavLink>
          </div>
          <PostList />
        </div>
        <div className={"px-8 md:px-0"}>
          <NewsletterBig title="Accedi in anteprima a opere, artisti e storie selezionate." />
        </div>
      </section>
    </DefaultLayout>
  );
};

export default DashboardPage;
