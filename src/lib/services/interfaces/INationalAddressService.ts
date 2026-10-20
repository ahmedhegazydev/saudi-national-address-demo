import type {
  Language,
  RawRegion,
  ReverseGeocodeResult,
  SearchResult,
  VerifyParams,
} from '../../API';

export interface INationalAddressService {
  reverseGeocode(latitude: number, longitude: number, language: Language): Promise<ReverseGeocodeResult>;
  search(query: string, language: Language, page?: number): Promise<SearchResult>;
  verify(params: VerifyParams, language: Language): Promise<boolean>;
  regions(language: Language): Promise<RawRegion[]>;
}
