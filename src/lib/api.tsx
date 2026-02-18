import axios from "axios";

// Must match auth slice storage key (redux/slices/authSlices.ts uses "user")
const AUTH_STORAGE_KEY = "user";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "https://irisinformatics.net/dating";

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const { token } = JSON.parse(stored);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      } catch (_) {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          window.location.href = "/signin";
        }
      }

      if (status === 403) {
        // Access denied – handle if needed (e.g. toast)
      }
    }

    return Promise.reject(error);
  }
);

/** Login API: POST /Wb/login with form-data (email, password) */
export interface LoginResponse {
  success?: boolean;
  token?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    token?: string;
    [key: string]: unknown;
  };
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export interface NormalizedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export async function loginApi(
  email: string,
  password: string
): Promise<NormalizedUser> {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  const { data } = await axios.post<LoginResponse>(
    `${baseURL}/Wb/login`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 10000,
      validateStatus: (s) => s >= 200 && s < 300, // only 2xx resolve; 4xx/5xx throw
    }
  ).catch((err) => {
    const res = err.response;
    const body = res?.data;
    const msg =
      (body && typeof body === "object" && typeof body.message === "string" && body.message) ||
      (body && typeof body === "object" && typeof body.error === "string" && body.error) ||
      (res?.status === 401 && "Invalid email or password.") ||
      (res?.status && `Request failed (${res.status})`) ||
      err.message ||
      "Login failed.";
    throw new Error(msg);
  });

  // API returned 200 but indicates failure in body (e.g. success: false)
  if (data && typeof data === "object" && data.success === false) {
    const msg =
      (typeof data.message === "string" && data.message) ||
      (typeof data.error === "string" && data.error) ||
      "Invalid credentials.";
    throw new Error(msg);
  }

  const token =
    typeof data?.token === "string"
      ? data.token
      : (data?.user as { token?: string } | undefined)?.token ?? "";
  const user = data?.user as LoginResponse["user"] | undefined;

  // Require at least token or user id from server – don't save form input as "user"
  const hasServerUser = token || (user && (user.id != null || user.email != null));
  if (!hasServerUser) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Invalid response from server. Please try again."
    );
  }

  return {
    id: String(user?.id ?? ""),
    name: String(user?.name ?? user?.email ?? email),
    email: String(user?.email ?? email),
    role: String(user?.role ?? "user"),
    token,
  };
}

/** Get all users API: GET /Wb/get_all_users */
export interface ApiUser {
  id: string;
  name: string | null;
  email: string;
  current_pic: string | null;
  adhar: string | null;
  /** "0" | "1" or 0 | 1 – 0 = document not uploaded, 1 = uploaded */
  is_verified: string | number;
  is_email_verified: string;
  is_approved: string;
  rejection_reason: string | null;
  created_at: string;
}

export interface GetAllUsersResponse {
  status: number;
  message: string;
  data: ApiUser[];
}

export async function getAllUsersApi(): Promise<ApiUser[]> {
  const { data } = await api.get<GetAllUsersResponse>("/Wb/get_all_users");
  if (!Array.isArray(data?.data)) {
    throw new Error(data?.message ?? "Failed to fetch users.");
  }
  return data.data;
}

/** View profile API: POST /Wb/view_profile with form-data user_id */
export interface UserAdharItem {
  id: string;
  user_id: string;
  adhar: string;
  created_at: string;
}

export interface UserProfileData {
  id: string;
  role: string;
  name: string | null;
  email: string;
  password?: string;
  wallet_balance?: string;
  is_verified: string | number;
  is_email_verified: string;
  adhar: string | null;
  current_pic: string | null;
  is_approved: string;
  rejection_reason: string | null;
  token?: string;
  created_at: string;
  updated_at: string;
  user_adhar?: UserAdharItem[];
}

export interface ViewProfileResponse {
  status: number;
  message: string;
  data: UserProfileData;
}

export async function getUserProfileApi(userId: string): Promise<UserProfileData> {
  const formData = new FormData();
  formData.append("user_id", userId);
  const { data } = await api.post<ViewProfileResponse>("/Wb/view_profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!data?.data) {
    throw new Error(data?.message ?? "Failed to fetch profile.");
  }
  return data.data;
}

/** Approve/reject user: POST /Wb/approve_user – status: 0=pending, 1=approved, 2=rejected */
export interface ApproveUserResponse {
  status: number;
  message: string;
  data?: unknown;
}

export async function approveUserApi(
  userId: string,
  status: "0" | "1" | "2",
  reason: string
): Promise<ApproveUserResponse> {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("status", status);
  formData.append("reason", reason || "NA");
  const { data } = await api.post<ApproveUserResponse>("/Wb/approve_user", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Add/update wallet balance: POST /Wb/add_wallet_balance with form-data user_id, wallet_balance */
export interface AddWalletBalanceResponse {
  status: number;
  message: string;
  data?: unknown;
}

export async function addWalletBalanceApi(
  userId: string,
  walletBalance: string | number
): Promise<AddWalletBalanceResponse> {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("wallet_balance", String(walletBalance));
  const { data } = await api.post<AddWalletBalanceResponse>("/Wb/add_wallet_balance", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Get all ads API: POST /Wb/get_allads */
export interface AdService {
  id: string;
  ads_id: string;
  title: string;
  created_at: string;
}

export interface AdTimeSlot {
  id: string;
  ads_id: string;
  from_time: string;
  to_time: string;
  created_at: string;
}

export interface AdImage {
  id: string;
  ads_id: string;
  img: string;
  created_at: string;
}

export interface ApiAd {
  id: string;
  user_id: string;
  name: string;
  email: string;
  gender: string;
  mobile: string;
  state: string;
  city: string;
  description: string;
  is_approved: string;
  rejection_reason: string | null;
  membership: string;
  created_at: string;
  updated_at: string;
  state_name: string | null;
  city_name: string | null;
  services?: AdService[];
  time_slots?: AdTimeSlot[];
  images?: AdImage[];
}

export interface GetAllAdsResponse {
  status: number;
  message: string;
  data: ApiAd[];
}

export async function getAllAdsApi(): Promise<ApiAd[]> {
  const { data } = await api.post<GetAllAdsResponse>("/Wb/get_allads");
  if (!Array.isArray(data?.data)) {
    throw new Error(data?.message ?? "Failed to fetch ads.");
  }
  return data.data;
}

/** Single ad detail: POST /Wb/ads_edit with form-data ads_id */
export interface AdDetailAds {
  id: string;
  user_id: string;
  name: string;
  email: string;
  gender: string;
  mobile: string;
  state: string;
  city: string;
  description: string;
  is_approved: string;
  rejection_reason: string | null;
  membership: string;
  created_at: string;
  updated_at: string;
  state_name?: string | null;
  city_name?: string | null;
}

export interface AdDetailService {
  id: string;
  ads_id: string;
  title: string;
  created_at: string;
}

export interface AdDetailTime {
  id: string;
  ads_id: string;
  from_time: string;
  to_time: string;
  created_at: string;
}

export interface AdDetailImage {
  id: string;
  ads_id: string;
  img: string;
  created_at: string;
}

export interface AdDetailData {
  ads: AdDetailAds;
  services: AdDetailService[];
  time: AdDetailTime[];
  images: AdDetailImage[];
}

export interface GetAdDetailResponse {
  status: number;
  data?: AdDetailData;
  message?: string;
}

export async function getAdDetailApi(adsId: string): Promise<AdDetailData> {
  const formData = new FormData();
  formData.append("ads_id", adsId);
  const { data } = await api.post<GetAdDetailResponse>("/Wb/ads_edit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!data?.data) {
    throw new Error(data?.message ?? "Failed to fetch ad detail.");
  }
  return data.data;
}

/** Approve/reject ad: POST /Wb/approve_ads – status: 0=pending, 1=approved, 2=reject */
export interface ApproveAdsResponse {
  status: number;
  message?: string;
}

export async function approveAdsApi(
  adsId: string,
  status: "0" | "1" | "2",
  reason: string
): Promise<ApproveAdsResponse> {
  const formData = new FormData();
  formData.append("ads_id", adsId);
  formData.append("status", status);
  formData.append("reason", reason || "NA");
  const { data } = await api.post<ApproveAdsResponse>("/Wb/approve_ads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Assign ad membership: POST /Wb/ads_membership – form-data: ads_id, member (Free | Silver | Gold) */
export interface AssignAdsMembershipResponse {
  status: number;
  message?: string;
}

export async function assignAdsMembershipApi(
  adsId: string,
  membership: "Free" | "Silver" | "Gold"
): Promise<AssignAdsMembershipResponse> {
  const formData = new FormData();
  formData.append("ads_id", adsId);
  formData.append("member", membership);
  const { data } = await api.post<AssignAdsMembershipResponse>(
    "/Wb/ads_membership",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/** Get metadata (meta title/description): POST /Wb/metadata */
export interface MetadataItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated: string;
}

export interface GetMetadataResponse {
  status: string | number;
  message: string;
  data: MetadataItem[];
}

export async function getMetadataApi(): Promise<MetadataItem[]> {
  const { data } = await api.post<GetMetadataResponse>("/Wb/metadata");
  const list = data?.data;
  if (!Array.isArray(list)) {
    throw new Error(data?.message ?? "Failed to fetch metadata.");
  }
  return list;
}

/** Add/update metadata: POST /Wb/add_metadata with form-data title, description, meta_id */
export interface AddMetadataResponse {
  status: string | number;
  message: string;
  data?: MetadataItem;
}

export async function addMetadataApi(
  title: string,
  description: string,
  metaId?: string
): Promise<AddMetadataResponse> {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  if (metaId) formData.append("meta_id", metaId);
  const { data } = await api.post<AddMetadataResponse>("/Wb/update_meta", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Get states: POST /Wb/states */
export interface ApiState {
  id: string;
  name: string;
  created_at: string;
}

export interface GetStatesResponse {
  status: string | number;
  message: string;
  data: ApiState[];
}

export async function getStatesApi(): Promise<ApiState[]> {
  const { data } = await api.post<GetStatesResponse>("/Wb/states");
  if (!Array.isArray(data?.data)) {
    throw new Error(data?.message ?? "Failed to fetch states.");
  }
  return data.data;
}

/** Get cities: POST /Wb/cities with form-data state_id (required) */
export interface ApiCity {
  id: string;
  state_id: string;
  name: string;
  description?: string;
  img?: string;
  top_cities?: string | number;
  created_at?: string;
}

export interface GetCitiesResponse {
  status: string | number;
  message: string;
  data: ApiCity[];
}

export async function getCitiesApi(stateId: string): Promise<ApiCity[]> {
  const formData = new FormData();
  formData.append("state_id", stateId);
  const { data } = await api.post<GetCitiesResponse>("/Wb/cities", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (!Array.isArray(data?.data)) {
    throw new Error(data?.message ?? "Failed to fetch cities.");
  }
  return data.data;
}

/** Get states with nested cities: POST /Wb/state_cities – single call for all locations */
export interface StateWithCitiesApiItem {
  id: string;
  name: string;
  img?: string;
  description?: string;
  created_at: string;
  cities: {
    id: string;
    state_id: string;
    name: string;
    description?: string;
    image?: string;
    top_cities?: string | number;
    created_at: string;
  }[];
}

export interface GetStateCitiesResponse {
  status: string | number;
  message: string;
  data: StateWithCitiesApiItem[];
}

export interface StateWithCitiesItem {
  id: string;
  name: string;
  img?: string;
  description?: string;
  cities: ApiCity[];
}

function stateImageUrl(img: string | undefined): string | undefined {
  if (!img?.trim()) return undefined;
  if (img.startsWith("http")) return img;
  const base = baseURL.replace(/\/$/, "");
  return `${base}/uploads/${img.replace(/^\//, "")}`;
}

export async function getStateCitiesApi(): Promise<StateWithCitiesItem[]> {
  const { data } = await api.post<GetStateCitiesResponse>("/Wb/state_cities");
  if (!Array.isArray(data?.data)) {
    throw new Error(data?.message ?? "Failed to fetch locations.");
  }
  return data.data.map((state) => ({
    id: state.id,
    name: state.name,
    img: stateImageUrl(state.img),
    description: state.description ?? undefined,
      cities: (state.cities ?? []).map((c) => ({
        id: c.id,
        state_id: c.state_id,
        name: c.name,
        description: c.description ?? undefined,
        img: c.image?.trim() ? stateImageUrl(c.image) : undefined,
        top_cities: c.top_cities ?? undefined,
        created_at: c.created_at,
      })),
  }));
}

/** Add state: POST /Wb/add_state with form-data name, description, image? */
export interface AddStateResponse {
  status: number;
  message: string;
  data?: ApiState;
}

export async function addStateApi(
  name: string,
  description: string,
  image?: File
): Promise<AddStateResponse> {
  const formData = new FormData();
  formData.append("name", name.trim());
  formData.append("description", description.trim());
  if (image) formData.append("image", image);
  const { data } = await api.post<AddStateResponse>("/Wb/add_state", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Update state: POST /Wb/update_state with form-data state_id, name?, description?, image (file)? */
export interface UpdateStateResponse {
  status: number;
  message: string;
  data?: ApiState & { img?: string; description?: string };
}

export async function updateStateApi(
  stateId: string,
  payload: { name: string; description?: string; image?: File }
): Promise<UpdateStateResponse> {
  const formData = new FormData();
  formData.append("state_id", stateId);
  formData.append("name", payload.name.trim());
  formData.append("description", payload.description ?? "");
  if (payload.image) formData.append("image", payload.image);
  const { data } = await api.post<UpdateStateResponse>("/Wb/update_state", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Add city: POST /Wb/add_city with form-data state_id, name, description, image? */
export interface AddCityResponse {
  status: number;
  message: string;
  data?: { id: number; state_id: string; name: string };
}

export async function addCityApi(
  stateId: string,
  name: string,
  description: string,
  image?: File
): Promise<AddCityResponse> {
  const formData = new FormData();
  formData.append("state_id", stateId);
  formData.append("name", name.trim());
  formData.append("description", description.trim());
  if (image) formData.append("image", image);
  const { data } = await api.post<AddCityResponse>("/Wb/add_city", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Delete state: POST /Wb/delete_state with form-data state_id */
export interface DeleteStateResponse {
  status: number;
  message: string;
}

export async function deleteStateApi(stateId: string): Promise<DeleteStateResponse> {
  const formData = new FormData();
  formData.append("state_id", stateId);
  const { data } = await api.post<DeleteStateResponse>("/Wb/delete_state", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Update city: POST /Wb/update_city with form-data city_id, state_id, name, description?, image (file)?, top_cities? */
export interface UpdateCityResponse {
  status: number;
  message: string;
  data?: ApiCity;
}

export async function updateCityApi(
  cityId: string,
  stateId: string,
  payload: { name: string; description?: string; image?: File; top_cities?: "0" | "1" }
): Promise<UpdateCityResponse> {
  const formData = new FormData();
  formData.append("city_id", cityId);
  formData.append("state_id", stateId);
  formData.append("name", payload.name.trim());
  formData.append("description", payload.description ?? "");
  if (payload.image) formData.append("image", payload.image);
  if (payload.top_cities !== undefined) formData.append("top_cities", payload.top_cities);
  const { data } = await api.post<UpdateCityResponse>("/Wb/update_city", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Delete city: POST /Wb/delete_city with form-data city_id */
export interface DeleteCityResponse {
  status: number;
  message: string;
}

export async function deleteCityApi(cityId: string): Promise<DeleteCityResponse> {
  const formData = new FormData();
  formData.append("city_id", cityId);
  const { data } = await api.post<DeleteCityResponse>("/Wb/delete_city", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Get pricing: GET /Wb/get_pricing */
export interface ApiPricingItem {
  id: string;
  title: string;
  coins: string;
  created_at: string;
  updated_at: string;
}

export interface GetPricingResponse {
  status: number;
  message: string;
  data: ApiPricingItem[];
}

export async function getPricingApi(): Promise<ApiPricingItem[]> {
  const { data } = await api.post<GetPricingResponse>("/Wb/get_pricing");
  if (!Array.isArray(data?.data)) {
    throw new Error(data?.message ?? "Failed to fetch pricing.");
  }
  return data.data;
}

/** Update pricing row: POST /Wb/update_pricing_table – form-data: pricing_id, title, coins */
export interface UpdatePricingResponse {
  status: number;
  message: string;
  data?: unknown;
}

export async function updatePricingApi(
  pricingId: string,
  title: string,
  coins: string
): Promise<UpdatePricingResponse> {
  const formData = new FormData();
  formData.append("pricing_id", pricingId);
  formData.append("title", title.trim());
  formData.append("coins", String(coins).trim());
  const { data } = await api.post<UpdatePricingResponse>(
    "/Wb/update_pricing_table",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/** Admin notifications list: GET /Wb/admin_notifications?page=1 */
export interface ApiNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  total_users: string;
}

export interface GetAdminNotificationsResponse {
  status: number;
  page: number;
  per_page: number;
  total_records: number;
  total_pages: number;
  data: ApiNotificationItem[];
}

export async function getAdminNotificationsApi(
  page: number = 1
): Promise<GetAdminNotificationsResponse> {
  const { data } = await api.get<GetAdminNotificationsResponse>(
    "/Wb/admin_notifications",
    { params: { page } }
  );
  return data;
}

/** Send notification: POST /Wb/send_notification – form-data: title, message, type (all | selected), user_ids[] when type=selected */
export interface SendNotificationResponse {
  status: number;
  message?: string;
}

export async function sendNotificationApi(
  title: string,
  message: string,
  type: "all" | "selected",
  userIds: string[] = []
): Promise<SendNotificationResponse> {
  const formData = new FormData();
  formData.append("title", title.trim());
  formData.append("message", message.trim());
  formData.append("type", type);
  if (type === "selected" && userIds.length > 0) {
    userIds.forEach((id) => formData.append("user_ids[]", String(id).trim()));
  }
  const { data } = await api.post<SendNotificationResponse>(
    "/Wb/send_notification",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

/** Dashboard counts: GET /Wb/dashboard_counts */
export interface DashboardCountsResponse {
  status: number;
  data: {
    total_users: number;
    total_ads: number;
  };
}

export async function getDashboardCountsApi(): Promise<DashboardCountsResponse["data"]> {
  const { data } = await api.get<DashboardCountsResponse>("/Wb/dashboard_counts");
  if (!data?.data) {
    throw new Error("Failed to fetch dashboard counts.");
  }
  return data.data;
}

export default api;
export { AUTH_STORAGE_KEY };
