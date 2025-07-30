import { ChevronIcon } from "@/assets/svg";
import CustomInput from "@/components/common/CustomInput";
import { COLORS } from "@/constants/Colors";
import { scale } from "@/constants/Layout";
import React from "react";
import { Animated, Keyboard, Pressable, View } from "react-native";

const FormStage1 = ({
  updateFormState,
  errors,
  firstName,
  lastName,
  email,
  gender,
  nin,
  isBottomSheetOpen,
  handlePresentModal,
  fadeAnim,
}: any) => {
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <CustomInput
        editable={!isBottomSheetOpen}
        placeholder="Enter first name"
        placeholderTextColor={COLORS.secondaryText}
        label="First name"
        value={firstName}
        onChangeText={(text) => updateFormState("firstName", text)}
        error={errors.firstName}
        required
        containerStyle={{
          marginBottom: scale(16),
        }}
      />
      <CustomInput
        editable={!isBottomSheetOpen}
        placeholder="Enter last name"
        placeholderTextColor={COLORS.secondaryText}
        label="Last name"
        value={lastName}
        onChangeText={(text) => updateFormState("lastName", text)}
        error={errors.lastName}
        required
        containerStyle={{
          marginBottom: scale(16),
        }}
      />
      <CustomInput
        editable={!isBottomSheetOpen}
        placeholder="Enter your email (optional)"
        placeholderTextColor={COLORS.secondaryText}
        label="Email"
        value={email}
        onChangeText={(text) => updateFormState("email", text)}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={{
          marginBottom: scale(16),
        }}
      />
      <Pressable onPress={handlePresentModal} accessible>
        <CustomInput
          editable={false}
          placeholder="Select gender"
          required
          placeholderTextColor={COLORS.secondaryText}
          label="Gender"
          value={
            gender === "male" ? "Male" : gender === "female" ? "Female" : ""
          }
          suffix={
            <View
              style={{
                marginRight: scale(16),
                transform: [{ rotate: "90deg" }],
              }}
            >
              <ChevronIcon color={COLORS.secondaryText} />
            </View>
          }
          onPress={handlePresentModal}
          caretHidden
          showSoftInputOnFocus={false}
          error={errors.gender}
          containerStyle={{
            marginBottom: scale(16),
          }}
        />
      </Pressable>
      <CustomInput
        editable={!isBottomSheetOpen}
        placeholder="Enter NIN"
        placeholderTextColor={COLORS.secondaryText}
        keyboardType="number-pad"
        label="National Identification Number (NIN)"
        value={nin}
        onChangeText={(text) => {
          if (text.length === 11) Keyboard.dismiss();
          if (text.length <= 11) updateFormState("nin", text);
        }}
        error={errors.nin}
        required
        containerStyle={{
          marginBottom: scale(16),
        }}
        maxLength={11}
      />
    </Animated.View>
  );
};

export default FormStage1;
