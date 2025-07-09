export const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  return `${dateString}T00:00:00+07:00`;
};

export const formatEndDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  return `${dateString}T23:59:59+07:00`;
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
}; 