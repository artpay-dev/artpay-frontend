import React, { createContext, useContext, useEffect, useState } from "react";
import { Gallery } from "../types/gallery.ts";
import axios, { AxiosResponse } from "axios";
import { SignInFormData } from "../components/SignInForm.tsx";
import { Artwork } from "../types/artwork.ts";

export interface DataContext {
  info(): Promise<string>;
  listGalleries(): Promise<Gallery[]>;
  getGallery(id: string): Promise<Gallery>;
  getArtwork(id: string): Promise<Artwork>;
  listArtworksForArtist(galleryId: string): Promise<Artwork[]>;
  listArtworksForGallery(galleryId: string): Promise<Artwork[]>;
}

export interface DataProviderProps extends React.PropsWithChildren {
  baseUrl: string;
}

const defaultContext: DataContext = {
  info: () => Promise.reject("Data provider loaded"),
  listGalleries: () => Promise.reject("Data provider loaded"),
  getGallery: () => Promise.reject("Data provider loaded"),
  getArtwork: () => Promise.reject("Data provider loaded"),
  listArtworksForArtist: () => Promise.reject("Data provider loaded"),
  listArtworksForGallery: () => Promise.reject("Data provider loaded"),
};

const Context = createContext<DataContext>({ ...defaultContext });

export const DataProvider: React.FC<DataProviderProps> = ({
  children,
  baseUrl,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const dataContext: DataContext = {
    info(): Promise<string> {
      return Promise.resolve("");
    },
    async getArtwork(id: string): Promise<Artwork> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork>>(
        `${baseUrl}/wp-json/wc/v3/products/${id}`,
      );
      return resp.data;
    },
    async getGallery(id: string): Promise<Gallery> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Gallery>>(
        `${baseUrl}/wp-json/wc/v3/customers/${id}`,
      );
      return resp.data;
    },
    async listGalleries(): Promise<Gallery[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Gallery[]>>(
        `${baseUrl}/wp-json/wc/v3/customers?role=dc_vendor`,
      );
      return resp.data;
    },
    async listArtworksForGallery(galleryId: string): Promise<Artwork[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(
        `${baseUrl}/wp-json/wc/v3/products?vendor_id=${galleryId}`,
      );

      return resp.data;
    },
    async listArtworksForArtist(artistId: string): Promise<Artwork[]> {
      const resp = await axios.get<SignInFormData, AxiosResponse<Artwork[]>>(
        `${baseUrl}/wp-json/wc/v3/products`,
      );

      return resp.data;
    },
  };

  return (
    <Context.Provider value={dataContext}>
      {isLoading ? <></> : children}
    </Context.Provider>
  );
};

export const useData = () => useContext(Context);

export default DataProvider;
