import axios, { AxiosInstance } from 'axios';

import type {
  AddressListResponse,
  Language,
  RegionsResponse,
  VerifyParams,
  VerifyResponse,
} from '../API';
import { API_KEY, BASE_URL, REQUEST_TIMEOUT_MS } from '../config';
import type { INationalAddressRepository } from './interfaces/INationalAddressRepository';

type QueryParams = Record<string, string | number>;

export class NationalAddressRepository implements INationalAddressRepository {
  private http: AxiosInstance;

  constructor(apiKey: string = API_KEY) {
    this.http = axios.create({
      baseURL: BASE_URL,
      timeout: REQUEST_TIMEOUT_MS,
      // Params every endpoint accepts. Without encode=utf8 the API answers in
      // windows-1256 and Arabic text comes back garbled.
      params: { format: 'JSON', encode: 'utf8', api_key: apiKey },
    });
  }

  private async get<T>(path: string, language: Language, params: QueryParams = {}): Promise<T> {
    const response = await this.http.get<T>(path, { params: { ...params, language } });
    return response.data;
  }

  geocode(latitude: number, longitude: number, language: Language) {
    return this.get<AddressListResponse>('/address/address-geocode', language, {
      lat: latitude,
      long: longitude,
    });
  }

  freeTextSearch(query: string, page: number, language: Language) {
    return this.get<AddressListResponse>('/address/address-free-text', language, {
      addressstring: query,
      page,
    });
  }

  verify({ buildingNumber, zipCode, additionalNumber }: VerifyParams, language: Language) {
    return this.get<VerifyResponse>('/address/address-verify', language, {
      Buildingnumber: buildingNumber,
      Zipcode: zipCode,
      Additionalnumber: additionalNumber,
    });
  }

  regions(language: Language) {
    return this.get<RegionsResponse>('/lookup/regions', language);
  }
}
