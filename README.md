# Saudi National Address Demo (Expo)

A React Native / Expo demo of the **Saudi Post National Address API** ([api.address.gov.sa](https://api.address.gov.sa/apidocumentation)) on Android and iOS.

| Tab | What it does | Endpoint |
| --- | --- | --- |
| **Map** | Long-press the map or tap *My location* to get the national address + postal code for that point | `address/address-geocode` |
| **Search** | Free-text search (building no., postal code, street…), tap a result to open it on the map | `address/address-free-text` |
| **Verify** | Check that *building no. + postal code + additional no.* is a real address | `address/address-verify` |

Arabic / English toggle in the header (`language=A|E`). Without an API key the app runs in **MOCK** mode on sample data, so it works right away.

<div dir="rtl">

### ملخص بالعربي

- ديمو لواجهة **العنوان الوطني** من سُبل (البريد السعودي)، ويشتغل على أندرويد وآيفون.
- **الخريطة:** تضغط ضغطة طويلة على أي نقطة، فيظهر العنوان الوطني والرمز البريدي.
- **البحث:** تكتب نص حر.
- **التحقق:** تدخل رقم المبنى والرمز البريدي والرقم الإضافي، ويتأكد إن العنوان موجود.
- **بدون مفتاح API:** التطبيق يشتغل ببيانات تجريبية (MOCK).
- **في الإنتاج:** لازم الطلبات تمر عبر سيرفر وسيط (proxy) يحفظ المفتاح ويعمل cache، لأن الباقة المجانية 100 طلب في الأسبوع فقط، والمفتاح بيتبعت في الرابط.

</div>

---

## Run it

Requirements: **Node ≥ 22.13** (Expo SDK 58) and the **Expo Go** app on your phone.

```bash
npm install
cp .env.example .env        # optional: paste your key, or leave empty for MOCK mode
npx expo start              # scan the QR code with Expo Go (Android) or the Camera app (iOS)
```

```bash
npm test                    # unit tests (parsers, quota guard, error mapping)
npm run typecheck
```

### Getting an API key

1. Sign up at <https://api.address.gov.sa/signup> and subscribe to a product.
2. Copy the key from **Profile → Your Subscriptions** into `.env` as `EXPO_PUBLIC_NATIONAL_ADDRESS_API_KEY`.
3. Restart `npx expo start` (env vars are read at bundle time).

---

## Architecture

```
App.tsx                                   tab shell, language toggle
src/lib/API.ts                            DTO types from the docs + NationalAddressError
src/lib/config.ts                         base URL, key, quota constants
src/lib/repositories/
  NationalAddressRepository.ts            axios: format=JSON, encode=utf8, language, api_key
  MockNationalAddressRepository.ts        offline fixtures (used when no key)
src/lib/services/NationalAddressService.ts cache → rate-limit → request → parse → typed errors
src/lib/parsers.ts                        ObjLatLng parsing, postcode-only responses, casing quirks
src/lib/quota.ts                          RateLimiter (5/min) + TtlCache
src/screens/{Map,Search,Verify}Screen.tsx
```

Layering is **Repository → Service → Screen**, the same shape as a typical production RN app, so `src/lib` can be copied into another project as-is.

### API quirks handled in code

- **`encode=utf8` is always sent.** The default encoding is `windows-1256`, which garbles Arabic.
- **`ObjLatLng` is `"id longitude latitude minx miny maxx maxy"`.** The longitude comes first.
- **Reverse geocode can return only `PostCode[]` with `Addresses: null`** when the point is not on a parcel.
- **The docs spell `postCode` and `postcode` both ways**, so both are accepted.
- **401 / 403 / 429 / 5xx / network errors** become typed errors with Arabic and English messages.
- **The Starter plan allows 5 calls/min and 100/week.** The app caches results for 10 minutes, debounces search by 800 ms (minimum 3 characters), and blocks a 6th call within a minute on the device.

---

## Expo or React Native CLI?

**Expo**, for these reasons:

- The API is plain HTTPS/JSON, so no native SDK is needed.
- `react-native-maps` and `expo-location` both run inside **Expo Go**, so you can test on a real iPhone or Android by scanning a QR code, with no Xcode or Android Studio build.
- If native code is needed later, `npx expo prebuild` / EAS Build produces a normal native project. Expo doesn't lock you in.

The CLI would only be worth it for custom native modules, which this feature doesn't need.

> For a **release Android build**, Google Maps needs a key: add the `react-native-maps` config plugin with `androidGoogleMapsApiKey` (see the [Expo docs](https://docs.expo.dev/versions/latest/sdk/map-view/)). Expo Go needs nothing.

---

## Pros / Cons

**Pros**

- An official, authoritative source (Saudi Post / SPL).
- It can fill in and verify addresses automatically, which means fewer typos in contracts, deeds and deliveries.
- Arabic and English output.
- A simple REST API with no SDK, so it behaves the same on Android, iOS and web.

**Cons**

- **The Starter quota is tiny (100 calls/week).** Production needs the *Unlimited* plan, which requires manual approval.
- **The key travels in the query string.** A key bundled into a mobile app can be extracted, so production must go through a backend proxy.
- **The docs are inconsistent:** field casing differs, v3.1 and v4 are mixed, and some sample JSON is malformed.
- **No official mobile map SDK.** The Maps API is a web JS embed only.
- **Coverage is KSA only**, and availability depends on a government service's uptime.
- **The "short address → full address" lookup isn't in the public docs.** It may be a separate product, so confirm it with SPL.

---

## Production risk: what can go wrong and how to prevent it

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Quota exhausted (403), so address lookups stop for everyone | **High** on Starter | High | Unlimited plan; server-side cache; debounce; never call on every keystroke or map move |
| API key leaked from the app bundle | **High** if the key is in the app | High | Backend proxy. The key lives only on the server; the app calls `/api/national-address/*` |
| Response shape differs from the docs (casing, nulls, v3.1→v4 changes) | Medium | Medium (blank fields, crash) | Defensive parsers (`src/lib/parsers.ts`), unit tests on real recorded responses, contract test in CI |
| Arabic text garbled | Medium (if `encode=utf8` is forgotten) | Medium | Always send `encode=utf8` (done in the repository's default params) |
| Service slow or down (government endpoint) | Low to medium | Medium | 15 s timeout, retry with backoff on the server, fall back to **manual entry**, never block the user's flow |
| Point with no parcel / outside KSA | Common | Low | Show the postal code only, or "no address", and let the user type it |
| Wrong lat/lng order when reading `ObjLatLng` | Medium (easy mistake) | Medium (pin in the wrong place) | Centralised parser + tests |
| Location permission denied / GPS off | Common | Low | Handled; the map and search still work |
| Logging personal address data to analytics or Sentry | Medium | Compliance | Don't log full addresses; log only error codes |

**Bottom line:** the integration itself is low-risk. It's read-only, idempotent GETs. Almost all real production risk comes from **quota** and **key exposure**, and both are solved by putting a small backend proxy (with caching) between the app and the API. Treat the API as **assistive**: pre-fill and verify, but always keep manual entry as a fallback.

---

## Moving this into a production app

1. Add the backend proxy endpoints: `geocode`, `search`, `verify`. They hold the key, cache results and enforce quota.
2. Point `NationalAddressRepository` at the proxy and remove `api_key` from the client.
3. Use `reverseGeocode` to pre-fill the address form from a map pin, and call `verify` before submit.

## License

MIT
