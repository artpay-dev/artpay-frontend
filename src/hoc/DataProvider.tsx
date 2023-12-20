import React, { createContext, useContext, useEffect, useState } from "react";
import { Gallery } from "../types/gallery.ts";
import axios, { AxiosResponse } from "axios";
import { SignInFormData } from "../components/SignInForm.tsx";
import { Artwork } from "../types/artwork.ts";
import { Artist } from "../types/artist.ts";

export interface DataContext {
  info(): Promise<string>;
  listGalleries(): Promise<Gallery[]>;
  getGallery(id: string): Promise<Gallery>;
  getGalleryBySlug(slug: string): Promise<Gallery>;
  getArtwork(id: string): Promise<Artwork>;
  getArtworkBySlug(slug: string): Promise<Artwork>;
  listArtworksForArtist(galleryId: string): Promise<Artwork[]>;
  listArtworksForGallery(galleryId: string): Promise<Artwork[]>;
  listArtistsForGallery(galleryId: string): Promise<Artist[]>;
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
  listArtworksForArtist: () => Promise.reject("Data provider loaded"),
  listArtworksForGallery: () => Promise.reject("Data provider loaded"),
  listArtistsForGallery: () => Promise.reject("Data provider loaded"),
};

const Context = createContext<DataContext>({ ...defaultContext });

export const DataProvider: React.FC<DataProviderProps> = ({ children, baseUrl }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

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
        `${baseUrl}/wp-json/mvx/v1/vendors?slug=${slug}`,
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
    async listArtworksForGallery(galleryId: string): Promise<Artwork[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(
        `${baseUrl}/wp-json/wc/v3/products?vendor_id=${galleryId}`,
      );

      return resp.data;
    },
    async listArtworksForArtist(artistId: string): Promise<Artwork[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(`${baseUrl}/wp-json/wc/v3/products`);
      return resp.data;
    },
    async listArtistsForGallery(galleryId: string): Promise<Artist[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artist[]>>(
        `${baseUrl}/wp-json/wp/v2/artist?vendor=${galleryId}`,
      );
      return resp.data;
    },
  };

  return <Context.Provider value={dataContext}>{isLoading ? <></> : children}</Context.Provider>;
};

export const useData = () => useContext(Context);

export default DataProvider;
