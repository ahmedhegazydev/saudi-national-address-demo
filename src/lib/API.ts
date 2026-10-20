// Types for the Saudi Post National Address API (https://api.address.gov.sa).
// Raw* types mirror the documented JSON; the rest are the app-level shapes the UI consumes.

export type Language = 'A' | 'E';

export interface ApiEnvelope {
  success: boolean;
  statusdescription: string | null;
  fullexception: string | null;
}

export interface RawAddress {
  Title: string | null;
  Address1: string | null;
  Address2: string | null;
  // "ObjectId Longitude Latitude Minx Miny Maxx Maxy"
  ObjLatLng: string | null;
  BuildingNumber: string | null;
  Street: string | null;
  District: string | null;
  City: string | null;
  PostCode: string | null;
  AdditionalNumber: string | null;
  RegionName: string | null;
  PolygonString: string | null;
}

// The docs spell this field both `postCode` and `postcode`, so both are accepted.
export interface RawPostCode {
  postCode?: string;
  postcode?: string;
  regionName?: string;
  hasParcels?: boolean;
}

export interface AddressListResponse extends ApiEnvelope {
  totalSearchResults: string | null;
  Addresses: RawAddress[] | null;
  PostCode: RawPostCode[] | null;
}

export interface VerifyResponse extends ApiEnvelope {
  addressfound: boolean;
}

export interface RawRegion {
  Id: string;
  Name: string;
}

export interface RegionsResponse extends ApiEnvelope {
  Regions: RawRegion[] | null;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface NationalAddress {
  line1: string;
  line2: string;
  buildingNumber: string;
  street: string;
  district: string;
  city: string;
  postCode: string;
  additionalNumber: string;
  region: string;
  coordinate: Coordinate | null;
}

export interface ReverseGeocodeResult {
  // Full parcel address when the point hits a building, otherwise null.
  address: NationalAddress | null;
  // Postal code of the area. Returned even when there is no parcel address.
  postCode: string | null;
}

export interface SearchResult {
  total: number;
  addresses: NationalAddress[];
}

export interface VerifyParams {
  buildingNumber: string;
  zipCode: string;
  additionalNumber: string;
}

export type NationalAddressErrorCode =
  | 'INVALID_KEY'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'SERVER'
  | 'UNKNOWN';

export class NationalAddressError extends Error {
  readonly code: NationalAddressErrorCode;

  constructor(code: NationalAddressErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'NationalAddressError';
    this.code = code;
  }
}
