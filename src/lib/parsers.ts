import type {
  AddressListResponse,
  Coordinate,
  NationalAddress,
  RawAddress,
  RawPostCode,
  ReverseGeocodeResult,
  SearchResult,
} from './API';

const clean = (value: string | null | undefined): string => (value ?? '').trim();

const isValidCoordinate = (lat: number, lng: number): boolean =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

// ObjLatLng is "ObjectId Longitude Latitude Minx Miny Maxx Maxy". Note the
// longitude comes BEFORE the latitude.
export const parseObjLatLng = (value: string | null | undefined): Coordinate | null => {
  const parts = clean(value).split(/\s+/);
  if (parts.length < 3) {
    return null;
  }
  const longitude = Number(parts[1]);
  const latitude = Number(parts[2]);
  return isValidCoordinate(latitude, longitude) ? { latitude, longitude } : null;
};

export const toNationalAddress = (raw: RawAddress): NationalAddress => ({
  line1: clean(raw.Address1),
  line2: clean(raw.Address2),
  buildingNumber: clean(raw.BuildingNumber),
  street: clean(raw.Street),
  district: clean(raw.District),
  city: clean(raw.City),
  postCode: clean(raw.PostCode),
  additionalNumber: clean(raw.AdditionalNumber),
  region: clean(raw.RegionName),
  coordinate: parseObjLatLng(raw.ObjLatLng),
});

const readPostCode = (item: RawPostCode | undefined): string | null => {
  const value = clean(item?.postCode ?? item?.postcode);
  return value.length > 0 ? value : null;
};

export const parseReverseGeocode = (
  response: AddressListResponse,
  fallback: Coordinate,
): ReverseGeocodeResult => {
  const raw = response.Addresses?.[0];
  const address = raw ? toNationalAddress(raw) : null;
  if (address && !address.coordinate) {
    address.coordinate = fallback;
  }
  const postCode = address?.postCode || readPostCode(response.PostCode?.[0] ?? undefined);
  return { address, postCode: postCode || null };
};

export const parseSearch = (response: AddressListResponse): SearchResult => {
  const addresses = (response.Addresses ?? []).map(toNationalAddress);
  // Number(null) and Number('') are 0, so a missing total would hide real results.
  const total = Number.parseInt(response.totalSearchResults ?? '', 10);
  return { total: Number.isNaN(total) ? addresses.length : total, addresses };
};
