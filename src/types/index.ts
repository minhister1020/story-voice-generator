export interface Voice {
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface GenerateVoiceRequest {
  text: string;
  voice_id: string;
}

export interface GenerateVoiceResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export interface VoicesApiResponse {
  success: boolean;
  voices?: Voice[];
  error?: string;
}
