// Offline stand-in used when no API key is configured, so the demo runs right away.
import type {
  AddressListResponse,
  Language,
  RegionsResponse,
  VerifyParams,
  VerifyResponse,
} from '../API';
import { MOCK_ADDRESSES, MOCK_ENVELOPE, MOCK_REGIONS } from '../mock/fixtures';
import type { INationalAddressRepository } from './interfaces/INationalAddressRepository';

const LATENCY_MS = 400;

const delay = <T>(value: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(value), LATENCY_MS));

// Rough bounding box of the Kingdom. Outside it the real API answers "No results".
const isInsideKsa = (lat: number, lng: number) => lat >= 16 && lat <= 32.5 && lng >= 34.5 && lng <= 56;

export class MockNationalAddressRepository implements INationalAddressRepository {
  geocode(latitude: number, longitude: number, language: Language): Promise<AddressListResponse> {
    if (!isInsideKsa(latitude, longitude)) {
      return delay({ ...MOCK_ENVELOPE, statusdescription: 'No results', totalSearchResults: '0', Addresses: null, PostCode: null });
    }
    // Pretend the tapped point is the docs' sample building.
    const [sample] = MOCK_ADDRESSES[language];
    const ObjLatLng = `0 ${longitude} ${latitude}`;
    return delay({ ...MOCK_ENVELOPE, totalSearchResults: '1', Addresses: [{ ...sample, ObjLatLng }], PostCode: null });
  }

  freeTextSearch(query: string, _page: number, language: Language): Promise<AddressListResponse> {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = MOCK_ADDRESSES[language].filter(address => {
      const haystack = `${address.Address1} ${address.Address2}`.toLowerCase();
      return terms.some(term => haystack.includes(term));
    });
    return delay({
      ...MOCK_ENVELOPE,
      totalSearchResults: String(matches.length),
      Addresses: matches,
      PostCode: null,
    });
  }

  verify({ buildingNumber, zipCode, additionalNumber }: VerifyParams): Promise<VerifyResponse> {
    const addressfound = MOCK_ADDRESSES.E.some(
      address =>
        address.BuildingNumber === buildingNumber &&
        address.PostCode === zipCode &&
        address.AdditionalNumber === additionalNumber,
    );
    return delay({ ...MOCK_ENVELOPE, addressfound });
  }

  regions(): Promise<RegionsResponse> {
    return delay({ ...MOCK_ENVELOPE, Regions: MOCK_REGIONS });
  }
}
