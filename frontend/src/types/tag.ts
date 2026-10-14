export interface TagRequest {
  name: string;
  colorHex?: string;
}

export interface TagResponse {
  id: string;
  name: string;
  colorHex: string;
}
