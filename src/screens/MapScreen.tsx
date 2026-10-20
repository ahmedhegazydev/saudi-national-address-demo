import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { LongPressEvent, Marker } from 'react-native-maps';

import { AddressCard } from '../components/AddressCard';
import { StatusMessage } from '../components/StatusMessage';
import type { Strings } from '../i18n';
import type { Coordinate, Language, NationalAddress, ReverseGeocodeResult } from '../lib/API';
import { DEFAULT_COORDINATE } from '../lib/config';
import { nationalAddressService } from '../lib/services/NationalAddressService';
import { colors, radius, spacing } from '../theme';

interface Props {
  language: Language;
  t: Strings;
  rtl: boolean;
  // Address picked on the Search tab, shown here without another API call.
  focus: NationalAddress | null;
}

const ZOOM = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

export const MapScreen = ({ language, t, rtl, focus }: Props) => {
  const mapRef = useRef<MapView>(null);
  const requestId = useRef(0);
  const [pin, setPin] = useState<Coordinate | null>(null);
  const [result, setResult] = useState<ReverseGeocodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const moveTo = (coordinate: Coordinate) => {
    setPin(coordinate);
    mapRef.current?.animateToRegion({ ...coordinate, ...ZOOM }, 500);
  };

  const lookup = useCallback(
    async (coordinate: Coordinate) => {
      // Ignore late responses when the user drops another pin mid-request.
      const id = ++requestId.current;
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const data = await nationalAddressService.reverseGeocode(coordinate.latitude, coordinate.longitude, language);
        if (id === requestId.current) setResult(data);
      } catch (e) {
        if (id === requestId.current) setError(e);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [language],
  );

  useEffect(() => {
    if (focus?.coordinate) {
      requestId.current++;
      moveTo(focus.coordinate);
      setResult({ address: focus, postCode: focus.postCode });
      setError(null);
      setLoading(false);
    }
  }, [focus]);

  const onLongPress = (event: LongPressEvent) => {
    const coordinate = event.nativeEvent.coordinate;
    setLocationDenied(false);
    setPin(coordinate);
    lookup(coordinate);
  };

  const onMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationDenied(status !== 'granted');
      if (status !== 'granted') {
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordinate = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      moveTo(coordinate);
      lookup(coordinate);
    } catch (e) {
      // Location services switched off, or no GPS fix.
      setError(e);
    }
  };

  const showNoAddress = !loading && !error && result !== null && !result.address;
  const noAddressMessage = result?.postCode ? `${t.noAddress} · ${t.postCode}: ${result.postCode}` : t.noResults;
  const statusMessage = locationDenied ? t.locationDenied : showNoAddress ? noAddressMessage : t.mapHint;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...DEFAULT_COORDINATE, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        onLongPress={onLongPress}
        showsUserLocation
      >
        {pin ? <Marker coordinate={pin} /> : null}
      </MapView>

      <Pressable style={[styles.locationButton, rtl ? styles.left : styles.right]} onPress={onMyLocation}>
        <Text style={styles.locationText}>{t.myLocation}</Text>
      </Pressable>

      <View style={styles.sheet}>
        {result?.address ? <AddressCard address={result.address} t={t} rtl={rtl} /> : null}
        {showNoAddress || loading || error || locationDenied || !pin ? (
          <View style={styles.status}>
            <StatusMessage
              t={t}
              loading={loading}
              error={error}
              message={statusMessage}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  locationButton: {
    position: 'absolute',
    top: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  left: { left: spacing.lg },
  right: { right: spacing.lg },
  locationText: { color: colors.primary, fontWeight: '600' },
  status: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md },
  sheet: { position: 'absolute', left: spacing.md, right: spacing.md, bottom: spacing.md, gap: spacing.sm },
});
