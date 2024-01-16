import React, { createContext, useContext, useEffect, useState } from "react";
import { Gallery } from "../types/gallery.ts";
import axios, { AxiosResponse } from "axios";
import { SignInFormData } from "../components/SignInForm.tsx";
import { Artwork } from "../types/artwork.ts";
import { Artist } from "../types/artist.ts";
import { Category, CategoryGroup, CategoryMap } from "../types/category.ts";
import { useAuth } from "./AuthProvider.tsx";

export interface DataContext {
  info(): Promise<string>;
  listGalleries(): Promise<Gallery[]>;
  getGallery(id: string): Promise<Gallery>;
  getGalleryBySlug(slug: string): Promise<Gallery>;
  getArtwork(id: string): Promise<Artwork>;
  getArtworkBySlug(slug: string): Promise<Artwork>;
  listArtworks(): Promise<Artwork[]>;
  listArtworksForArtist(galleryId: string): Promise<Artwork[]>;
  listArtworksForGallery(galleryId: string): Promise<Artwork[]>;
  listArtistsForGallery(galleryId: string): Promise<Artist[]>;
  getArtist(id: string): Promise<Artist>;
  getCategoryMapValues(artwork: Artwork, key: string): string[];
}

export interface DataProviderProps extends React.PropsWithChildren {
  baseUrl: string;
}

const defaultContext: DataContext = {
  info: () => Promise.reject("Data provider loaded"),
  listGalleries: () => Promise.reject("Data provider loaded"),
  getGallery: () => Promise.reject("Data provider loaded"),
  getGalleryBySlug: () => Promise.reject("Data provider loaded"),
  getArtwork: () => Promise.reject("Data provider loaded"),
  getArtworkBySlug: () => Promise.reject("Data provider loaded"),
  listArtworks: () => Promise.reject("Data provider loaded"),
  listArtworksForArtist: () => Promise.reject("Data provider loaded"),
  listArtworksForGallery: () => Promise.reject("Data provider loaded"),
  listArtistsForGallery: () => Promise.reject("Data provider loaded"),
  getArtist: () => Promise.reject("Data provider loaded"),
  getCategoryMapValues: () => [],
};

const Context = createContext<DataContext>({ ...defaultContext });
const categoryMap: CategoryMap = {};
export const DataProvider: React.FC<DataProviderProps> = ({ children, baseUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  //const [categoryMap, setCategoryMap] = useState<CategoryMap | undefined>();
  const auth = useAuth();

  useEffect(() => {
    const loadCategories = async (): Promise<CategoryMap> => {
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

      return categoryMap;
    };

    loadCategories().then(() => {
      setIsLoading(false);
    });
  }, [auth, baseUrl]);

  const dataContext: DataContext = {
    info(): Promise<string> {
      return Promise.resolve("");
    },
    async getArtwork(id: string): Promise<Artwork> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork>>(`${baseUrl}/wp-json/wc/v3/products/${id}`);
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
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products`);

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
    async listArtistsForGallery(galleryId: string): Promise<Artist[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artist[]>>(
        `${baseUrl}/wp-json/wp/v2/artist?vendor=${galleryId}`,
      );
      return resp.data;
    },
    async getArtist(artistId: string): Promise<Artist> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artist>>(
        `${baseUrl}/wp-json/wp/v2/artist/${artistId}`,
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
  };

  return <Context.Provider value={dataContext}>{isLoading ? <></> : children}</Context.Provider>;
};

export const useData = () => useContext(Context);

export default DataProvider;
