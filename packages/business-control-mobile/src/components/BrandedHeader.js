import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBranding } from '../contexts/BrandingContext';

/**
 * Header con branding personalizado del negocio para React Native
 * Muestra el logo y usa los colores corporativos
 */
const BrandedHeader = ({ 
  title, 
  subtitle, 
  rightComponent,
  showLogo = true,
  style 
}) => {
  const { branding, colors } = useBranding();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {showLogo && (
          <View style={styles.logoContainer}>
            {branding?.logo ? (
              <Image 
                source={{ uri: branding.logo }} 
                style={styles.logo}
                resizeMode="cover"
              />
            ) : (
              <Ionicons 
                name="business" 
                size={32} 
                color={colors.primary}
              />
            )}
          </View>
        )}
        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, { color: colors.primary }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent && (
        <View style={styles.rightSection}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  rightSection: {
    marginLeft: 12,
  },
});

export default BrandedHeader;
