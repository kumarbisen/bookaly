import Icon from '@components/global/Icon';
import { collectData } from '@state/scanStore';
import { Colors } from '@utils/Constants';
import { navigate } from '@utils/NavigationUtils';
import { screenHeight, screenWidth } from '@utils/Scaling';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import {
  Camera,
  CodeScanner,
  useCameraDevice,
} from 'react-native-vision-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';

interface QRScannerModelProps {
  visible: boolean;
  onClose: () => void;
}

const extractProviderId = (value: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) return '';

  const looksLikeUrl = trimmed.includes('://') || trimmed.includes('bookaly.app');
  if (!looksLikeUrl) return trimmed;

  try {
    const queryMatch = trimmed.match(/[?&]provider_id=([^&#]+)/i);
    if (queryMatch && queryMatch[1]) {
      return decodeURIComponent(queryMatch[1]).trim();
    }

    const pathMatch = trimmed.match(/\/provider\/([^/?#]+)/i);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]).trim();
    }

    const parts = trimmed.split('/').filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  } catch (error) {
    return '';
  }

  return '';
};

const QRScannerModel: FC<QRScannerModelProps> = ({ visible, onClose }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice('back') as any;
  const [codeFound, setCodeFound] = useState(false);
  const { scanedData } = collectData()

  useEffect(() => {
    const checkPermission = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    };
    checkPermission();
  }, []);

  const handleScan = (data: any) => {
    console.log('[QRScannerModal] handleScan raw data:', data);

    const providerId = extractProviderId(String(data));
    if (!providerId) {
      Alert.alert('Invalid QR', 'Please scan a valid Bookaly QR code.');
      setCodeFound(false);
      return;
    }

    scanedData(providerId);
    navigate('BookToken');

    setTimeout(() => {
      onClose();
      setCodeFound(false);
    }, 500);
  };

  const handleGalleryScan = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1 });
      if (result.assets && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        RNQRGenerator.detect({
          uri: uri,
        })
          .then((response: { values: any[]; }) => {
            const { values } = response;
            if (values && values.length > 0) {
              handleScan(values[0]);
            } else {
              
              console.log('No QR code found');
            }
          })
          .catch((error: any) => console.log('Cannot detect QR code', error));
      }
    } catch (error) {
      console.log('Gallery picker error', error);
    }
  };

  const codeScanner = useMemo<CodeScanner>(
    () => ({
      codeTypes: ['qr', 'codabar'],
      onCodeScanned: codes => {
        if (codeFound) return;
        if (codes?.length > 0) {
          const scannedData = codes[0].value;
          setCodeFound(true);
          handleScan(scannedData);
        }
      },
    }),
    [codeFound],
  );

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      visible={visible}
      onRequestClose={onClose}
    >

      <View style={styles.container}>

        {/* Camera Layer */}
        {device && hasPermission ? (
          <Camera
            style={StyleSheet.absoluteFill}
            isActive={visible}
            device={device}
            codeScanner={codeScanner}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.noCameraContainer]}>
            <Image
              source={require('../../assets/images/no_camera.png')}
              style={styles.noCameraImage}
            />
            <Text style={styles.noCameraText}>Camera access required</Text>
          </View>
        )}

        
        <View style={styles.overlayContainer}>

         
          <View style={styles.overlaySide} />

          <View style={styles.centerRow}>
            
            <View style={styles.overlaySide} />

            
            <View style={styles.viewfinder}>
              
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            
            <View style={styles.overlaySide} />
          </View>

         
          <View style={styles.overlaySide} />
        </View>

        
        <View style={styles.uiContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name='close' size={28} color="#fff" iconFamily='Ionicons' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.instructionText}>Align the QR code within the frame to scan</Text>
            <TouchableOpacity style={styles.galleryButton} onPress={handleGalleryScan}>
              <Icon name="images-outline" size={24} color="#fff" iconFamily="Ionicons" />
              <Text style={styles.galleryText}>Upload from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </Modal>
  );
};

export default QRScannerModel;

const overlayColor = 'rgba(0,0,0,0.6)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  noCameraContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  noCameraImage: {
    width: 100,
    height: 100,
    opacity: 0.5,
    marginBottom: 20,
  },
  noCameraText: {
    color: '#fff',
    fontSize: 16,
  },
  
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  centerRow: {
    flexDirection: 'row',
    height: 280, 
  },
  viewfinder: {
    width: 280, 
    backgroundColor: 'transparent',
    position: 'relative',
  },
 
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
 
  uiContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden', 
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    gap: 10,
  },
  galleryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
