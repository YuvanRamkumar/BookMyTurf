"use client";

import { useState, useCallback } from "react";

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    loading: boolean;
    error: string | null;
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        loading: false,
        error: null,
    });

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: "Geolocation is not supported by your browser",
            }));
            return;
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    loading: false,
                    error: null,
                });
            },
            (err) => {
                let errorMessage = "Unable to retrieve your location";
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage =
                            "Location access denied. Please enable location in your browser settings.";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage =
                            "Location information is unavailable. Try again later.";
                        break;
                    case err.TIMEOUT:
                        errorMessage =
                            "Location request timed out. Please try again.";
                        break;
                }
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: errorMessage,
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    }, []);

    const clearLocation = useCallback(() => {
        setState({
            latitude: null,
            longitude: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        requestLocation,
        clearLocation,
    };
}
