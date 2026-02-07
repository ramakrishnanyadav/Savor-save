/**
 * Google Places API Integration
 * For real nearby restaurants using Google Maps
 */

interface PlaceResult {
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  rating?: number;
  price_level?: number;
  photos?: any[];
  place_id: string;
  opening_hours?: {
    open_now?: boolean;
  };
}

export interface NearbyRestaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating: number;
  priceLevel: number;
  isOpen: boolean;
  photoUrl?: string;
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate delivery time based on distance
export function estimateDeliveryTime(distance: number): number {
  const avgSpeed = 30; // km/h
  const preparationTime = 15; // minutes
  const travelTime = (distance / avgSpeed) * 60;
  const bufferTime = 5;
  return Math.round(preparationTime + travelTime + bufferTime);
}

/**
 * Find nearby restaurants using Google Places API
 * NOTE: This requires a Google Maps API key
 */
export async function findNearbyRestaurantsGoogle(
  latitude: number,
  longitude: number,
  radius: number = 5000 // in meters
): Promise<NearbyRestaurant[]> {
  // Check if Google Maps is loaded
  if (typeof window === 'undefined' || !(window as any).google) {
    console.warn('Google Maps not loaded. Please add API key.');
    return [];
  }

  return new Promise((resolve, reject) => {
    const map = new (window as any).google.maps.Map(document.createElement('div'));
    const service = new (window as any).google.maps.places.PlacesService(map);

    const request = {
      location: new (window as any).google.maps.LatLng(latitude, longitude),
      radius: radius,
      type: 'restaurant',
      keyword: 'food restaurant',
    };

    service.nearbySearch(request, (results: PlaceResult[], status: string) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK) {
        const restaurants = results.map((place) => {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const distance = calculateDistance(latitude, longitude, lat, lng);

          return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity,
            latitude: lat,
            longitude: lng,
            distance: parseFloat(distance.toFixed(2)),
            rating: place.rating || 4.0,
            priceLevel: place.price_level || 2,
            isOpen: place.opening_hours?.open_now ?? true,
            photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400 }),
          };
        });

        resolve(restaurants.sort((a, b) => a.distance - b.distance));
      } else {
        reject(new Error(`Places API error: ${status}`));
      }
    });
  });
}

/**
 * Load Google Maps script dynamically
 */
export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    
    document.head.appendChild(script);
  });
}

/**
 * Fallback: Use OpenStreetMap Nominatim for nearby places
 * Free alternative to Google Places API
 */
export async function findNearbyRestaurantsOSM(
  latitude: number,
  longitude: number,
  radius: number = 5 // in km
): Promise<NearbyRestaurant[]> {
  try {
    // Overpass API query for restaurants
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="restaurant"](around:${radius * 1000},${latitude},${longitude});
        way["amenity"="restaurant"](around:${radius * 1000},${latitude},${longitude});
      );
      out body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    const data = await response.json();

    const restaurants = data.elements
      .filter((element: any) => element.tags?.name)
      .map((element: any) => {
        const lat = element.lat || element.center?.lat;
        const lon = element.lon || element.center?.lon;
        const distance = calculateDistance(latitude, longitude, lat, lon);

        return {
          id: element.id.toString(),
          name: element.tags.name,
          address: element.tags['addr:street'] 
            ? `${element.tags['addr:street']}, ${element.tags['addr:city'] || ''}`
            : 'Address not available',
          latitude: lat,
          longitude: lon,
          distance: parseFloat(distance.toFixed(2)),
          rating: 4.0 + Math.random() * 0.5, // Mock rating
          priceLevel: 2,
          isOpen: true,
          photoUrl: undefined,
        };
      })
      .sort((a: NearbyRestaurant, b: NearbyRestaurant) => a.distance - b.distance);

    return restaurants;
  } catch (error) {
    console.error('Error fetching restaurants from OSM:', error);
    return [];
  }
}
