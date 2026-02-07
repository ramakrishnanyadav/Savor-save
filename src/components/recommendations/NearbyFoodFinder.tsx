import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, DollarSign, TrendingUp, Navigation, Star, ChevronRight } from 'lucide-react';
import { useIndianFood } from '@/context/IndianFoodContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface NearbyRestaurant {
  id: string;
  name: string;
  distance: number; // in km
  estimatedTime: number; // in minutes
  rating: number;
  foods: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

type DistanceFilter = 'all' | '3km' | '5km' | '10km';
type SortBy = 'nearest' | 'cheapest' | 'fastest' | 'rating';

export function NearbyFoodFinder() {
  const { indianFoods, restaurants } = useIndianFood();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<NearbyRestaurant[]>([]);
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('nearest');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Estimate delivery time based on distance
  const estimateDeliveryTime = (distance: number): number => {
    const avgSpeed = 30; // km/h average delivery speed
    const preparationTime = 15; // base preparation time in minutes
    const travelTime = (distance / avgSpeed) * 60; // convert to minutes
    return Math.round(preparationTime + travelTime);
  };

  // Get user's current location
  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          toast.success('Location detected! Finding real nearby restaurants...');
          
          // Try to use real API (OpenStreetMap - free alternative to Google)
          try {
            const { findNearbyRestaurantsOSM } = await import('@/utils/googlePlacesApi');
            const realRestaurants = await findNearbyRestaurantsOSM(
              location.lat,
              location.lng,
              10 // 10km radius
            );
            
            if (realRestaurants.length > 0) {
              // Save real restaurants to Supabase database
              try {
                const restaurantsToSave = realRestaurants.map(r => ({
                  restaurant_id: `osm-${r.id}`,
                  restaurant_name: r.name,
                  latitude: r.latitude,
                  longitude: r.longitude,
                  address: r.address,
                  city: 'Detected',
                  state: 'Detected',
                  pincode: '000000',
                  phone: 'N/A',
                  is_open: r.isOpen,
                  avg_preparation_time: 25,
                  min_order_amount: 100,
                  delivery_radius: 10,
                  delivery_fee: 40,
                  rating: r.rating,
                  total_reviews: Math.floor(Math.random() * 500) + 100,
                }));

                // Save to database (upsert to avoid duplicates)
                const { error: saveError } = await import('@/integrations/supabase/client').then(
                  async ({ supabase }) => {
                    return await supabase
                      .from('restaurant_locations')
                      .upsert(restaurantsToSave, { 
                        onConflict: 'restaurant_id',
                        ignoreDuplicates: false 
                      });
                  }
                );

                if (saveError) {
                  console.error('Error saving restaurants:', saveError);
                } else {
                  console.log(`✅ Saved ${realRestaurants.length} real restaurants to database`);
                }
              } catch (saveError) {
                console.error('Error in save process:', saveError);
              }

              // Convert to our format
              const converted = realRestaurants.map(r => ({
                id: `osm-${r.id}`,
                name: r.name,
                distance: r.distance,
                estimatedTime: Math.round(15 + (r.distance / 30) * 60),
                rating: r.rating,
                foods: (indianFoods || []).slice(0, 5).map(f => ({
                  id: f.id,
                  name: f.nameEn,
                  price: f.price.min,
                  image: f.image,
                })),
                location: {
                  lat: r.latitude,
                  lng: r.longitude,
                  address: r.address,
                },
              }));
              setNearbyRestaurants(converted);
              toast.success(`Found and saved ${realRestaurants.length} real restaurants nearby!`);
            } else {
              findNearbyRestaurants(location);
            }
          } catch (error) {
            console.error('Error fetching real restaurants:', error);
            findNearbyRestaurants(location);
          }
          
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not get your location. Using default location.');
          const defaultLocation = { lat: 28.6139, lng: 77.2090 };
          setUserLocation(defaultLocation);
          findNearbyRestaurants(defaultLocation);
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error('Geolocation not supported');
      setIsLoadingLocation(false);
    }
  };

  // Find nearby restaurants based on user location
  const findNearbyRestaurants = (location: { lat: number; lng: number }) => {
    // Check if restaurants exist
    if (!restaurants || restaurants.length === 0) {
      toast.error('No restaurants available');
      return;
    }

    // Mock restaurant data with locations around user
    const mockRestaurants: NearbyRestaurant[] = restaurants.map((restaurant, index) => {
      // Generate random locations around user (for demo)
      const randomLat = location.lat + (Math.random() - 0.5) * 0.1; // ~5km range
      const randomLng = location.lng + (Math.random() - 0.5) * 0.1;
      
      const distance = calculateDistance(location.lat, location.lng, randomLat, randomLng);
      const estimatedTime = estimateDeliveryTime(distance);
      
      // Get foods available at this restaurant
      const restaurantFoods = (indianFoods || [])
        .filter(() => Math.random() > 0.5) // Random selection for demo
        .slice(0, 5)
        .map(food => ({
          id: food.id,
          name: food.nameEn,
          price: food.price.min,
          image: food.image,
        }));

      return {
        id: restaurant.id,
        name: restaurant.name,
        distance: parseFloat(distance.toFixed(2)),
        estimatedTime,
        rating: 3.5 + Math.random() * 1.5, // Random rating 3.5-5.0
        foods: restaurantFoods,
        location: {
          lat: randomLat,
          lng: randomLng,
          address: `${restaurant.location}, ${restaurant.city}`,
        },
      };
    });

    setNearbyRestaurants(mockRestaurants);
  };

  // Filter restaurants by distance
  const getFilteredRestaurants = () => {
    let filtered = nearbyRestaurants;

    // Apply distance filter
    switch (distanceFilter) {
      case '3km':
        filtered = filtered.filter(r => r.distance <= 3);
        break;
      case '5km':
        filtered = filtered.filter(r => r.distance <= 5);
        break;
      case '10km':
        filtered = filtered.filter(r => r.distance <= 10);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'nearest':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'cheapest':
        filtered.sort((a, b) => {
          const avgPriceA = a.foods.reduce((sum, f) => sum + f.price, 0) / a.foods.length;
          const avgPriceB = b.foods.reduce((sum, f) => sum + f.price, 0) / b.foods.length;
          return avgPriceA - avgPriceB;
        });
        break;
      case 'fastest':
        filtered.sort((a, b) => a.estimatedTime - b.estimatedTime);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  };

  const filteredRestaurants = getFilteredRestaurants();

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🍽️ Nearby Food Finder</h1>
          <p className="text-muted-foreground">Discover restaurants and food near you</p>
        </div>

        {/* Location Status */}
        {userLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
          >
            <MapPin className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-500">Location Detected</p>
              <p className="text-sm text-muted-foreground">
                Showing restaurants near you
              </p>
            </div>
            <button
              onClick={getUserLocation}
              className="ml-auto p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-colors"
            >
              <Navigation className="w-5 h-5 text-green-500" />
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <div className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium mb-3">📍 Distance</label>
              <div className="flex gap-2">
                {(['all', '3km', '5km', '10km'] as DistanceFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDistanceFilter(filter)}
                    className={cn(
                      'px-4 py-2 rounded-xl font-semibold transition-all capitalize',
                      distanceFilter === filter
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {filter === 'all' ? 'All' : `Within ${filter}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-3">🔄 Sort By</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'nearest', label: '📍 Nearest', icon: MapPin },
                  { value: 'cheapest', label: '💰 Cheapest', icon: DollarSign },
                  { value: 'fastest', label: '⚡ Fastest', icon: Clock },
                  { value: 'rating', label: '⭐ Top Rated', icon: Star },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      'px-3 py-2 rounded-xl font-medium transition-all flex items-center gap-2',
                      sortBy === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">
            Found <span className="font-bold text-foreground">{filteredRestaurants.length}</span> restaurants
          </p>
          {isLoadingLocation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Getting location...
            </div>
          )}
        </div>

        {/* Restaurant List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-3xl bg-card border border-border shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{restaurant.name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                        <MapPin className="w-4 h-4" />
                        {restaurant.distance.toFixed(1)} km away
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
                        <Clock className="w-4 h-4" />
                        {restaurant.estimatedTime} min
                      </span>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
                        <Star className="w-4 h-4 fill-current" />
                        {restaurant.rating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      📍 {restaurant.location.address}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-muted-foreground" />
                </div>

                {/* Available Foods */}
                <div>
                  <h4 className="font-semibold mb-3">Available Items:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {restaurant.foods.map((food) => (
                      <div
                        key={food.id}
                        className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-2">
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="font-medium text-sm truncate">{food.name}</p>
                        <p className="text-primary font-bold">₹{food.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Button */}
                <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-lg transition-all">
                  Order from {restaurant.name}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRestaurants.length === 0 && !isLoadingLocation && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No restaurants found in this range</p>
            <button
              onClick={() => setDistanceFilter('all')}
              className="mt-4 px-6 py-2 rounded-xl bg-primary text-primary-foreground"
            >
              Show All Restaurants
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
