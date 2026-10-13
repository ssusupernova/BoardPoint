import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  geocodeProvider,
  geocodingConfigured,
  GeocodeRequestError,
  type PlaceSuggestion,
} from '@/services/geocode';
import { LANDLORD_THEME } from '@/styles/landlord/styles';
import { addressSearchFieldStyles as styles } from './AddressSearchField.styles';

type Status = 'idle' | 'searching' | 'results' | 'empty' | 'error';

type Props = {
  label?: string;
  value: string;
  onChange: (text: string) => void;
  /** A suggestion was picked — move the pin and adopt its label. */
  onSelect: (suggestion: PlaceSuggestion) => void;
  placeholder?: string;
  error?: string;
};

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 350;

/**
 * Searchable address field backed by the geocoding seam. Typing shows up to
 * five suggestions; picking one moves the map pin. When no geocoder is
 * configured (or a request fails) the field degrades to plain text with a
 * clear notice — the landlord can still drop the pin manually.
 */
export function AddressSearchField({
  label = 'Full address',
  value,
  onChange,
  onSelect,
  placeholder = 'Street, barangay, or landmark',
  error,
}: Props) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const requestIdRef = useRef(0);
  const skipQueryRef = useRef<string | null>(null);

  useEffect(() => {
    const text = value.trim();
    const requestId = ++requestIdRef.current;

    const timer = setTimeout(() => {
      const skip = skipQueryRef.current === text;
      skipQueryRef.current = null;
      if (skip || text.length < MIN_QUERY_LENGTH || !geocodingConfigured) {
        setSuggestions([]);
        setStatus('idle');
        return;
      }

      setStatus('searching');
      void (async () => {
        try {
          const results = await geocodeProvider.suggest(text);
          if (requestId !== requestIdRef.current) return;
          setSuggestions(results);
          setStatus(results.length > 0 ? 'results' : 'empty');
        } catch (requestError) {
          if (requestId !== requestIdRef.current) return;
          setSuggestions([]);
          setStatus(requestError instanceof GeocodeRequestError ? 'error' : 'idle');
        }
      })();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (suggestion: PlaceSuggestion) => {
    skipQueryRef.current = suggestion.label.trim();
    setSuggestions([]);
    setStatus('idle');
    onChange(suggestion.label);
    onSelect(suggestion);
  };

  const showError = status === 'error';

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error || showError ? styles.fieldError : null]}>
        <Ionicons name="search-outline" size={17} color={LANDLORD_THEME.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={LANDLORD_THEME.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          accessibilityLabel={label}
          returnKeyType="search"
        />
        {status === 'searching' ? (
          <ActivityIndicator size="small" color={LANDLORD_THEME.primary} />
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {!geocodingConfigured ? (
        <Text style={styles.hintText}>
          Address search isn’t set up on this device — type the address manually, then drag the
          pin to the exact spot.
        </Text>
      ) : null}

      {showError ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          Address search couldn’t reach the geocoding service. Check your connection, or drag the
          pin instead.
        </Text>
      ) : null}

      {status === 'empty' ? (
        <Text style={styles.hintText}>No matches found. Drag the pin to set the location.</Text>
      ) : null}

      {status === 'results' ? (
        <View style={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={`${suggestion.point.latitude},${suggestion.point.longitude},${suggestion.label}`}
              onPress={() => handleSelect(suggestion)}
              style={({ pressed }) => [styles.suggestion, pressed && styles.suggestionPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Use address ${suggestion.label}`}
            >
              <Ionicons name="location-outline" size={15} color={LANDLORD_THEME.primaryDark} />
              <Text style={styles.suggestionText} numberOfLines={2}>
                {suggestion.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
