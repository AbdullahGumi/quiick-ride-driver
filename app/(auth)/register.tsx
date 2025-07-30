import { authApi } from "@/api/endpoints/auth";
import { driverApi } from "@/api/endpoints/driver";
import CustomButton from "@/components/common/CustomButton";
import CustomText from "@/components/common/CustomText";
import Header from "@/components/common/Header";
import FormStage1 from "@/components/feature/register/FormStage1";
import FormStage2 from "@/components/feature/register/FormStage2";
import FormStage3 from "@/components/feature/register/FormStage3";
import FormStage4 from "@/components/feature/register/FormStage4";
import { COLORS } from "@/constants/Colors";
import { CONSTANTS } from "@/constants/constants";
import { scale, scaleText } from "@/constants/Layout";
import { useAppStore } from "@/stores/useAppStore";
import { Storage } from "@/utility/asyncStorageHelper";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  nin: string;
  pin: string;
  confirmPin: string;
  profilePicture: string;
  vehicleNumber: string;
  plateNumber: string;
}

interface Errors {
  [key: string]: string | undefined;
}

const RegisterScreen = () => {
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    nin: "",
    pin: "",
    confirmPin: "",
    profilePicture: "",
    vehicleNumber: "",
    plateNumber: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [isImageSourceSheetOpen, setImageSourceSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { phone }: { phone?: string } = useLocalSearchParams();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const imageSourceSheetRef = useRef<BottomSheetModal>(null);
  const setUser = useAppStore((state) => state.setUser);

  // Memoized snap points
  const snapPoints = useMemo(() => ["25%"], []);
  const imageSourceSnapPoints = useMemo(() => ["30%"], []);

  // Start fade animation on step change
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

  // Consolidated state update handler
  const updateFormState = useCallback(
    (field: keyof FormState, value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  // Modal handlers
  const handlePresentModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
    setBottomSheetOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.close();
    setBottomSheetOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePresentImageSourceModal = useCallback(() => {
    imageSourceSheetRef.current?.present();
    setImageSourceSheetOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const handleCloseImageSourceModal = useCallback(() => {
    imageSourceSheetRef.current?.close();
    setImageSourceSheetOpen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Validation functions
  const validateStage1 = useCallback(() => {
    const newErrors: Errors = {};
    const { firstName, lastName, gender, nin, email } = formState;
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!nin.trim()) newErrors.nin = "NIN is required";
    if (nin.trim().length !== 11)
      newErrors.nin = "NIN must be exactly 11 digits";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  const validateStage2 = useCallback(() => {
    const newErrors: Errors = {};
    if (!formState.profilePicture)
      newErrors.profilePicture = "Profile picture is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState.profilePicture]);

  const validateStage3 = useCallback(() => {
    const newErrors: Errors = {};
    const { pin, confirmPin } = formState;
    if (!pin) newErrors.pin = "PIN is required";
    else if (pin.length !== 4) newErrors.pin = "PIN must be exactly 4 digits";
    if (!confirmPin) newErrors.confirmPin = "Confirm PIN is required";
    else if (confirmPin.length !== 4)
      newErrors.confirmPin = "Confirm PIN must be exactly 4 digits";
    else if (pin !== confirmPin) newErrors.confirmPin = "PINs do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  const validateStage4 = useCallback(() => {
    const newErrors: Errors = {};
    const { vehicleNumber, plateNumber } = formState;
    if (!vehicleNumber.trim())
      newErrors.vehicleNumber = "Vehicle number is required";
    if (!plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  // Image picker handlers
  const pickImageFromGallery = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      updateFormState("profilePicture", result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    handleCloseImageSourceModal();
  }, [updateFormState, handleCloseImageSourceModal]);

  const snapImageWithCamera = useCallback(async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Camera permission is required to take a photo",
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      updateFormState("profilePicture", result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    handleCloseImageSourceModal();
  }, [updateFormState, handleCloseImageSourceModal]);

  // Continue handler
  const handleContinue = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const validations = [
      validateStage1,
      validateStage2,
      validateStage3,
      validateStage4,
    ];
    if (validations[step - 1]()) {
      if (step === 4) {
        try {
          setLoading(true);
          const {
            firstName,
            lastName,
            email,
            gender,
            nin,
            pin,
            profilePicture,
            vehicleNumber,
            plateNumber,
          } = formState;
          const { data } = await authApi.register({
            email,
            name: `${firstName} ${lastName}`,
            gender,
            phone: phone || "",
            role: CONSTANTS.USER_ROLE,
            nin,
            pin,
            profilePicture,
          });

          if (data.token) {
            setUser(data.user);
            await Storage.set("access_token", data.token);
            await driverApi.addVehicle({ plateNumber, vehicleNumber });
            router.push("/(tabs)");
          }
        } catch (err: any) {
          setErrors({
            api: err.response?.data?.error || "Registration failed",
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
          setLoading(false);
        }
      } else {
        setStep((prev) => prev + 1);
        fadeAnim.setValue(0);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [step, formState, phone, setUser, router]);

  // Back handler
  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep((prev) => prev - 1);
      fadeAnim.setValue(0);
    } else {
      router.back();
    }
  }, [step, router]);

  // Progress bar
  const renderProgressBar = useCallback(
    () => (
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[
              styles.progressStep,
              s <= step
                ? styles.progressStepActive
                : styles.progressStepInactive,
            ]}
          />
        ))}
      </View>
    ),
    [step]
  );

  // Render stage
  const renderStage = useCallback(() => {
    const {
      firstName,
      lastName,
      email,
      gender,
      nin,
      profilePicture,
      vehicleNumber,
      plateNumber,
    } = formState;
    switch (step) {
      case 1:
        return (
          <FormStage1
            firstName={firstName}
            lastName={lastName}
            email={email}
            gender={gender}
            nin={nin}
            updateFormState={updateFormState}
            errors={errors}
            isBottomSheetOpen={isBottomSheetOpen}
            handlePresentModal={handlePresentModal}
            fadeAnim={fadeAnim}
          />
        );
      case 2:
        return (
          <FormStage2
            fadeAnim={fadeAnim}
            handlePresentImageSourceModal={handlePresentImageSourceModal}
            errors={errors}
            styles={styles}
            profilePicture={profilePicture}
          />
        );
      case 3:
        return (
          <FormStage3
            fadeAnim={fadeAnim}
            styles={styles}
            updateFormState={updateFormState}
            errors={errors}
          />
        );
      case 4:
        return (
          <FormStage4
            fadeAnim={fadeAnim}
            updateFormState={updateFormState}
            vehicleNumber={vehicleNumber}
            errors={errors}
            styles={styles}
            plateNumber={plateNumber}
          />
        );
      default:
        return null;
    }
  }, [
    step,
    formState,
    errors,
    isBottomSheetOpen,
    handlePresentModal,
    handlePresentImageSourceModal,
    updateFormState,
  ]);

  // Determine if the continue button should be disabled
  const isContinueDisabled = useMemo(() => {
    if (loading) return true;
    switch (step) {
      case 1:
        return (
          !formState.firstName ||
          !formState.lastName ||
          !formState.gender ||
          !formState.nin
        );
      case 2:
        return !formState.profilePicture;
      case 3:
        return !formState.pin || !formState.confirmPin;
      case 4:
        return !formState.vehicleNumber || !formState.plateNumber;
      default:
        return false;
    }
  }, [loading, step, formState]);

  return (
    <BottomSheetModalProvider>
      <TouchableWithoutFeedback
        onPress={() => {
          handleCloseModal();
          handleCloseImageSourceModal();
        }}
      >
        <View style={styles.container}>
          <KeyboardAwareScrollView
            enableOnAndroid
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.innerContainer}>
              <Header onBackPress={handleBack} />
              {renderProgressBar()}
              <CustomText fontWeight="Bold" style={styles.title}>
                Ready to Earn?
              </CustomText>
              <CustomText fontWeight="Regular" style={styles.subtitle}>
                {step === 1
                  ? "Tell us a bit about yourself!"
                  : step === 2
                  ? "Add your profile picture"
                  : step === 3
                  ? "Set your PIN"
                  : "Enter your vehicle details"}
              </CustomText>
              {errors.api && (
                <CustomText style={styles.errorText}>{errors.api}</CustomText>
              )}
              <View style={styles.formContainer}>{renderStage()}</View>
            </View>
          </KeyboardAwareScrollView>
          <View style={styles.buttonContainer}>
            <CustomButton
              title={step === 4 ? "Submit" : "Continue"}
              onPress={handleContinue}
              loading={loading}
              disabled={isContinueDisabled}
              style={styles.button}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        onDismiss={handleCloseModal}
        handleIndicatorStyle={{ backgroundColor: "#E2E2E2" }}
        backgroundStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 10, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View style={styles.sheetContent}>
          {["male", "female"].map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => {
                updateFormState("gender", g);
                handleCloseModal();
              }}
              style={styles.sheetOption}
              accessible
            >
              <CustomText fontWeight="Medium" style={styles.sheetText}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetModal>
      <BottomSheetModal
        ref={imageSourceSheetRef}
        snapPoints={imageSourceSnapPoints}
        enableDynamicSizing={false}
        onDismiss={handleCloseImageSourceModal}
        handleIndicatorStyle={{ backgroundColor: "#E2E2E2" }}
        backgroundStyle={{
          backgroundColor: "white",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 10, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View style={styles.sheetContent}>
          <TouchableOpacity
            onPress={pickImageFromGallery}
            style={styles.sheetOption}
            accessible
          >
            <CustomText fontWeight="Medium" style={styles.sheetText}>
              Choose from Gallery
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={snapImageWithCamera}
            style={styles.sheetOption}
            accessible
          >
            <CustomText fontWeight="Medium" style={styles.sheetText}>
              Take a Photo
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCloseImageSourceModal}
            style={styles.sheetOption}
            accessible
          >
            <CustomText fontWeight="Medium" style={styles.sheetText}>
              Cancel
            </CustomText>
          </TouchableOpacity>
        </View>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: scale(20) },
  innerContainer: { paddingHorizontal: scale(16) },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: scale(16),
  },
  progressStep: {
    width: scale(60),
    height: scale(4),
    borderRadius: scale(2),
    marginHorizontal: scale(4),
  },
  progressStepActive: { backgroundColor: COLORS.primary },
  progressStepInactive: { backgroundColor: COLORS.secondaryText },
  title: { fontSize: scaleText(32), color: COLORS.text, marginTop: scale(24) },
  subtitle: {
    fontSize: scaleText(16),
    color: COLORS.secondaryText,
    marginTop: scale(8),
  },
  formContainer: { marginTop: scale(24) },
  inputContainer: { marginBottom: scale(16) },
  label: {
    fontSize: scaleText(14),
    color: COLORS.text,
    marginBottom: scale(8),
  },
  pinDescription: {
    fontSize: scaleText(14),
    color: COLORS.secondaryText,
    marginBottom: scale(16),
  },
  confirmPinLabel: { marginTop: scale(24) },
  otpContainer: { width: "85%", marginRight: "auto" },
  imagePicker: {
    borderWidth: 1,
    borderColor: COLORS.secondaryText,
    borderRadius: 12,
    height: scale(150),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imagePickerError: { borderColor: COLORS.error },
  profileImage: { width: scale(120), height: scale(120), borderRadius: 12 },
  imagePlaceholder: { color: COLORS.secondaryText, fontSize: scaleText(14) },
  errorText: {
    color: COLORS.error,
    fontSize: scaleText(12),
    marginTop: scale(4),
    marginBottom: scale(8),
  },
  buttonContainer: { paddingVertical: scale(16), paddingHorizontal: scale(16) },
  button: {
    borderRadius: 12,
    paddingVertical: scale(12),
    backgroundColor: COLORS.primary,
  },
  sheetContent: { paddingHorizontal: scale(16), paddingVertical: scale(12) },
  sheetOption: {
    padding: scale(12),
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    marginBottom: scale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sheetText: { fontSize: scaleText(16), color: COLORS.text },
});

export default RegisterScreen;
