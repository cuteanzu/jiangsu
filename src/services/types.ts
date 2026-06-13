export interface ApiResult<T> {
  code: number;
  message?: string;
  data: T;
}

export interface AuthResponse {
  userId: number;
  username: string;
  nickname: string;
  role: string;
  token?: string | null;
  refreshToken?: string | null;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  code?: string;
}

export interface SendCodePayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface UpdateProfilePayload {
  nickname?: string;
  avatar?: string;
}

export interface SubmissionDTO {
  id: number;
  userId: number;
  schoolId?: number | null;
  schoolName?: string | null;
  title?: string | null;
  content: string;
  type?: string | null;
  category?: string | null;
  isAnonymous?: number | boolean | null;
  contact?: string | null;
  status: string;
  rejectReason?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubmissionPayload {
  schoolId?: number | null;
  schoolName?: string;
  title?: string;
  content: string;
  type: string;
  isAnonymous?: boolean;
  contact?: string;
}

export interface CityProfileDTO {
  id: number;
  name: string;
  schoolCount: number;
  tags: string[];
  cost: string;
  transit: string;
  jobs: string;
  audience: string;
}

export interface UniversityDTO {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  tier: string;
  founded?: number;
  website?: string;
}

export interface SchoolDTO {
  id: number;
  name: string;
  cityId: number;
  cityName: string;
  type: string;
  level: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  website?: string | null;
  address?: string | null;
  brief?: string | null;
  hotScore: number;
  favoriteCount: number;
  mapX?: number | null;
  mapY?: number | null;
  isFavorited?: boolean;
}

export interface LifeInfoDTO {
  dormScore?: number;
  dormDesc?: string;
  canteenScore?: number;
  canteenDesc?: string;
  studyScore?: number;
  studyDesc?: string;
  transportScore?: number;
  transportDesc?: string;
  surroundingScore?: number;
  surroundingDesc?: string;
  tips?: string;
  sourceType?: string;
}

export interface SchoolDetailDTO {
  basic: SchoolDTO;
  lifeInfo?: LifeInfoDTO;
  commentCount: number;
  isFavorited: boolean;
}

export interface ExperienceDTO {
  id: string;
  category: string;
  schoolId: string;
  schoolName: string;
  city: string;
  title: string;
  excerpt: string;
  body: string;
  likes: number;
  comments: number;
  tags: string[];
}

export interface QADTO {
  id: string;
  question: string;
  answer: string;
  schoolId?: string;
  schoolName?: string;
  category: string;
  likes: number;
}

export interface SchoolSearchParams {
  [key: string]: string | number | boolean | null | undefined;
  keyword?: string;
  city?: number;
  level?: string;
  type?: string;
  page?: number;
  size?: number;
}
