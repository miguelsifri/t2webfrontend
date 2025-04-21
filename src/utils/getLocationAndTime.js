export async function getLocationAndTime() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        const timestamp = new Date().toISOString();
        resolve({ location, timestamp });
      },
      (error) => {
        console.error("Error getting location", error);
        resolve({ location: null, timestamp: new Date().toISOString() });
      }
    );
  });
}
