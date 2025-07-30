import { authApi } from "@/api/endpoints/auth";
import { ChevronIcon } from "@/assets/svg";
import CustomButton from "@/components/common/CustomButton";
import CustomInput from "@/components/common/CustomInput";
import CustomText from "@/components/common/CustomText";
import Header from "@/components/common/Header";
import { COLORS } from "@/constants/Colors";
import { CONSTANTS } from "@/constants/constants";
import { scale, scaleText } from "@/constants/Layout";
import { useAppStore } from "@/stores/useAppStore";
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
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const RegisterScreen = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [nin, setNIN] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");

  const { phone }: any = useLocalSearchParams();
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%"], []);
  const setUser = useAppStore((state) => state.setUser);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

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

  const validateStage1 = () => {
    const newErrors: any = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!gender) newErrors.gender = "Gender is required";
    if (!nin.trim()) newErrors.nin = "NIN is required";
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStage2 = () => {
    const newErrors: any = {};
    if (!profilePicture)
      newErrors.profilePicture = "Profile picture is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStage3 = () => {
    const newErrors: any = {};
    if (!vehicleNumber.trim())
      newErrors.vehicleNumber = "Vehicle number is required";
    if (!plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
      setErrors((prev: any) => ({ ...prev, profilePicture: undefined }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (step === 1 && validateStage1()) {
      setStep(2);
      fadeAnim.setValue(0);
    } else if (step === 2 && validateStage2()) {
      setStep(3);
      fadeAnim.setValue(0);
    } else if (step === 3 && validateStage3()) {
      try {
        setLoading(true);
        const { data } = await authApi.register({
          email,
          name: `${firstName} ${lastName}`,
          gender,
          phone,
          role: CONSTANTS.USER_ROLE,
          nin,
          profilePicture,
        });

        if (data.token) {
          setUser(data.user);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.push(`/(tabs)`);
        }
      } catch (err: any) {
        setErrors({ api: err.response?.data?.error || "Registration failed" });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setLoading(false);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep(step - 1);
      fadeAnim.setValue(0);
    } else {
      router.back();
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          style={[
            styles.progressStep,
            s <= step ? styles.progressStepActive : styles.progressStepInactive,
          ]}
        />
      ))}
    </View>
  );

  const renderStage = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <CustomInput
              editable={!isBottomSheetOpen}
              placeholder="Enter first name"
              placeholderTextColor={COLORS.secondaryText}
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              error={errors.firstName}
              required
              containerStyle={styles.inputContainer}
            />
            <CustomInput
              editable={!isBottomSheetOpen}
              placeholder="Enter last name"
              placeholderTextColor={COLORS.secondaryText}
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
              error={errors.lastName}
              required
              containerStyle={styles.inputContainer}
            />
            <CustomInput
              editable={!isBottomSheetOpen}
              placeholder="Enter your email (optional)"
              placeholderTextColor={COLORS.secondaryText}
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={styles.inputContainer}
            />
            <Pressable onPress={handlePresentModal} accessible>
              <CustomInput
                editable={false}
                placeholder="Select gender"
                required
                placeholderTextColor={COLORS.secondaryText}
                label="Gender"
                value={
                  gender === "male"
                    ? "Male"
                    : gender === "female"
                    ? "Female"
                    : ""
                }
                suffix={
                  <View style={styles.chevron}>
                    <ChevronIcon color={COLORS.secondaryText} />
                  </View>
                }
                onPress={handlePresentModal}
                caretHidden
                showSoftInputOnFocus={false}
                error={errors.gender}
                containerStyle={styles.inputContainer}
              />
            </Pressable>
            <CustomInput
              editable={!isBottomSheetOpen}
              placeholder="Enter NIN"
              placeholderTextColor={COLORS.secondaryText}
              keyboardType="number-pad"
              label="National Identification Number (NIN)"
              value={nin}
              onChangeText={setNIN}
              error={errors.nin}
              required
              containerStyle={styles.inputContainer}
            />
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <CustomText fontWeight="Medium" style={styles.label}>
              Profile Picture
            </CustomText>
            <TouchableOpacity
              onPress={pickImage}
              style={[
                styles.imagePicker,
                errors.profilePicture && styles.imagePickerError,
              ]}
              accessible
            >
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.profileImage}
                />
              ) : (
                <CustomText fontWeight="Medium" style={styles.imagePlaceholder}>
                  Tap to select profile picture
                </CustomText>
              )}
            </TouchableOpacity>
            {errors.profilePicture && (
              <CustomText style={styles.errorText}>
                {errors.profilePicture}
              </CustomText>
            )}
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <CustomInput
              placeholder="Enter vehicle number"
              placeholderTextColor={COLORS.secondaryText}
              label="Vehicle Number"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              error={errors.vehicleNumber}
              required
              containerStyle={styles.inputContainer}
            />
            <CustomInput
              placeholder="Enter plate number"
              placeholderTextColor={COLORS.secondaryText}
              label="Plate Number"
              value={plateNumber}
              onChangeText={setPlateNumber}
              error={errors.plateNumber}
              required
              containerStyle={styles.inputContainer}
            />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={handleCloseModal}>
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
              title={step === 3 ? "Submit" : "Continue"}
              onPress={handleContinue}
              loading={loading}
              disabled={
                loading ||
                (step === 1 && (!firstName || !lastName || !gender || !nin)) ||
                (step === 2 && !profilePicture) ||
                (step === 3 && (!vehicleNumber || !plateNumber))
              }
              style={styles.button}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
      <BottomSheetModalProvider>
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
            <TouchableOpacity
              onPress={() => {
                setGender("male");
                handleCloseModal();
              }}
              style={styles.sheetOption}
              accessible
            >
              <CustomText fontWeight="Medium" style={styles.sheetText}>
                Male
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setGender("female");
                handleCloseModal();
              }}
              style={styles.sheetOption}
              accessible
            >
              <CustomText fontWeight="Medium" style={styles.sheetText}>
                Female
              </CustomText>
            </TouchableOpacity>
          </View>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scale(20),
  },
  innerContainer: {
    paddingHorizontal: scale(16),
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: scale(16),
  },
  progressStep: {
    width: scale(80),
    height: scale(4),
    borderRadius: scale(2),
    marginHorizontal: scale(4),
  },
  progressStepActive: {
    backgroundColor: COLORS.primary,
  },
  progressStepInactive: {
    backgroundColor: COLORS.secondaryText,
  },
  title: {
    fontSize: scaleText(32),
    color: COLORS.text,
    marginTop: scale(24),
  },
  subtitle: {
    fontSize: scaleText(16),
    color: COLORS.secondaryText,
    marginTop: scale(8),
  },
  formContainer: {
    marginTop: scale(24),
  },
  inputContainer: {
    marginBottom: scale(16),
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.secondaryText,
    padding: scale(12),
    backgroundColor: COLORS.inputBackground,
    fontSize: scaleText(16),
  },
  chevron: {
    marginRight: scale(16),
    transform: [{ rotate: "90deg" }],
  },
  label: {
    fontSize: scaleText(14),
    color: COLORS.text,
    marginBottom: scale(8),
  },
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
  imagePickerError: {
    borderColor: COLORS.error,
  },
  profileImage: {
    width: scale(120),
    height: scale(120),
    borderRadius: 12,
  },
  imagePlaceholder: {
    color: COLORS.secondaryText,
    fontSize: scaleText(14),
  },
  errorText: {
    color: COLORS.error,
    fontSize: scaleText(12),
    marginTop: scale(4),
  },
  buttonContainer: {
    paddingVertical: scale(16),
    paddingHorizontal: scale(16),
  },
  button: {
    borderRadius: 12,
    paddingVertical: scale(12),
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: scaleText(16),
    fontWeight: "600",
    color: COLORS.white,
  },
  bottomSheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheetBackground: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetHandle: {
    backgroundColor: COLORS.secondaryText,
    width: scale(40),
    height: scale(4),
  },
  sheetContent: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
  },
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
  sheetText: {
    fontSize: scaleText(16),
    color: COLORS.text,
  },
});

export default RegisterScreen;
