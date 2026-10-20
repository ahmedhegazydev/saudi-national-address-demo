// Mock-mode data. The first address and the regions come from the samples in the
// official docs. The other addresses are made-up examples so the demo has more
// than one result to show.
import type { RawAddress, RawRegion } from '../API';

const envelope = { success: true, datasetOrdatatable: null, result: null, fullexception: null };

export const MOCK_ENVELOPE = { ...envelope, statusdescription: 'SUCCESS' };

export const MOCK_ADDRESSES: Record<'A' | 'E', RawAddress[]> = {
  E: [
    {
      Title: null,
      Address1: '8228 King Abdul Aziz Road - Al Amal',
      Address2: 'Riyadh 12643 - 2121',
      ObjLatLng: '30829 46.71670870 24.65017630',
      BuildingNumber: '8228',
      Street: 'King Abdul Aziz Road',
      District: 'Al Amal',
      City: 'Riyadh',
      PostCode: '12643',
      AdditionalNumber: '2121',
      RegionName: 'Ar Riyadh',
      PolygonString: null,
    },
    {
      Title: null,
      Address1: '3456 Prince Sultan Street - Al Rawdah',
      Address2: 'Jeddah 23434 - 7788',
      ObjLatLng: '41022 39.15790000 21.56060000',
      BuildingNumber: '3456',
      Street: 'Prince Sultan Street',
      District: 'Al Rawdah',
      City: 'Jeddah',
      PostCode: '23434',
      AdditionalNumber: '7788',
      RegionName: 'Makkah Al Mukarramah',
      PolygonString: null,
    },
    {
      Title: null,
      Address1: '6612 King Saud Street - Al Faisaliyah',
      Address2: 'Dammam 32272 - 4410',
      ObjLatLng: '52310 50.10320000 26.42070000',
      BuildingNumber: '6612',
      Street: 'King Saud Street',
      District: 'Al Faisaliyah',
      City: 'Dammam',
      PostCode: '32272',
      AdditionalNumber: '4410',
      RegionName: 'Eastern Province',
      PolygonString: null,
    },
  ],
  A: [
    {
      Title: null,
      Address1: '8228 طريق الملك عبدالعزيز - حي الأمل',
      Address2: 'الرياض 12643 - 2121',
      ObjLatLng: '30829 46.71670870 24.65017630',
      BuildingNumber: '8228',
      Street: 'طريق الملك عبدالعزيز',
      District: 'حي الأمل',
      City: 'الرياض',
      PostCode: '12643',
      AdditionalNumber: '2121',
      RegionName: 'منطقة الرياض',
      PolygonString: null,
    },
    {
      Title: null,
      Address1: '3456 شارع الأمير سلطان - حي الروضة',
      Address2: 'جدة 23434 - 7788',
      ObjLatLng: '41022 39.15790000 21.56060000',
      BuildingNumber: '3456',
      Street: 'شارع الأمير سلطان',
      District: 'حي الروضة',
      City: 'جدة',
      PostCode: '23434',
      AdditionalNumber: '7788',
      RegionName: 'منطقة مكة المكرمة',
      PolygonString: null,
    },
    {
      Title: null,
      Address1: '6612 شارع الملك سعود - حي الفيصلية',
      Address2: 'الدمام 32272 - 4410',
      ObjLatLng: '52310 50.10320000 26.42070000',
      BuildingNumber: '6612',
      Street: 'شارع الملك سعود',
      District: 'حي الفيصلية',
      City: 'الدمام',
      PostCode: '32272',
      AdditionalNumber: '4410',
      RegionName: 'المنطقة الشرقية',
      PolygonString: null,
    },
  ],
};

export const MOCK_REGIONS: RawRegion[] = [
  { Id: '9', Name: 'Al Baha' },
  { Id: '2', Name: 'Al Jawf' },
  { Id: '7', Name: 'Al Madinah Al Munawwarah' },
  { Id: '4', Name: 'Hail' },
  { Id: '10', Name: 'Jazan' },
  { Id: '11', Name: 'Makkah Al Mukarramah' },
  { Id: '12', Name: 'Najran' },
];
