import axios from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (
  method,
  url,
  bodyData,
  headers,
  params
) => {
  return axiosInstance({
    method: method,
    url: url,
    data: bodyData,
    headers: headers,
    params: params,
    withCredentials: true, // Required for the browser to send/receive cookies cross-origin
  });
};