export interface ImageUploadResponse {
  path?: string;
  filePath?: string;
  fileName?: string;
  url?: string;
  result?: {
    path?: string;
    filePath?: string;
    fileName?: string;
    url?: string;
  };
}

export interface ImageUploadOptions {
  folder?: string;
}
