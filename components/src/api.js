export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function getFullApiPath(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export function getUploadFileUrl(fileName) {
  return fileName ? `${API_URL}/uploads/${fileName}` : '';
}
