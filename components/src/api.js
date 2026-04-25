const RAW_API_URL = import.meta.env.VITE_API_URL || "";
export const API_URL = RAW_API_URL.trim().replace(/\/+$/, "");

export function getFullApiPath(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

export function getUploadFileUrl(fileName) {
  if (!fileName) return '';

  if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
    const uploadsPathMatch = fileName.match(/\/uploads\/[^?#]+/);
    if (uploadsPathMatch) {
      const normalizedPath = uploadsPathMatch[0];
      return API_URL ? `${API_URL}${normalizedPath}` : normalizedPath;
    }
    return fileName;
  }

  const normalizedPath = fileName.startsWith("/uploads/")
    ? fileName
    : `/uploads/${fileName.replace(/^\/+/, "")}`;

  return API_URL ? `${API_URL}${normalizedPath}` : normalizedPath;
}
