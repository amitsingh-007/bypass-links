export const encodeText = (value: string) => btoa(encodeURIComponent(value));

export const decodeText = (value: string) => decodeURIComponent(atob(value));
