import type { AddressListResponse, RawAddress } from '../API';
import { parseObjLatLng, parseReverseGeocode, parseSearch } from '../parsers';

const envelope = { success: true, statusdescription: 'SUCCESS', fullexception: null };

const docsAddress: RawAddress = {
  Title: null,
  Address1: '8228 king abdul aziz road - al amal',
  Address2: 'riyadh 12643 - 2121',
  ObjLatLng: '30829 46.71670870 24.65017630',
  BuildingNumber: '8228',
  Street: 'king abdul aziz road',
  District: 'al amal',
  City: 'riyadh',
  PostCode: '12643',
  AdditionalNumber: '2121',
  RegionName: 'Ar Riyadh ',
  PolygonString: null,
};

describe('parseObjLatLng', () => {
  it('reads longitude before latitude', () => {
    expect(parseObjLatLng('30829 46.71670870 24.65017630')).toEqual({ latitude: 24.6501763, longitude: 46.7167087 });
  });

  it('ignores the trailing bounding box', () => {
    expect(parseObjLatLng('1 46.7 24.6 46.69 24.59 46.71 24.61')).toEqual({ latitude: 24.6, longitude: 46.7 });
  });

  it.each([null, undefined, '', '30829', '30829 abc 24.6', '1 200 24'])('returns null for %p', value => {
    expect(parseObjLatLng(value)).toBeNull();
  });
});

describe('parseReverseGeocode', () => {
  const point = { latitude: 24.647414, longitude: 46.714241 };

  it('maps a parcel address and trims fields', () => {
    const response: AddressListResponse = { ...envelope, totalSearchResults: '1', Addresses: [docsAddress], PostCode: null };
    const { address, postCode } = parseReverseGeocode(response, point);
    expect(postCode).toBe('12643');
    expect(address?.region).toBe('Ar Riyadh');
    expect(address?.coordinate).toEqual({ latitude: 24.6501763, longitude: 46.7167087 });
  });

  it('handles the documented postcode-only response (Addresses: null)', () => {
    const response: AddressListResponse = {
      ...envelope,
      totalSearchResults: '1',
      Addresses: null,
      PostCode: [{ postCode: '12643', regionName: '', hasParcels: false }],
    };
    expect(parseReverseGeocode(response, point)).toEqual({ address: null, postCode: '12643' });
  });

  it('accepts the lowercase `postcode` spelling used elsewhere in the docs', () => {
    const response: AddressListResponse = { ...envelope, totalSearchResults: '1', Addresses: null, PostCode: [{ postcode: '11564' }] };
    expect(parseReverseGeocode(response, point).postCode).toBe('11564');
  });

  it('falls back to the tapped point when ObjLatLng is missing', () => {
    const response: AddressListResponse = {
      ...envelope,
      totalSearchResults: '1',
      Addresses: [{ ...docsAddress, ObjLatLng: null }],
      PostCode: null,
    };
    expect(parseReverseGeocode(response, point).address?.coordinate).toEqual(point);
  });

  it('returns empty result outside KSA', () => {
    const response: AddressListResponse = { ...envelope, totalSearchResults: '0', Addresses: null, PostCode: null };
    expect(parseReverseGeocode(response, point)).toEqual({ address: null, postCode: null });
  });
});

describe('parseSearch', () => {
  it('uses totalSearchResults for the count and maps every address', () => {
    const response: AddressListResponse = { ...envelope, totalSearchResults: '37', Addresses: [docsAddress], PostCode: null };
    const result = parseSearch(response);
    expect(result.total).toBe(37);
    expect(result.addresses[0].buildingNumber).toBe('8228');
  });

  it('falls back to the page length when the total is not a number', () => {
    const response: AddressListResponse = { ...envelope, totalSearchResults: null, Addresses: [docsAddress], PostCode: null };
    expect(parseSearch(response).total).toBe(1);
  });
});
