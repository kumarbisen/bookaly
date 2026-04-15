import { Colors } from '@utils/Constants';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Image,
} from 'react-native';
import Icon from '@components/global/Icon';
import { goBack, navigate } from '@utils/NavigationUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchProvider } from '@service/BookingProvider';
import { collectData } from '@state/scanStore';

const SearchActivity = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { scanedData } = collectData();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!query.trim()) {
      setError('Please enter a provider ID or name');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const data = await searchProvider(query.trim());
      const nextSuggestions: any[] = [];

      if (data?.provider) {
        nextSuggestions.push(data.provider);
      }

      if (data?.suggestions?.length) {
        const existingIds = new Set(
          nextSuggestions
            .map((provider) => provider?._id?.toString())
            .filter(Boolean)
        );

        data.suggestions.forEach((provider: any) => {
          const id = provider?._id?.toString();
          if (!id || !existingIds.has(id)) {
            nextSuggestions.push(provider);
            if (id) {
              existingIds.add(id);
            }
          }
        });
      }

      if (nextSuggestions.length === 0) {
        setError('No provider found with this ID or name');
      }

      setSuggestions(nextSuggestions);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (provider: any) => {
    scanedData(provider._id);
    setSuggestions([]);
    setError('');
    setQuery(provider.provider_id || provider.name || '');
    navigate('BookToken')
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backButton}>
            <Icon
              name="arrow-back"
              size={24}
              color="#1f2937"
              iconFamily="Ionicons"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Provider</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>Provider ID or Name</Text>
          <View style={styles.inputContainer}>
            <Icon
              name="magnify"
              size={24}
              color="#9ca3af"
              iconFamily="MaterialCommunityIcons"
            />
            <TextInput
              style={styles.input}
              placeholder="e.g. dr-kunal or Kunal Clinic"
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Icon
                  name="close-circle"
                  size={20}
                  color="#9ca3af"
                  iconFamily="MaterialCommunityIcons"
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.searchButton, loading && styles.disabledButton]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>

          {error ? (
            <View style={styles.errorContainer}>
              <Icon
                name="alert-circle-outline"
                size={40}
                color="#ef4444"
                iconFamily="MaterialCommunityIcons"
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {suggestions.length > 0 ? (
            <View style={styles.suggestionsCard}>
              <Text style={styles.suggestionsTitle}>Search results</Text>
              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <View style={styles.suggestionIcon}>
                    {item.profileImage ? (
                      <Image
                        source={{ uri: item.profileImage }}
                        style={styles.suggestionImage}
                      />
                    ) : (
                      <Icon
                        name="storefront"
                        size={18}
                        color={Colors.primary}
                        iconFamily="MaterialCommunityIcons"
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    <Text style={styles.suggestionId}>
                      ID: {item.provider_id}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={18}
                    color="#9ca3af"
                    iconFamily="MaterialCommunityIcons"
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default SearchActivity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 8,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfeff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  providerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  suggestionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecfeff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  suggestionImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  suggestionId: {
    fontSize: 12,
    color: '#6b7280',
  },
});
