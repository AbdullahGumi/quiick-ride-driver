import apiService from "../client/apiService";

export interface UpdateStatusData {
  isOnline: boolean;
}

export interface UpdateLocationData {
  coordinates: [number, number];
}

export interface AddVehicleData {
  plateNumber: string;
  vehicleNumber: string;
}

export interface UpdateRideStatusData {
  status: string;
}

export interface UpdateRideLocationData {
  coordinates: [number, number];
}

export interface AddDocumentData {
  type: string;
  fileUrl: string;
}

export interface RequestPayoutData {
  amount: number;
  bankDetails: {
    accountNumber: string;
    bankCode: string;
    accountName: string;
  };
}

export interface RateRiderData {
  rating: number;
  review?: string;
}

export const driverApi = {
  updateStatus: async (data: UpdateStatusData) => {
    return await apiService.put(`/driver/status`, data);
  },

  updateLocation: async (data: UpdateLocationData) => {
    return await apiService.post(`/driver/location`, data);
  },

  addVehicle: async (data: AddVehicleData) => {
    return await apiService.post(`/driver/vehicle`, data);
  },

  acceptRide: async (rideId: string) => {
    return await apiService.post(`/driver/ride/${rideId}/accept`, {});
  },

  updateRideStatus: async (rideId: string, data: UpdateRideStatusData) => {
    return await apiService.post(`/driver/ride/${rideId}/update-status`, data);
  },

  updateRideLocation: async (rideId: string, data: UpdateRideLocationData) => {
    return await apiService.post(`/driver/ride/${rideId}/update-location`, data);
  },

  getHistory: async () => {
    return await apiService.get(`/driver/history`);
  },

  getProfile: async () => {
    return await apiService.get(`/driver/profile`);
  },

  addDocument: async (data: AddDocumentData) => {
    return await apiService.post(`/driver/document`, data);
  },

  getEarnings: async () => {
    return await apiService.get(`/driver/earnings`);
  },

  requestPayout: async (data: RequestPayoutData) => {
    return await apiService.post(`/driver/payout`, data);
  },

  rateRider: async (rideId: string, data: RateRiderData) => {
    return await apiService.post(`/driver/ride/${rideId}/rate`, data);
  },
};