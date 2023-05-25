import { AxiosInstance } from 'axios';

type RetryOptions = {
  isRetryable?: (error: any) => boolean;
  wait?: (error: any) => Promise<void>;
  retry?: (axios: AxiosInstance, error: any) => Promise<any>;
};

export default function (axios: AxiosInstance, options?: RetryOptions): (error: any) => Promise<any>;
