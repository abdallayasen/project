// ImageContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface ImageContextType {
  orderImages: { [key: string]: string[] };
  addImage: (orderId: string, imageUri: string) => void;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orderImages, setOrderImages] = useState<{ [key: string]: string[] }>({});

  const addImage = (orderId: string, imageUri: string) => {
    setOrderImages(prev => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), imageUri],
    }));
  };

  return (
    <ImageContext.Provider value={{ orderImages, addImage }}>
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImageContext must be used within an ImageProvider');
  }
  return context;
};
