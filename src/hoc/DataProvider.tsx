import React, { createContext, useContext, useEffect, useState } from "react";
import { Gallery } from "../types/gallery.ts";
import axios, { AxiosResponse } from "axios";
import { SignInFormData } from "../components/SignInForm.tsx";
import { Artwork } from "../types/artwork.ts";
import { Artist } from "../types/artist.ts";
import { Category, CategoryGroup, CategoryMap } from "../types/category.ts";
import { useAuth } from "./AuthProvider.tsx";
import { FavouritesMap, Post, PostCategory, PostCategoryMap } from "../types/post.ts";
import { Media } from "../types/media.ts";
import { postAndMediaToHeroSlide, postAndMediaToPromoItem } from "../utils.ts";
import { HomeContent } from "../types/home.ts";
import { PromoComponentType } from "../components/PromoItem.tsx";
import {
  Order,
  OrderCreateRequest,
  OrderUpdateRequest,
  PaymentIntentRequest,
  ShippingMethodOption,
} from "../types/order.ts";
import { PaymentIntent } from "@stripe/stripe-js";
import { UserProfile } from "../types/user.ts";

export interface ArtworksFilter {
  featured?: boolean;
}

const availableShippingMethods: ShippingMethodOption[] = [
  {
    id: 3,
    instance_id: 3,
    title: "Ritiro in sede",
    method_id: "local_pickup",
    method_title: "Ritiro in sede",
    method_description:
      "Permetti ai clienti di ritirare gli ordini autonomamente. Per impostazione predefinita, quando si utilizza il ritiro in sede le imposte si applicano indipendentemente dall'indirizzo del cliente",
  },
  {
    id: 7,
    instance_id: 7,
    title: "Vendor Shipping",
    method_id: "mvx_vendor_shipping",
    method_title: "Vendor Shipping",
    method_description: "Charge varying rates based on user defined conditions",
  },
];

export interface DataContext {
  info(): Promise<string>;

  getHomeContent(): Promise<HomeContent>;

  listGalleries(): Promise<Gallery[]>;

  getGallery(id: string): Promise<Gallery>;

  getGalleries(ids: number[]): Promise<Gallery[]>;

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

  listPendingOrders(): Promise<Order[]>;

  getPendingOrder(): Promise<Order | null>;

  createOrder(body: OrderCreateRequest): Promise<Order>;

  updateOrder(orderId: number, body: OrderUpdateRequest): Promise<Order>;

  purchaseArtwork(artworkId: number): Promise<Order>;

  createPaymentIntent(body: PaymentIntentRequest): Promise<PaymentIntent>;

  getArtist(id: string): Promise<Artist>;

  getArtists(ids: number[]): Promise<Artist[]>;

  getUserProfile(): Promise<UserProfile>;

  updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile>;

  getCategoryMapValues(artwork: Artwork, key: string): string[];

  getFavouriteArtists(): Promise<number[]>;

  addFavouriteArtist(id: string): Promise<number[]>;

  removeFavouriteArtist(id: string): Promise<number[]>;

  getFavouriteArtworks(): Promise<number[]>;

  addFavouriteArtwork(id: string): Promise<number[]>;

  removeFavouriteArtwork(id: string): Promise<number[]>;

  getFavouriteGalleries(): Promise<number[]>;

  addFavouriteGallery(id: string): Promise<number[]>;

  removeFavouriteGallery(id: string): Promise<number[]>;
}

export interface DataProviderProps extends React.PropsWithChildren {
  baseUrl: string;
}

const defaultContext: DataContext = {
  info: () => Promise.reject("Data provider loaded"),
  getHomeContent: () => Promise.reject("Data provider loaded"),
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
  getArtists: () => Promise.reject("Data provider loaded"),
  getAvailableShippingMethods: () => Promise.reject("Data provider loaded"),
  listPendingOrders: () => Promise.reject("Data provider loaded"),
  getPendingOrder: () => Promise.reject("Data provider loaded"),
  createOrder: () => Promise.reject("Data provider loaded"),
  updateOrder: () => Promise.reject("Data provider loaded"),
  purchaseArtwork: () => Promise.reject("Data provider loaded"),
  createPaymentIntent: () => Promise.reject("Data provider loaded"),
  getUserProfile: () => Promise.reject("Data provider loaded"),
  updateUserProfile: () => Promise.reject("Data provider loaded"),

  getFavouriteArtists: () => Promise.reject("Data provider loaded"),
  addFavouriteArtist: () => Promise.reject("Data provider loaded"),
  removeFavouriteArtist: () => Promise.reject("Data provider loaded"),

  getFavouriteArtworks: () => Promise.reject("Data provider loaded"),
  addFavouriteArtwork: () => Promise.reject("Data provider loaded"),
  removeFavouriteArtwork: () => Promise.reject("Data provider loaded"),

  getFavouriteGalleries: () => Promise.reject("Data provider loaded"),
  addFavouriteGallery: () => Promise.reject("Data provider loaded"),
  removeFavouriteGallery: () => Promise.reject("Data provider loaded"),

  getCategoryMapValues: () => [],
};

const PostCategoryMapStorageKey = "PostCategoryMap";
const CategoryMapStorageKey = "CategoryMap";

const Context = createContext<DataContext>({ ...defaultContext });
const categoryMap: CategoryMap = {};
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
    const loadCategories = async (): Promise<CategoryMap> => {
      const cachedCategoryMap = localStorage.getItem(CategoryMapStorageKey);
      if (cachedCategoryMap) {
        try {
          Object.assign(categoryMap, JSON.parse(cachedCategoryMap || "{}"));
          return categoryMap;
        } catch (e) {
          console.log("postCategoryMap: json parse error", e);
        }
      }

      let categoriesResp = await axios.get<SignInFormData, AxiosResponse<Category[]>>(
        `${baseUrl}/wp-json/wc/v3/products/categories?per_page=100`,
        { headers: { Authorization: auth.getGuestAuth() } },
      );
      const categoriesData = [...categoriesResp.data];
      let page = 1;
      while (categoriesResp.data?.length > 0) {
        page++;
        categoriesResp = await axios.get<SignInFormData, AxiosResponse<Category[]>>(
          `${baseUrl}/wp-json/wc/v3/products/categories?per_page=100&page=${page}`,
          { headers: { Authorization: auth.getGuestAuth() } },
        );
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

      for (let i = 0; i < categoryGroups.length; i++) {
        const categoryGroup = categoryGroups[i];
        categoryMap[categoryGroup.slug] = { ...categoryGroup };
      }
      localStorage.setItem(CategoryMapStorageKey, JSON.stringify(categoryMap));
      return categoryMap;
    };
    const loadPostCategories = async (): Promise<PostCategoryMap> => {
      const cachedPostCategoryMap = localStorage.getItem(PostCategoryMapStorageKey);
      if (cachedPostCategoryMap) {
        try {
          Object.assign(postCategoryMap, JSON.parse(cachedPostCategoryMap || "{}"));
          return postCategoryMap;
        } catch (e) {
          console.log("postCategoryMap: json parse error", e);
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

    Promise.all([loadPostCategories(), loadCategories()]).then(() => {
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
    // https://artpay.art/wp-json/wp/v2/media?include=622,648
    const mediaResp = await axios.get<unknown, AxiosResponse<Media[]>>(
      `${baseUrl}/wp-json/wp/v2/media?include=${ids.join(",")}`,
      {
        headers: { Authorization: auth.getGuestAuth() },
      },
    );
    return mediaResp.data;
  };

  const favourites = {
    async getFavouriteArtists(): Promise<number[]> {
      if (favouritesMap.artists !== null) {
        return favouritesMap.artists;
      }
      const resp = await axios.get<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/getUserFavoriteArtists`,
      );
      favouritesMap.artists = resp.data || [];
      return resp.data || [];
    },
    async addFavouriteArtist(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/addUserFavoriteArtist/${id}`,
      );
      favouritesMap.artists = resp.data || favouritesMap.artists;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data || [];
    },
    async removeFavouriteArtist(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/removeUserFavoriteArtist/${id}`,
      );
      favouritesMap.artists = resp.data || favouritesMap.artists;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data || [];
    },

    async getFavouriteArtworks(): Promise<number[]> {
      if (favouritesMap.artworks !== null) {
        return favouritesMap.artworks;
      }
      const resp = await axios.get<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/getUserFavoriteArtworks`,
      );
      favouritesMap.artworks = resp.data || [];
      return resp.data || [];
    },
    async addFavouriteArtwork(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/addUserFavoriteArtwork/${id}`,
      );
      favouritesMap.artworks = resp.data || favouritesMap.artworks;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data;
    },
    async removeFavouriteArtwork(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/removeUserFavoriteArtwork/${id}`,
      );
      favouritesMap.artworks = resp.data || favouritesMap.artworks;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data;
    },

    async getFavouriteGalleries(): Promise<number[]> {
      if (favouritesMap.galleries !== null) {
        return favouritesMap.galleries;
      }
      const resp = await axios.get<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/getUserFavoriteGalleries`,
      );
      favouritesMap.galleries = resp.data || [];
      return resp.data;
    },
    async addFavouriteGallery(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/addUserFavoriteGallery/${id}`,
      );
      favouritesMap.galleries = resp.data || favouritesMap.galleries;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data;
    },
    async removeFavouriteGallery(id: string): Promise<number[]> {
      const resp = await axios.post<SignInFormData, AxiosResponse<number[]>>(
        `${baseUrl}/wp-json/wp/v2/removeUserFavoriteGallery/${id}`,
      );
      favouritesMap.galleries = resp.data || favouritesMap.galleries;
      dispatchFavouritesUpdated({ ...favouritesMap });
      return resp.data;
    },
  };

  const dataContext: DataContext = {
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
    async getArtwork(id: string): Promise<Artwork> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork>>(`${baseUrl}/wp-json/wc/v3/products/${id}`);
      return resp.data;
    },
    async getArtworks(ids: number[]): Promise<Artwork[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(
        `${baseUrl}/wp-json/wc/v3/products?include=[${ids.join(",")}]`,
      );
      return resp.data;
    },
    async getArtworkBySlug(slug: string): Promise<Artwork> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(
        `${baseUrl}/wp-json/wc/v3/products?slug=${slug}`,
      );
      if (!resp.data?.length) {
        throw "Not found";
      }
      return resp.data[0];
    },
    async getGallery(id: string): Promise<Gallery> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Gallery>>(`${baseUrl}/wp-json/mvx/v1/vendors/${id}`);
      return resp.data;
    },
    async getGalleries(ids: number[]): Promise<Gallery[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Gallery[]>>(
        `${baseUrl}/wp-json/mvx/v1/vendors?include=[${ids.join(",")}]`,
      );
      return resp.data;
    },
    async getGalleryBySlug(slug: string): Promise<Gallery> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Gallery[]>>(
        `${baseUrl}/wp-json/mvx/v1/vendors?nice_name=${slug}`,
      );
      const gallery = resp.data.find((g) => g.shop?.slug === slug);
      if (!gallery) {
        throw "Gallery not found";
      }
      return gallery;
    },
    async listGalleries(): Promise<Gallery[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Gallery[]>>(`${baseUrl}/wp-json/mvx/v1/vendors`);
      return resp.data;
    },
    async listArtworks(): Promise<Artwork[]> {
      const resp = await axios.get<unknown, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products`);

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
        `${baseUrl}/wp-json/wc/v2/products/?vendor=[${galleryId}]`,
      );

      return resp.data;
    },
    async listArtworksForArtist(artistId: string): Promise<Artwork[]> {
      //TODO: listArtworksForArtist filter
      console.log("artistId", artistId);
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products`);
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
      return resp.data;
    },
    async getArtist(artistId: string): Promise<Artist> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artist>>(
        `${baseUrl}/wp-json/wp/v2/artist/${artistId}`,
      );
      return resp.data;
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
    async listPendingOrders(): Promise<Order[]> {
      const resp = await axios.get<unknown, AxiosResponse<Order[]>>(`${baseUrl}/wp-json/wc/v3/orders?status=pending`);
      return resp.data;
    },
    async getPendingOrder(): Promise<Order | null> {
      const customerId = auth.user?.id;
      if (!customerId) {
        throw "Not authenticated";
      }
      console.log("customerId", customerId);
      const resp = await axios.get<unknown, AxiosResponse<Order[]>>(`${baseUrl}/wp-json/wc/v3/orders`, {
        params: {
          status: "pending",
          orderby: "date",
          order: "desc",
          per_page: 1,
          parent: 0,
          customer: customerId,
        },
      });
      return resp.data.length === 1 ? resp.data[0] : null;
    },
    async createOrder(body: OrderCreateRequest): Promise<Order> {
      const resp = await axios.post<OrderCreateRequest, AxiosResponse<Order>>(`${baseUrl}/wp-json/wc/v3/orders`, body);
      return resp.data;
    },
    async updateOrder(orderId: number, body: OrderUpdateRequest): Promise<Order> {
      const resp = await axios.put<OrderUpdateRequest, AxiosResponse<Order>>(
        `${baseUrl}/wp-json/wc/v3/orders/${orderId}`,
        body,
      );
      return resp.data;
    },
    async purchaseArtwork(artworkId: number): Promise<Order> {
      const customerId = auth.user?.id;
      if (!customerId) {
        throw "No customer id";
      }
      const pendingOrder = await this.getPendingOrder();
      const profile = await this.getUserProfile();
      const body: OrderCreateRequest = {
        customer_id: customerId,
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
      let resp: AxiosResponse<Order>;
      if (pendingOrder) {
        pendingOrder.line_items.forEach((item) => {
          body.line_items.push({
            id: item.id,
            product_id: null,
          });
        });
        resp = await axios.put<OrderCreateRequest, AxiosResponse<Order>>(
          `${baseUrl}/wp-json/wc/v3/orders/${pendingOrder.id}`,
          body,
        );
      } else {
        resp = await axios.post<OrderCreateRequest, AxiosResponse<Order>>(`${baseUrl}/wp-json/wc/v3/orders`, body);
      }

      return resp.data;
    },
    async createPaymentIntent(body: PaymentIntentRequest): Promise<PaymentIntent> {
      const resp = await axios.post<PaymentIntentRequest, AxiosResponse<PaymentIntent>>(
        `${baseUrl}/wp-json/wc/v3/stripe/payment_intent`,
        body,
      );
      return resp.data;
    },
    async getUserProfile(): Promise<UserProfile> {
      const userId = auth.user?.id;
      if (!userId) {
        throw "Not authenticated";
      }
      const resp = await axios.get<unknown, AxiosResponse<UserProfile>>(`${baseUrl}/wp-json/wc/v3/customers/${userId}`);
      return resp.data;
    },
    async updateUserProfile(body: Partial<UserProfile>): Promise<UserProfile> {
      const userId = auth.user?.id;
      if (!userId) {
        throw "Not authenticated";
      }
      body.id = userId;
      const resp = await axios.put<Partial<UserProfile>, AxiosResponse<UserProfile>>(
        `${baseUrl}/wp-json/wc/v3/customers/${userId}`,
        body,
      );
      return resp.data;
    },

    getCategoryMapValues(artwork: Artwork, key: string): string[] {
      if (!categoryMap || !categoryMap[key]) {
        return [];
      }
      const categoryGroup = categoryMap[key];
      const childrenIds = categoryGroup.children.map((c) => c.id);

      return artwork.categories.filter((c) => childrenIds.indexOf(c.id) !== -1).map((c) => c.name);
    },

    ...favourites,
  };

  return <Context.Provider value={dataContext}>{isLoading ? <></> : children}</Context.Provider>;
};

export const useData = () => useContext(Context);

export default DataProvider;
