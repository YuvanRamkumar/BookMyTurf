"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LocationMode = 'GPS' | 'AREA';

interface LocationState {
    mode: LocationMode;
    coordinates: { lat: number; lng: number } | null;
    area: string;
    city: string;
}

interface LocationContextType {
    locationState: LocationState;
    setLocationMode: (mode: LocationMode) => void;
    setCoordinates: (lat: number, lng: number) => void;
    setAreaDetails: (area: string, city: string) => void;
    isLoading: boolean;
}

const defaultState: LocationState = {
    mode: 'AREA',
    coordinates: null,
    area: 'Coimbatore', // Fallback defaults
    city: 'Coimbatore',
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [locationState, setLocationState] = useState<LocationState>(defaultState);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('bookmyturf_location');
        if (stored) {
            try {
                setLocationState(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse stored location");
            }
        }
        setIsLoading(false);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('bookmyturf_location', JSON.stringify(locationState));
        }
    }, [locationState, isLoading]);

    const setLocationMode = (mode: LocationMode) => {
        setLocationState(prev => ({ ...prev, mode }));
    };

    const setCoordinates = (lat: number, lng: number) => {
        setLocationState(prev => ({ ...prev, coordinates: { lat, lng } }));
    };

    const setAreaDetails = (area: string, city: string) => {
        setLocationState(prev => ({ ...prev, area, city }));
    };

    return (
        <LocationContext.Provider value={{
            locationState,
            setLocationMode,
            setCoordinates,
            setAreaDetails,
            isLoading,
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
