import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuthToken } from '../hooks/useAuth';

/**
 * Componente para configurar numeración de recibos, facturas y configuración fiscal
 */
const NumberingSettings = ({ businessId, onSave }) => {
  const authToken = useAuthToken();
  const [settings, setSettings] = useState({
    receipts: {
      enabled: true,
      initialNumber: 1,
      currentNumber: 1,
      prefix: 'REC',
      format: 'REC-{YEAR}-{NUMBER}',
      padLength: 5,
      resetYearly: true
    },
    invoices: {
      enabled: true,
      initialNumber: 1,
      currentNumber: 1,
      prefix: 'INV',
      format: 'INV-{YEAR}-{NUMBER}',
      padLength: 5,
      resetYearly: true
    },
    fiscal: {
      enabled: false,
      taxxa_prefix: '',
      tax_regime: 'SIMPLIFIED',
      resolution_number: '',
      resolution_date: null,
      valid_from: null,
      valid_to: null,
      technical_key: '',
      software_id: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState({
    receipts: '',
    invoices: ''
  });

  useEffect(() => {
    loadSettings();
  }, [businessId]);

  useEffect(() => {
    updatePreviews();
  }, [settings]);

  /**
   * Cargar configuraciones actuales
   */
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/${businessId}/config/numbering`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSettings(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Error cargando configuraciones');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar vistas previas
   */
  const updatePreviews = async () => {
    try {
      // Preview para recibos
      const receiptPreview = await generatePreview(
        settings.receipts.format,
        settings.receipts.prefix,
        settings.receipts.padLength,
        settings.receipts.currentNumber
      );
      
      // Preview para facturas
      const invoicePreview = await generatePreview(
        settings.invoices.format,
        settings.invoices.prefix,
        settings.invoices.padLength,
        settings.invoices.currentNumber
      );

      setPreview({
        receipts: receiptPreview,
        invoices: invoicePreview
      });
    } catch (error) {
      console.error('Error updating previews:', error);
    }
  };

  /**
   * Generar vista previa del formato
   */
  const generatePreview = async (format, prefix, padLength, number) => {
    try {
      const response = await fetch(`/api/business/${businessId}/config/numbering/preview?format=${encodeURIComponent(format)}&prefix=${prefix}&padLength=${padLength}&number=${number}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.success ? result.data.preview : 'Error en vista previa';
      }
      return 'Error en vista previa';
    } catch (error) {
      return 'Error en vista previa';
    }
  };

  /**
   * Actualizar configuración específica
   */
  const updateSetting = (type, field, value) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  /**
   * Guardar configuraciones
   */
  const handleSave = async () => {
    try {
      setLoading(true);

      // Validaciones
      if (settings.receipts.enabled && settings.receipts.initialNumber < 1) {
        Alert.alert('Error', 'El número inicial de recibos debe ser mayor a 0');
        return;
      }

      if (settings.invoices.enabled && settings.invoices.initialNumber < 1) {
        Alert.alert('Error', 'El número inicial de facturas debe ser mayor a 0');
        return;
      }

      const response = await fetch(`/api/business/${businessId}/config/numbering`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          Alert.alert('Éxito', 'Configuraciones guardadas exitosamente');
          onSave && onSave(result.data);
        } else {
          Alert.alert('Error', result.message || 'Error guardando configuraciones');
        }
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Error guardando configuraciones');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Error guardando configuraciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#f8f9fa' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' }}>
        Configuración de Numeración
      </Text>

      {/* CONFIGURACIÓN DE RECIBOS */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', flex: 1, color: '#2c3e50' }}>Recibos de Pago</Text>
          <Switch
            value={settings.receipts.enabled}
            onValueChange={(value) => updateSetting('receipts', 'enabled', value)}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
            thumbColor={settings.receipts.enabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        {settings.receipts.enabled && (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Número Inicial</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                  value={settings.receipts.initialNumber.toString()}
                  onChangeText={(text) => updateSetting('receipts', 'initialNumber', parseInt(text) || 1)}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Prefijo</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                  value={settings.receipts.prefix}
                  onChangeText={(text) => updateSetting('receipts', 'prefix', text)}
                  placeholder="REC"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Formato</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                value={settings.receipts.format}
                onChangeText={(text) => updateSetting('receipts', 'format', text)}
                placeholder="REC-{YEAR}-{NUMBER}"
              />
              <Text style={{ fontSize: 12, color: '#777', marginTop: 4 }}>
                Variables: {'{YEAR}'} = Año, {'{PREFIX}'} = Prefijo, {'{NUMBER}'} = Número
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Longitud Número</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                  value={settings.receipts.padLength.toString()}
                  onChangeText={(text) => updateSetting('receipts', 'padLength', parseInt(text) || 5)}
                  keyboardType="numeric"
                  placeholder="5"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Switch
                    value={settings.receipts.resetYearly}
                    onValueChange={(value) => updateSetting('receipts', 'resetYearly', value)}
                    trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                    thumbColor={settings.receipts.resetYearly ? '#ffffff' : '#f4f3f4'}
                  />
                  <Text style={{ marginLeft: 8, fontSize: 14, color: '#555' }}>Reiniciar cada año</Text>
                </View>
              </View>
            </View>

            <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Vista Previa:</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50' }}>{preview.receipts}</Text>
            </View>
          </>
        )}
      </View>

      {/* CONFIGURACIÓN DE FACTURAS */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', flex: 1, color: '#2c3e50' }}>Facturas</Text>
          <Switch
            value={settings.invoices.enabled}
            onValueChange={(value) => updateSetting('invoices', 'enabled', value)}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
            thumbColor={settings.invoices.enabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        {settings.invoices.enabled && (
          <>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Número Inicial</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                  value={settings.invoices.initialNumber.toString()}
                  onChangeText={(text) => updateSetting('invoices', 'initialNumber', parseInt(text) || 1)}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Prefijo</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                  value={settings.invoices.prefix}
                  onChangeText={(text) => updateSetting('invoices', 'prefix', text)}
                  placeholder="INV"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Formato</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                value={settings.invoices.format}
                onChangeText={(text) => updateSetting('invoices', 'format', text)}
                placeholder="INV-{YEAR}-{NUMBER}"
              />
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Longitud Número</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                  value={settings.invoices.padLength.toString()}
                  onChangeText={(text) => updateSetting('invoices', 'padLength', parseInt(text) || 5)}
                  keyboardType="numeric"
                  placeholder="5"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Switch
                    value={settings.invoices.resetYearly}
                    onValueChange={(value) => updateSetting('invoices', 'resetYearly', value)}
                    trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
                    thumbColor={settings.invoices.resetYearly ? '#ffffff' : '#f4f3f4'}
                  />
                  <Text style={{ marginLeft: 8, fontSize: 14, color: '#555' }}>Reiniciar cada año</Text>
                </View>
              </View>
            </View>

            <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Vista Previa:</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50' }}>{preview.invoices}</Text>
            </View>
          </>
        )}
      </View>

      {/* CONFIGURACIÓN FISCAL (TAXXA) */}
      <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', flex: 1, color: '#2c3e50' }}>Configuración Fiscal (Taxxa)</Text>
          <Switch
            value={settings.fiscal.enabled}
            onValueChange={(value) => updateSetting('fiscal', 'enabled', value)}
            trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
            thumbColor={settings.fiscal.enabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        {settings.fiscal.enabled && (
          <>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Prefijo Taxxa</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                value={settings.fiscal.taxxa_prefix}
                onChangeText={(text) => updateSetting('fiscal', 'taxxa_prefix', text)}
                placeholder="PREFIX001"
                maxLength={20}
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Régimen Tributario</Text>
              <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fff' }}>
                <Picker
                  selectedValue={settings.fiscal.tax_regime}
                  onValueChange={(value) => updateSetting('fiscal', 'tax_regime', value)}
                >
                  <Picker.Item label="Régimen Simplificado" value="SIMPLIFIED" />
                  <Picker.Item label="Régimen Común" value="COMMON" />
                </Picker>
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Número de Resolución</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                value={settings.fiscal.resolution_number}
                onChangeText={(text) => updateSetting('fiscal', 'resolution_number', text)}
                placeholder="18760000001"
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>ID del Software</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                value={settings.fiscal.software_id}
                onChangeText={(text) => updateSetting('fiscal', 'software_id', text)}
                placeholder="software123"
              />
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 4, color: '#555' }}>Clave Técnica</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fff' }}
                value={settings.fiscal.technical_key}
                onChangeText={(text) => updateSetting('fiscal', 'technical_key', text)}
                placeholder="Clave técnica de la DIAN"
                secureTextEntry
              />
            </View>
          </>
        )}
      </View>

      {/* BOTÓN GUARDAR */}
      <TouchableOpacity
        style={{
          backgroundColor: '#4CAF50',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          marginBottom: 32,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3
        }}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          {loading ? 'Guardando...' : 'Guardar Configuraciones'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default NumberingSettings;