export const API_URL = "https://snapdeal-backend-fc9u.onrender.com";

export function getFullApiPath(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export function getUploadFileUrl(fileName) {
  return fileName ? `${API_URL}/uploads/${fileName}` : '';
}
