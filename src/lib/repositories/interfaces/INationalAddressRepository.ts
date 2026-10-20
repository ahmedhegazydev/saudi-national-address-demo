import type {
  AddressListResponse,
  Language,
  RegionsResponse,
  VerifyParams,
  VerifyResponse,
} from '../../API';

export interface INationalAddressRepository {
  geocode(latitude: number, longitude: number, language: Language): Promise<AddressListResponse>;
  freeTextSearch(query: string, page: number, language: Language): Promise<AddressListResponse>;
  verify(params: VerifyParams, language: Language): Promise<VerifyResponse>;
  regions(language: Language): Promise<RegionsResponse>;
}
