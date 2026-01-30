import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Gallery } from "../types/gallery.ts";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { SignInFormData } from "../components/SignInForm.tsx";
import { Artwork } from "../types/artwork.ts";
import { Artist } from "../types/artist.ts";
import { Category, CategoryGroup, CategoryMap } from "../types/category.ts";
import { useAuth, USER_LOGIN_EVENT } from "./AuthProvider.tsx";
import { FavouritesMap, Post, PostCategory, PostCategoryMap } from "../types/post.ts";
import { Media } from "../types/media.ts";
import {
  isTimestampAfter,
  newOrder,
  postAndMediaToHeroSlide,
  postAndMediaToPromoItem,
  processUserProfile,
} from "../utils.ts";
import { HomeContent } from "../types/home.ts";
import { PromoComponentType } from "../components/PromoItem.tsx";
import {
  Order,
  OrderCreateRequest,
  OrderFilters,
  OrderStatus,
  OrderUpdateRequest,
  PaymentIntentRequest,
  ShippingMethodOption,
  UpdatePaymentIntentRequest,
} from "../types/order.ts";
import { PaymentIntent } from "@stripe/stripe-js";
import {
  BillingData,
  CustomerQuestion,
  CustomerQuestionResponse,
  GroupedMessage,
  Message,
  QuestionWithAnswer,
  UnprocessedUserProfile,
  UpdateUserProfile,
  User,
  UserProfile,
} from "../types/user.ts";
import dayjs from "dayjs";

const availableShippingMethods: ShippingMethodOption[] = [
  {
    id: 3,
    instance_id: 3,
    title: "Ritiro in sede",
    method_id: "local_pickup",
    method_title: "Ritiro in sede",
    method_description: () =>
      "Selezionando questa opzione l'opera viene ritirata dall'acquirente direttamente alla sede della galleria, senza incorrere in costi aggiuntivi. Una volta completato il processo di acquisto, acquirente e galleria si accorderanno su modalità e tempi di ritiro.",
  },
  {
    id: 7,
    instance_id: 7,
    title: "Opera spedita dalla galleria",
    method_id: "mvx_vendor_shipping",
    method_title: "Opera spedita dalla galleria",
    method_description: (shippingCost) =>
      `Selezionando questa opzione l'opera viene direttamente spedita dalla galleria all'acquirente. Per questa opera il costo di spedizione è: €${
        shippingCost?.toFixed(2) || ""
      }`,
  },
];

export interface DataContext {
  info(): Promise<string>;

  getHomeContent(): Promise<HomeContent>;

  getPageBySlug(slug: string): Promise<Post>;

  listGalleries(): Promise<Gallery[]>;

  updatePaymentIntent: (data: UpdatePaymentIntentRequest) => Promise<PaymentIntent>;

  getGallery(id: string): Promise<Gallery>;

  getGalleries(ids?: number[]): Promise<Gallery[]>;

  getGalleryBySlug(slug: string): Promise<Gallery>;

  getArtwork(id: string): Promise<Artwork>;

  getArtworks(ids: number[]): Promise<Artwork[]>;

  getArtworkBySlug(slug: string): Promise<Artwork>;

  listArtworks(): Promise<Artwork[]>;

  listFeaturedArtworks(): Promise<Artwork[]>;

  listArtworksForArtist(galleryId: string): Promise<Artwork[]>;

  listArtworksForGallery(galleryId: string): Promise<Artwork[]>;

  listFeaturedArtists(): Promise<Artist[]>;

  listArtistsForGallery(galleryId: string): Promise<Artist[]>;

  getAvailableShippingMethods(): Promise<ShippingMethodOption[]>;

  listOrders(params?: OrderFilters): Promise<Order[]>;

  getPendingOrder(): Promise<Order | null>;

  getOnHoldOrder(): Promise<Order | null>;

  getProcessingOrder(): Promise<Order | null>;

  getExternalOrder(): Promise<void>;

  getOrder(id: number): Promise<Order | null>;

  createOrder(body: OrderCreateRequest): Promise<Order>;

  updateOrder(orderId: number, body: OrderUpdateRequest): Promise<Order>;

  setOrderStatus(orderId: number, status: OrderStatus, params?: Partial<OrderUpdateRequest>): Promise<Order>;

  purchaseArtwork(artworkId: number, loan?: boolean): Promise<Order>;

  createPaymentIntent(body: PaymentIntentRequest): Promise<PaymentIntent>;

  createPaymentIntentCds(body: PaymentIntentRequest): Promise<PaymentIntent>;

  createRedeemIntent(body: PaymentIntentRequest): Promise<PaymentIntent>;

  createBlockIntent(body: PaymentIntentRequest): Promise<PaymentIntent>;

  clearCachedPaymentIntent(body: PaymentIntentRequest): Promise<void>;

  getArtist(id: string): Promise<Artist>;

  getArtistBySlug(slug: string): Promise<Artist>;

  getArtists(ids: number[]): Promise<Artist[]>;

  getUserInfo(): Promise<User>;

  getUserProfile(): Promise<UserProfile>;

  deleteUser(): Promise<void>;

  updateUserProfile(data: Partial<UpdateUserProfile>): Promise<UserProfile>;

  sendQuestionToVendor(data: CustomerQuestion): Promise<CustomerQuestionResponse>;

  getChatHistory(): Promise<GroupedMessage[]>;

  getProductChatHistory(productId: number): Promise<Message[]>;

  subscribeNewsletter(email: string, optIn: string, formUrl: string): Promise<void>;

  getCategoryMapValues(artwork: Artwork, key: string): string[];

  getArtistCategories(artist: Artist): string[];

  getFavouriteArtists(): Promise<Artist[]>;

  addFavouriteArtist(id: string): Promise<Artist[]>;

  removeFavouriteArtist(id: string): Promise<Artist[]>;

  getFavouriteArtworks(): Promise<number[]>;

  addFavouriteArtwork(id: string): Promise<number[]>;

  removeFavouriteArtwork(id: string): Promise<number[]>;

  getFavouriteGalleries(): Promise<number[]>;

  addFavouriteGallery(id: string): Promise<number[]>;

  removeFavouriteGallery(id: string): Promise<number[]>;

  downpaymentPercentage(): number;
}

export interface DataProviderProps extends React.PropsWithChildren {
  baseUrl: string;
}

const defaultContext: DataContext = {
  info: () => Promise.reject("Data provider loaded"),
  getHomeContent: () => Promise.reject("Data provider loaded"),
  getPageBySlug: () => Promise.reject("Data provider loaded"),
  listGalleries: () => Promise.reject("Data provider loaded"),
  getGallery: () => Promise.reject("Data provider loaded"),
  getGalleries: () => Promise.reject("Data provider loaded"),
  getGalleryBySlug: () => Promise.reject("Data provider loaded"),
  getArtwork: () => Promise.reject("Data provider loaded"),
  getArtworks: () => Promise.reject("Data provider loaded"),
  getArtworkBySlug: () => Promise.reject("Data provider loaded"),
  listArtworks: () => Promise.reject("Data provider loaded"),
  listFeaturedArtworks: () => Promise.reject("Data provider loaded"),
  listArtworksForArtist: () => Promise.reject("Data provider loaded"),
  listArtworksForGallery: () => Promise.reject("Data provider loaded"),
  listFeaturedArtists: () => Promise.reject("Data provider loaded"),
  listArtistsForGallery: () => Promise.reject("Data provider loaded"),
  getArtist: () => Promise.reject("Data provider loaded"),
  getArtistBySlug: () => Promise.reject("Data provider loaded"),
  getArtists: () => Promise.reject("Data provider loaded"),
  getAvailableShippingMethods: () => Promise.reject("Data provider loaded"),
  listOrders: () => Promise.reject("Data provider loaded"),
  getPendingOrder: () => Promise.reject("Data provider loaded"),
  getOnHoldOrder: () => Promise.reject("Data provider loaded"),
  getProcessingOrder: () => Promise.reject("Data provider loaded"),
  getExternalOrder: () => Promise.reject("Data provider loaded"),
  getOrder: () => Promise.reject("Data provider loaded"),
  createOrder: () => Promise.reject("Data provider loaded"),
  updateOrder: () => Promise.reject("Data provider loaded"),
  setOrderStatus: () => Promise.reject("Data provider loaded"),
  purchaseArtwork: () => Promise.reject("Data provider loaded"),
  createPaymentIntent: () => Promise.reject("Data provider loaded"),
  createPaymentIntentCds: () => Promise.reject("Data provider loaded"),
  createRedeemIntent: () => Promise.reject("Data provider loaded"),
  createBlockIntent: () => Promise.reject("Data provider loaded"),
  clearCachedPaymentIntent: () => Promise.reject("Data provider loaded"),
  getUserInfo: () => Promise.reject("Data provider loaded"),
  getUserProfile: () => Promise.reject("Data provider loaded"),
  deleteUser: () => Promise.reject("Data provider loaded"),
  updateUserProfile: () => Promise.reject("Data provider loaded"),
  sendQuestionToVendor: () => Promise.reject("Data provider loaded"),
  getProductChatHistory: () => Promise.reject("Data provider loaded"),
  getChatHistory: () => Promise.reject("Data provider loaded"),

  subscribeNewsletter: () => Promise.reject("Data provider loaded"),

  getFavouriteArtists: () => Promise.reject("Data provider loaded"),
  addFavouriteArtist: () => Promise.reject("Data provider loaded"),
  removeFavouriteArtist: () => Promise.reject("Data provider loaded"),

  getFavouriteArtworks: () => Promise.reject("Data provider loaded"),
  addFavouriteArtwork: () => Promise.reject("Data provider loaded"),
  removeFavouriteArtwork: () => Promise.reject("Data provider loaded"),

  getFavouriteGalleries: () => Promise.reject("Data provider loaded"),
  addFavouriteGallery: () => Promise.reject("Data provider loaded"),
  removeFavouriteGallery: () => Promise.reject("Data provider loaded"),
  updatePaymentIntent: () => Promise.reject("Data provider loaded"),
  getCategoryMapValues: () => [],
  getArtistCategories: () => [],
  downpaymentPercentage: () => 0,
};

const PostCategoryMapStorageKey = "PostCategoryMap";
const ArtistCategoryMapStorageKey = "ArtistCategoryMap";
const CategoryMapStorageKey = "CategoryMap";

const PendingOrderStorageKey = "PendingOrder";
export const CheckedExternalOrderKey = "externalOrderChecked";

const Context = createContext<DataContext>({ ...defaultContext });
const categoryMap: CategoryMap = {};
const artistCategoryMap: CategoryMap = {};
const postCategoryMap: PostCategoryMap = {};
const favouritesMap: FavouritesMap = {
  galleries: null,
  artists: null,
  artworks: null,
};

export const FAVOURITES_UPDATED_EVENT = "favourites:updated";
export const dispatchFavouritesUpdated = (data: FavouritesMap) =>
  document.dispatchEvent(
    new CustomEvent<FavouritesMap>(FAVOURITES_UPDATED_EVENT, {
      detail: data,
    }),
  );
export const DataProvider: React.FC<DataProviderProps> = ({ children, baseUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  //const [categoryMap, setCategoryMap] = useState<CategoryMap | undefined>();
  const auth = useAuth();

  useEffect(() => {
    const loadCategories = async (storageKey: string, endpoint: string): Promise<CategoryMap> => {
      const cachedCategoryMap = localStorage.getItem(storageKey);
      if (cachedCategoryMap) {
        try {
          return JSON.parse(cachedCategoryMap || "{}");
        } catch (e) {
          console.error("categoryMap: json parse error", e);
        }
      }

      const endpointUrl = `${baseUrl}${endpoint}`;

      let categoriesResp = await axios.get<SignInFormData, AxiosResponse<Category[]>>(endpointUrl, {
        headers: { Authorization: auth.getGuestAuth() },
        params: { per_page: 100 },
      });
      const categoriesData = [...categoriesResp.data];
      let page = 1;
      while (categoriesResp.data?.length > 0) {
        page++;
        categoriesResp = await axios.get<SignInFormData, AxiosResponse<Category[]>>(endpointUrl, {
          headers: { Authorization: auth.getGuestAuth() },
          params: { per_page: 100, page: page },
        });
        categoriesData.push(...categoriesResp.data);
      }

      const parents = categoriesData.filter((c) => !c.parent);
      const children = categoriesData.filter((c) => !!c.parent);

      const categoryGroups = parents.map((p) => {
        const categoryGroup: CategoryGroup = {
          ...p,
          children: children.filter((c) => c.parent === p.id),
        };
        return categoryGroup;
      });

      const categoryMap: CategoryMap = {};

      for (let i = 0; i < categoryGroups.length; i++) {
        const categoryGroup = categoryGroups[i];
        categoryMap[categoryGroup.slug] = { ...categoryGroup };
      }
      localStorage.setItem(storageKey, JSON.stringify(categoryMap));
      return categoryMap;
    };
    const loadPostCategories = async (): Promise<PostCategoryMap> => {
      const cachedPostCategoryMap = localStorage.getItem(PostCategoryMapStorageKey);
      if (cachedPostCategoryMap) {
        try {
          Object.assign(postCategoryMap, JSON.parse(cachedPostCategoryMap || "{}"));
          return postCategoryMap;
        } catch (e) {
          console.error("postCategoryMap: json parse error", e);
        }
      }
      const postCategoriesResp = await axios.get<SignInFormData, AxiosResponse<PostCategory[]>>(
        `${baseUrl}/wp-json/wp/v2/categories`,
        { headers: { Authorization: auth.getGuestAuth() } },
      );

      for (let i = 0; i < postCategoriesResp.data.length; i++) {
        const postCategory = postCategoriesResp.data[i];
        postCategoryMap[postCategory.slug] = postCategory;
      }
      localStorage.setItem(PostCategoryMapStorageKey, JSON.stringify(postCategoryMap));
      return postCategoryMap;
    };

    Promise.all([
      loadPostCategories(),
      loadCategories(CategoryMapStorageKey, "/wp-json/wc/v3/products/categories").then((categoryMapResp) => {
        Object.assign(categoryMap, categoryMapResp);
      }),
      loadCategories(ArtistCategoryMapStorageKey, "/wp-json/wp/v2/categoria_artisti").then((categoryMapResp) => {
        Object.assign(artistCategoryMap, categoryMapResp);
      }),
    ]).then(() => {
      setIsLoading(false);
    });
  }, [auth, baseUrl]);

  // Guest auth interceptor
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use((value) => {
      if (value.status < 300 && typeof value.data === "string") {
        throw value.data;
      }
      return value;
    });

    return () => {
      axios.interceptors.request.eject(interceptorId);
    };
  }, []);

  const loadMedia = async (ids: number[]): Promise<Media[]> => {
    const mediaResp = await axios.get<unknown, AxiosResponse<Media[]>>(
      `${baseUrl}/wp-json/wp/v2/media?include=${ids.join(",")}`,
      {
        headers: { Authorization: auth.getGuestAuth() },
      },
    );
    return mediaResp.data;
  };

  const favourites = {
    async getFavouriteArtists(): Promise<Artist[]> {
      if (!auth.isAuthenticated) {
        return [];
      }
      if (favouritesMap.artists !== null) {
        return favouritesMap.artists;
      }
      const resp = await axios.get<SignInFormData, AxiosResponse<Artist[]>>(
        `${baseUrl}/wp-json/wp/v2/getUserFavoriteArtists`,
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.artists = resp.data || [];
      return resp.data || [];
    },
    async addFavouriteArtist(id: string): Promise<Artist[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<Artist[]>>(
        `${baseUrl}/wp-json/wp/v2/addUserFavoriteArtist/${id}`,
        {},
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.artists = resp.data || favouritesMap.artists;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data || [];
    },
    async removeFavouriteArtist(id: string): Promise<Artist[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<Artist[]>>(
        `${baseUrl}/wp-json/wp/v2/removeUserFavoriteArtist/${id}`,
        {},
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.artists = resp.data || favouritesMap.artists;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data || [];
    },

    async getFavouriteArtworks(): Promise<number[]> {
      if (!auth.isAuthenticated) {
        return [];
      }
      if (favouritesMap.artworks !== null) {
        return favouritesMap.artworks;
      }
      const resp = await axios.get<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/getUserFavoriteArtworks`,
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.artworks = resp.data || [];
      return resp.data || [];
    },
    async addFavouriteArtwork(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/addUserFavoriteArtwork/${id}`,
        {},
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.artworks = resp.data || favouritesMap.artworks;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data;
    },
    async removeFavouriteArtwork(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/removeUserFavoriteArtwork/${id}`,
        {},
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.artworks = resp.data || favouritesMap.artworks;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data;
    },

    async getFavouriteGalleries(): Promise<number[]> {
      if (!auth.isAuthenticated) {
        return [];
      }
      if (favouritesMap.galleries !== null) {
        return favouritesMap.galleries;
      }
      const resp = await axios.get<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/getUserFavoriteGalleries`,
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.galleries = resp.data || [];
      return resp.data || [];
    },
    async addFavouriteGallery(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/addUserFavoriteGallery/${id}`,
        {},
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.galleries = resp.data || favouritesMap.galleries;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data;
    },
    async removeFavouriteGallery(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/removeUserFavoriteGallery/${id}`,
        {},
        { headers: { Authorization: auth.getAuthToken() } },
      );
      favouritesMap.galleries = resp.data || favouritesMap.galleries;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data;
    },
  };

  const dataContext = useMemo(
    () => ({
      info(): Promise<string> {
        return Promise.resolve("");
      },
      async getHomeContent(): Promise<HomeContent> {
        // 1: "hp-slider"
        // 2: "promo-big"
        // 3: "promo-small"
        const heroSliderCategory = postCategoryMap["hp-slider"]?.id || 0;
        const promoBigCategory = postCategoryMap["promo-big"]?.id || 0;
        const promoSmallCategory = postCategoryMap["promo-small"]?.id || 0;

        //TODO: categoryFilter
        // const categoryIds = [heroSliderCategory, promoBigCategory, promoSmallCategory].filter((v) => !!v);
        // const categoryFilter = categoryIds.map((id) => `categories[]=${id}`).join("&");
        // ?${categoryFilter}

        const postsResp = await axios.get<unknown, AxiosResponse<Post[]>>(`${baseUrl}/wp-json/wp/v2/posts`, {
          headers: { Authorization: auth.getGuestAuth() },
        });

        const media = await loadMedia(postsResp.data.map((p) => p.featured_media).filter((id) => !!id));

        const heroPosts = postsResp.data.filter((p) => p.categories.indexOf(heroSliderCategory) !== -1);
        const mappedHeroPosts = heroPosts.map((post) => {
          const postMedia = media.find((m) => m.id === post.featured_media);
          return { post: post, media: postMedia };
        });
        const heroSlides = mappedHeroPosts.map(({ post, media }) => postAndMediaToHeroSlide(post, media));

        const promoPosts = postsResp.data.filter(
          (p) => p.categories.indexOf(promoBigCategory) !== -1 || p.categories.indexOf(promoSmallCategory) !== -1,
        );
        const mappedPromoPosts = promoPosts.map((post) => {
          const postMedia = media.find((m) => m.id === post.featured_media);
          const componentType: PromoComponentType =
            post.categories.indexOf(promoBigCategory) !== -1 ? "promo-big" : "promo-small";
          return { post: post, media: postMedia, componentType: componentType };
        });
        const promoItems = mappedPromoPosts
          .map(({ post, media, componentType }) => postAndMediaToPromoItem(componentType, post, media))
          .sort((a, b) => a.order - b.order);

        return {
          heroSlides: heroSlides.sort((a, b) => a.order - b.order),
          promoItems: promoItems,
        };
      },
      async getPageBySlug(slug: string): Promise<Post> {
        // /wp-json/wp/v2/pages?slug=informativa-e-gestione-dei-cookies
        const resp = await axios.get<SignInFormData, AxiosResponse<Post[]>>(`/wp-json/wp/v2/pages`, {
          params: {
            slug: slug,
          },
        });
        if (resp.data.length === 0) {
          throw "Pagina non trovata";
        }
        return resp.data[0];
      },
      async getArtwork(id: string): Promise<Artwork> {
        const resp = await axios.get<SignInFormData, AxiosResponse<Artwork>>(
          `${baseUrl}/wp-json/wc/v3/products/${id}`,
          {
            headers: { Authorization: auth.getGuestAuth() },
          },
        );
        return resp.data;
      },
      async getArtworks(ids: number[]): Promise<Artwork[]> {
        if (ids.length === 0) {
          return [];
        }
        const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products`, {
          headers: { Authorization: auth.getGuestAuth() },
          params: {
            include: ids.join(","), //include=${ids.join(",")}
          },
        });
        return resp.data;
      },
      async getArtworkBySlug(slug: string): Promise<Artwork> {
        const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(
          `${baseUrl}/wp-json/wc/v3/products?slug=${slug}`,
          { headers: { Authorization: auth.getGuestAuth() } },
        );
        if (!resp.data?.length) {
          throw "Not found";
        }
        return resp.data[0];
      },
      async getGallery(id: string): Promise<Gallery | null> {
        try {
          const resp = await axios.get<SignInFormData, AxiosResponse<Gallery>>(
            `${baseUrl}/wp-json/mvx/v1/vendors/${id}`,
            {
              headers: {
                Authorization: auth.getGuestAuth(),
              },
            },
          );
          return resp.data ?? null;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
      async getGalleries(ids?: number[]): Promise<Gallery[]> {
        if (!ids) {
          const resp = await axios.get<SignInFormData, AxiosResponse<Gallery[]>>(
            `${baseUrl}/wp-json/mvx/v1/vendors?page=1&per_page=100`,
            {
              headers: { Authorization: auth.getGuestAuth() },
            },
          );
          return resp.data;
        }
        const galleries = await Promise.all(ids.map((id) => this.getGallery(id.toString())));
        return galleries.filter((gallery): gallery is Gallery => gallery !== null);
      },
      async getGalleryBySlug(slug: string): Promise<Gallery> {
        const resp = await axios.get<SignInFormData, AxiosResponse<Gallery[]>>(
          `${baseUrl}/wp-json/mvx/v1/vendors?page=1&per_page=100&nice_name${slug}`,
          { headers: { Authorization: auth.getGuestAuth() } },
        );
        const gallery = resp.data.find((g) => g.shop?.slug === slug);
        if (!gallery) {
          throw "Gallery not found";
        }
        return gallery as Gallery;
      },
      async listGalleries(): Promise<Gallery[]> {
        const resp = await axios.get<SignInFormData, AxiosResponse<Gallery[]>>(`${baseUrl}/wp-json/mvx/v1/vendors`, {
          headers: { Authorization: auth.getGuestAuth() },
        });
        return resp.data;
      },
      async listArtworks(): Promise<Artwork[]> {
        const resp = await axios.get<unknown, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products`, {
          headers: { Authorization: auth.getGuestAuth() },
        });

        return resp.data;
      },
      async listFeaturedArtworks(): Promise<Artwork[]> {
        const resp = await axios.get<unknown, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products`, {
          params: { featured: true },
          headers: { Authorization: auth.getGuestAuth() },
        });

        return resp.data;
      },
      async listArtworksForGallery(galleryId: string): Promise<Artwork[]> {
        const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(
          `${baseUrl}/wp-json/wc/v2/products/?vendor=[${galleryId}]&per_page=100`,
          { headers: { Authorization: auth.getGuestAuth() } },
        );

        return resp.data;
      },
      async listArtworksForArtist(/*artistId: string*/): Promise<Artwork[]> {
        //TODO: listArtworksForArtist filter
        const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products`, {
          headers: { Authorization: auth.getGuestAuth() },
        });
        return resp.data;
      },
      async listFeaturedArtists(): Promise<Artist[]> {
        //TODO: featured filter
        const resp = await axios.get<SignInFormData, AxiosResponse<Artist[]>>(`${baseUrl}/wp-json/wp/v2/artist`, {
          headers: { Authorization: auth.getGuestAuth() },
        });
        return resp.data;
      },
      async listArtistsForGallery(galleryId: string): Promise<Artist[]> {
        const resp = await axios.get<SignInFormData, AxiosResponse<Artist[]>>(
          `${baseUrl}/wp-json/wp/v2/artistsOfVendor/${galleryId}`,
        );
        return resp.data || [];
      },
      async getArtist(artistId: string): Promise<Artist> {
        const resp = await axios.get<SignInFormData, AxiosResponse<Artist>>(
          `${baseUrl}/wp-json/wp/v2/artist/${artistId}`,
        );
        return resp.data;
      },
      async getArtistBySlug(artistSlug: string): Promise<Artist> {
        const resp = await axios.get<SignInFormData, AxiosResponse<Artist[]>>(
          `${baseUrl}/wp-json/wp/v2/artistBySlug/${artistSlug}`,
          {},
        );
        if (resp.data.length === 0) {
          throw "Pagina non trovata";
        }
        return resp.data[0];
      },
      async getArtists(artistIds: number[]): Promise<Artist[]> {
        //TODO: filtro "include"
        const resp = Promise.all(artistIds.map((id) => this.getArtist(id.toString())));
        /*const resp = await axios.get<SignInFormData, AxiosResponse<Artist[]>>(
              `${baseUrl}/wp-json/wp/v2/artist?include=[${artistIds.join(",")}]`,
            );*/
        return resp;
      },
      async getAvailableShippingMethods(): Promise<ShippingMethodOption[]> {
        return availableShippingMethods.map((s) => ({ ...s }));
      },
      async listOrders({ status, ...params }: OrderFilters = {}): Promise<Order[]> {
        const orderParams: OrderFilters = { ...params };
        if (status) {
          orderParams.status = Array.isArray(status) ? status.join(",") : (status as string);
        }
        const resp = await axios.get<OrderFilters, AxiosResponse<Order[]>>(`${baseUrl}/wp-json/wc/v3/orders`, {
          params: orderParams,
          headers: {
            Authorization: auth.getAuthToken(),
          },
        });
        return resp.data;
      },
      async getPendingOrder(): Promise<Order | null> {
        const customerId = auth.user?.id;
        if (!customerId) {
          const pendingOrderStr = localStorage.getItem(PendingOrderStorageKey);
          if (!pendingOrderStr) {
            return null;
          }
          const pendingOrder: Order = JSON.parse(pendingOrderStr);
          return pendingOrder;
          //throw "Not authenticated";
        }
        const resp = await axios.get<unknown, AxiosResponse<Order[]>>(`${baseUrl}/wp-json/wc/v3/orders`, {
          params: {
            status: "pending",
            orderby: "date",
            order: "desc",
            per_page: 1,
            parent: 0,
            customer: customerId,
          },
          headers: { Authorization: auth.getAuthToken() },
        });
        return resp.data.length === 1 ? resp.data[0] : null;
      },

      /*ordini esterni: fare regain in await e poi lista ordini, check su localstorage wc_order
      -> check sul login dell'utente sul customerId
      -> wc_order nel localstorage -> vuol dire che non è stato fatto il regain
      -> sono loggato e non c'è wc_order nel localstorage -> vado a ricercare direttamente gli ultimi ordini in stato on-hold
    */
      async getOnHoldOrder(): Promise<Order | null> {
        const customerId = auth.user?.id;
        if (!customerId) {
          return null;
        }

        const externalOrderKey = localStorage.getItem("externalOrderKey");
        if (externalOrderKey) {
          try {
            await axios.get(`${baseUrl}/wp-json/wp/v2/regain-flash-order`, {
              params: {
                order_id: externalOrderKey,
              },
              headers: {
                Authorization: auth.getAuthToken(),
              },
            });
            localStorage.removeItem("externalOrderKey");
          } catch (e) {
            console.log(e);
          }
        }

        const resp = await axios.get<unknown, AxiosResponse<Order[]>>(`${baseUrl}/wp-json/wc/v3/orders`, {
          params: {
            status: "on-hold",
            orderby: "date",
            order: "desc",
            per_page: 1,
            parent: 0,
            customer: customerId,
          },
          headers: { Authorization: auth.getAuthToken() },
        });

        localStorage.setItem("CdsOrder", JSON.stringify(resp.data[0]));

        return resp.data.length === 1 ? resp.data[0] : null;
      },

      async getExternalOrder(): Promise<void> {
        const checkedExternalOrder = localStorage.getItem(CheckedExternalOrderKey);

        if (!checkedExternalOrder) {
          try {
            await axios.get<Order[]>(`${baseUrl}/wp-json/wp/v2/flashOrder`, {
              headers: { Authorization: auth.getAuthToken() },
            });

            localStorage.setItem(CheckedExternalOrderKey, "true");
          } catch (error) {
            throw "order not found";
          }
        } else {
          throw "order not found";
        }
      },

      async getOrder(id: number): Promise<Order | null> {
        const resp = await axios.get<unknown, AxiosResponse<Order>>(`${baseUrl}/wp-json/wc/v3/orders/${id}`, {
          headers: { Authorization: auth.getAuthToken() },
        });
        return resp.data;
      },

      async getProcessingOrder(): Promise<Order | null> {
        const customerId = auth.user?.id;
        if (!customerId) {
          return null;
        }
        const resp = await axios.get<unknown, AxiosResponse<Order[]>>(`${baseUrl}/wp-json/wc/v3/orders`, {
          params: {
            status: "processing",
            orderby: "date",
            order: "desc",
            per_page: 1,
            parent: 0,
            customer: customerId,
          },
          headers: { Authorization: auth.getAuthToken() },
        });

        localStorage.setItem("CdsOrder", JSON.stringify(resp.data[0]));

        return resp.data.length === 1 ? resp.data[0] : null;
      },

      async createOrder(body: OrderCreateRequest): Promise<Order> {
        const resp = await axios.post<OrderCreateRequest, AxiosResponse<Order>>(
          `${baseUrl}/wp-json/wc/v3/orders`,
          body,
          {
            headers: { Authorization: auth.getAuthToken() },
          },
        );
        return resp.data;
      },
      async updateOrder(orderId: number, body: OrderUpdateRequest): Promise<Order> {
        const resp = await axios.put<OrderUpdateRequest, AxiosResponse<Order>>(
          `${baseUrl}/wp-json/wc/v3/orders/${orderId}`,
          body,
          {
            headers: { Authorization: auth.getAuthToken() },
          },
        );
        return resp.data;
      },
      async setOrderStatus(orderId: number, status: OrderStatus, params = {}): Promise<Order> {
        const resp = await axios.put<OrderUpdateRequest, AxiosResponse<Order>>(
          `${baseUrl}/wp-json/wc/v3/orders/${orderId}`,
          { status: status, ...params },
          {
            headers: {
              Authorization: auth.getAuthToken(),
            },
          },
        );
        return resp.data;
      },
      async purchaseArtwork(artworkId: number, loan = false): Promise<Order> {
        // , loan = false
        const customerId = auth.user?.id;
        if (!customerId) {
          const artwork = await this.getArtwork(artworkId.toString());
          const order = newOrder(artwork);
          localStorage.setItem(PendingOrderStorageKey, JSON.stringify(order));
          return order;
          // throw "No customer id";
        }
        const pendingOrder = await this.getPendingOrder();
        const profile = await this.getUserProfile();
        const body: OrderCreateRequest = {
          customer_id: customerId,
          // status: "draft",
          line_items: [
            {
              product_id: artworkId,
              quantity: 1,
            },
          ],
          set_paid: false,
          shipping: { ...profile.shipping },
          shipping_lines: [],
        };
        if (loan) {
          //body.payment_method = "card";
          // body.customer_note = "Blocco opera";
        }
        if (pendingOrder) {
          try {
            await axios.put<OrderCreateRequest, AxiosResponse<Order>>(
              `${baseUrl}/wp-json/wc/v3/orders/${pendingOrder.id}`,
              { status: "cancelled", set_paid: false, customer_id: customerId, id: pendingOrder.id },
              {
                headers: {
                  Authorization: auth.getAuthToken(),
                },
              },
            );
          } catch (e) {
            console.error(e);
          }
        }
        const resp = await axios.post<OrderCreateRequest, AxiosResponse<Order>>(
          `${baseUrl}/wp-json/wc/v3/orders`,
          body,
          {
            headers: {
              Authorization: auth.getAuthToken(),
            },
          },
        );

        return resp.data;
      },
      async createPaymentIntent(body: PaymentIntentRequest): Promise<PaymentIntent> {
        const cacheKey = `payment-intents-${body.wc_order_key}`;
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
          try {
            const paymentIntent: PaymentIntent = JSON.parse(cachedItem);
            if (isTimestampAfter(paymentIntent.created, 60 * 60)) {
              return paymentIntent;
            }
          } catch (e) {
            console.error(e);
          }
        }

        try {
          const resp = await axios.post<PaymentIntentRequest, AxiosResponse<PaymentIntent>>(
            `${baseUrl}/wp-json/artpay/v1/stripe/payment-intent-connect`,
            body,
            {
              headers: {
                Authorization: auth.getAuthToken(),
              },
            },
          );
          localStorage.setItem(cacheKey, JSON.stringify(resp.data));
          return resp.data;
        } catch (error) {
          if (
            isAxiosError(error) &&
            error.response?.data?.error === "Vendor has not connected their Stripe account"
          ) {
            console.log("Vendor Stripe account not connected, using fallback endpoint");
            const fallbackResp = await axios.post<PaymentIntentRequest, AxiosResponse<PaymentIntent>>(
              `https://vendor.artpay.art/wp-json/wc/v3/stripe/payment_intent`,
              body,
              {
                headers: {
                  Authorization: auth.getAuthToken(),
                },
              },
            );
            localStorage.setItem(cacheKey, JSON.stringify(fallbackResp.data));
            return fallbackResp.data;
          }
          throw error;
        }
      },

      async createPaymentIntentCds(body: PaymentIntentRequest): Promise<PaymentIntent> {
        const cacheKey = `payment-intents-cds-${body.wc_order_key}`;
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
          try {
            const paymentIntent: PaymentIntent = JSON.parse(cachedItem);
            if (isTimestampAfter(paymentIntent.created, 60 * 60)) {
              return paymentIntent;
            }
          } catch (e) {
            console.error(e);
          }
        }
        const resp = await axios.post<PaymentIntentRequest, AxiosResponse<PaymentIntent>>(
          `${baseUrl}/wp-json/wc/v3/stripe/cds_payment_intent`,
          body,
          {
            headers: {
              Authorization: auth.getAuthToken(),
            },
          },
        );
        if (resp.data.amount < 150000) {
          const updateFee = await this.updatePaymentIntent({
            wc_order_key: body.wc_order_key,
            payment_method: "klarna",
          });
          localStorage.setItem(cacheKey, JSON.stringify(updateFee));
          return updateFee;
        }
        localStorage.setItem(cacheKey, JSON.stringify(resp.data));
        return resp.data;
      },
      async updatePaymentIntent(data: UpdatePaymentIntentRequest): Promise<PaymentIntent> {
        const resp = await axios.post<PaymentIntentRequest, AxiosResponse<PaymentIntent>>(
          `${baseUrl}/wp-json/wc/v3/stripe/upd_payment_intent_fee`,
          data,
          {
            headers: {
              Authorization: auth.getAuthToken(),
            },
          },
        );
        return resp.data;
      },
      async createRedeemIntent(body: PaymentIntentRequest): Promise<PaymentIntent> {
        const cacheKey = `payment-intents-redeem-${body.wc_order_key}`;
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
          try {
            const paymentIntent: PaymentIntent = JSON.parse(cachedItem);
            if (isTimestampAfter(paymentIntent.created, 60 * 60)) {
              return paymentIntent;
            }
          } catch (e) {
            console.error(e);
          }
        }
        const resp = await axios.post<PaymentIntentRequest, AxiosResponse<PaymentIntent>>(
          `${baseUrl}/wp-json/wc/v3/stripe/redeem_payment_intent`,
          body,
        );
        localStorage.setItem(cacheKey, JSON.stringify(resp.data));
        return resp.data;
      },
      async createBlockIntent(body: PaymentIntentRequest): Promise<PaymentIntent> {
        // const cacheKey = `payment-intents-block-${body.wc_order_key}`;
        /*const cachedItem = localStorage.getItem(cacheKey);
            if (cachedItem) {
              try {
                const paymentIntent: PaymentIntent = JSON.parse(cachedItem);
                if (isTimestampAfter(paymentIntent.created, 60 * 60)) {
                  return paymentIntent;
                }
              } catch (e) {
                console.error(e);
              }
            }*/
        const resp = await axios.post<PaymentIntentRequest, AxiosResponse<PaymentIntent>>(
          `${baseUrl}/wp-json/wc/v3/stripe/block_intent`,
          body,
          {
            headers: {
              Authorization: auth.getAuthToken(),
            },
          },
        );
        // localStorage.setItem(cacheKey, JSON.stringify(resp.data));
        return resp.data;
      },
      async clearCachedPaymentIntent(body: PaymentIntentRequest): Promise<void> {
        const cacheKey = `payment-intents-${body.wc_order_key}`;
        localStorage.removeItem(cacheKey);
      },
      async getUserInfo(): Promise<User> {
        const resp = await axios.get<unknown, AxiosResponse<User>>(`${baseUrl}/wp-json/wp/v2/users/me`, {
          headers: { Authorization: auth.getAuthToken() },
        });
        return resp.data;
      },
      async getUserProfile(): Promise<UserProfile> {
        const userId = auth.user?.id;
        if (!userId) {
          throw "Not authenticated";
        }
        const resp = await axios.get<unknown, AxiosResponse<UnprocessedUserProfile>>(
          `${baseUrl}/wp-json/wc/v3/customers/${userId}`,
          {
            headers: { Authorization: auth.getAuthToken() },
          },
        );
        return processUserProfile(resp.data);
      },
      async deleteUser(): Promise<void> {
        const userId = auth.user?.id;
        if (!userId) {
          throw "Not authenticated";
        }
        await axios.post<unknown, AxiosResponse<object>>(
          `${baseUrl}/wp-json/wp/v2/gdpr-delete`,
          {},
          {
            headers: {
              Authorization: auth.getAuthToken(),
            },
          },
        );
      },
      async updateUserProfile(body: Partial<UpdateUserProfile>): Promise<UserProfile> {
        const userId = auth.user?.id;
        if (!userId) {
          throw "Not authenticated";
        }
        const billingMetadataProps: (keyof BillingData)[] = ["cf", "invoice_type", "PEC", "private_customer"];
        if (body?.billing) {
          billingMetadataProps.forEach((prop) => {
            if (!body.billing) {
              return;
            }
            const propValue: string | boolean | undefined = body.billing[prop];
            if (typeof propValue !== "undefined") {
              body.meta_data = body.meta_data || [];
              body.meta_data.push({ key: `billing_${prop}`, value: String(propValue) });
            }
          });
          if (typeof body.billing?.same_as_shipping !== "undefined") {
            body.meta_data = body.meta_data || [];
            body.meta_data.push({ key: `billing_same_as_shipping`, value: body.billing?.same_as_shipping ? "1" : "" });
          }
        }
        body.id = userId;
        const resp = await axios.put<Partial<UserProfile>, AxiosResponse<UnprocessedUserProfile>>(
          `${baseUrl}/wp-json/wc/v3/customers/${userId}`,
          body,
          {
            headers: {
              Authorization: auth.getAuthToken(),
            },
          },
        );
        return processUserProfile(resp.data);
      },
      async sendQuestionToVendor(data: CustomerQuestion): Promise<CustomerQuestionResponse> {
        const resp = await axios.post<CustomerQuestion, AxiosResponse<CustomerQuestionResponse>>(
          `${baseUrl}/wp-json/wc/v3/customer-question`,
          data,
          { headers: { Authorization: auth.getAuthToken() } },
        );
        return resp.data;
      },
      async getChatHistory(): Promise<GroupedMessage[]> {
        const resp = await axios.get<QuestionWithAnswer[]>(`${baseUrl}/wp-json/wc/v3/customer-question`, {
          headers: { Authorization: auth.getAuthToken() },
        });

        const messageGroups: { [key: string]: Message[] } = {};
        const messages: GroupedMessage[] = [];

        resp.data.forEach((msg) => {
          if (!messageGroups[msg.product_ID]) {
            messageGroups[msg.product_ID] = [];
          }
          try {
            messageGroups[msg.product_ID].push({
              text: msg.ques_details,
              userMessage: true,
              date: dayjs(msg.ques_created),
            });
          } catch (e) {
            console.error("chat message error", e);
          }
          if (msg.answer) {
            try {
              messageGroups[msg.product_ID].push({
                text: msg.answer.ans_details,
                userMessage: false,
                date: dayjs(msg.answer.ans_created),
              });
            } catch (e) {
              console.error("chat message error", e);
            }
          }
        });
        for (const productId in messageGroups) {
          messageGroups[productId] = messageGroups[productId].sort((a, b) => a.date.diff(b.date));
        }
        const productKeys = Object.keys(messageGroups).map((k) => +k);
        const products = await this.getArtworks(productKeys);

        products.forEach((product) => {
          const productMessages = messageGroups[product.id.toString()];
          if (productMessages?.length < 1) {
            return;
          }
          const lastMessage = productMessages[productMessages.length - 1];
          messages.push({
            product: { ...product },
            lastMessageDate: lastMessage.date,
            lastMessageText: lastMessage.text,
            messages: messageGroups[product.id.toString()],
          });
        });

        return messages.sort((a, b) => b.lastMessageDate.diff(a.lastMessageDate));
      },
      async getProductChatHistory(productId: number): Promise<Message[]> {
        const resp = await axios.get<QuestionWithAnswer[]>(`${baseUrl}/wp-json/wc/v3/customer-question`, {
          params: {
            product_id: productId,
          },
          headers: { Authorization: auth.getAuthToken() },
        });

        const messages: Message[] = [];
        resp.data.forEach((msg) => {
          if (msg.product_ID !== productId.toString()) {
            return;
          }
          try {
            messages.push({ text: msg.ques_details, userMessage: true, date: dayjs(msg.ques_created) });
          } catch (e) {
            console.error("chat message error", e);
          }
          if (msg.answer) {
            try {
              messages.push({ text: msg.answer.ans_details, userMessage: false, date: dayjs(msg.answer.ans_created) });
            } catch (e) {
              console.error("chat message error", e);
            }
          }
        });
        return messages.sort((a, b) => a.date.diff(b.date));
      },
      async subscribeNewsletter(email: string, optIn: string, formUrl: string): Promise<void> {
        const formData = new FormData();
        formData.append("EMAIL", email);
        formData.append("OPT_IN", optIn);
        await axios
          .post<FormData, AxiosResponse<unknown>>(formUrl, formData, { headers: { Authorization: undefined } })
          .catch((err) => {
            if (isAxiosError(err) && err.code === "ERR_NETWORK") {
              return;
            } else {
              throw err;
            }
          });
      },

      getCategoryMapValues(artwork: Artwork, key: string): string[] {
        if (!categoryMap || !categoryMap[key]) {
          return [];
        }
        const categoryGroup = categoryMap[key];
        const childrenIds = categoryGroup.children.map((c) => c.id);

        return artwork.categories.filter((c) => childrenIds.indexOf(c.id) !== -1).map((c) => c.name);
      },

      getArtistCategories(artist: Artist): string[] {
        const flatArtistCategories: string[] = [];
        const categoryIds = artist?.categoria_artisti || [];
        for (const artistCategoryMapKey in artistCategoryMap) {
          const categoryNames = (artistCategoryMap[artistCategoryMapKey].children || [])
            .filter((c) => categoryIds.indexOf(c.id) !== -1)
            .map((c) => c.name);
          flatArtistCategories.push(...categoryNames);
        }

        return flatArtistCategories;
        /*if (!categoryMap || !categoryMap[key]) {
              return [];
            }
            const categoryGroup = categoryMap[key];
            const childrenIds = categoryGroup.children.map((c) => c.id);

            return artist.categoria_artisti.filter((c) => childrenIds.indexOf(c) !== -1).map((c) => c.name);*/
      },
      downpaymentPercentage: () => 5,
      ...favourites,
    }),
    [auth, baseUrl],
  );

  useEffect(() => {
    const handleUserLoggedIn = async () => {
      try {
        const pendingOrderStr = localStorage.getItem(PendingOrderStorageKey);
        if (!pendingOrderStr) {
          return;
        }

        const pendingOrder: Order = JSON.parse(pendingOrderStr);
        if (pendingOrder.line_items.length) {
          setIsLoading(true);

          await dataContext.purchaseArtwork(pendingOrder.line_items[0].product_id);
          localStorage.removeItem(PendingOrderStorageKey);
        }
      } catch (error) {
        console.error("Errore nel recupero dell'ordine:", error);
      } finally {
        setIsLoading(false);
      }
    };

    document.addEventListener(USER_LOGIN_EVENT, handleUserLoggedIn);

    return () => {
      document.removeEventListener(USER_LOGIN_EVENT, handleUserLoggedIn);
    };
  }, [dataContext.purchaseArtwork]);

  return <Context.Provider value={dataContext as DataContext}>{isLoading ? <></> : children}</Context.Provider>;
};

export const useData = () => useContext(Context);

export default DataProvider;
