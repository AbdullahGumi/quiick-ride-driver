import CustomText from "@/components/common/CustomText";
import { COLORS } from "@/constants/Colors";
import { scale, scaleText } from "@/constants/Layout";
import React from "react";
import { Animated, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";

const FormStage3 = ({ fadeAnim, styles, updateFormState, errors }: any) => {
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <CustomText fontWeight="Medium" style={styles.label}>
        Create a 4-digit PIN
      </CustomText>
      <CustomText fontWeight="Regular" style={styles.pinDescription}>
        This PIN will be used to securely log in to your account or request
        payouts.
      </CustomText>
      <View style={styles.otpContainer}>
        <OtpInput
          secureTextEntry
          numberOfDigits={4}
          blurOnFilled={true}
          type="numeric"
          hideStick={true}
          autoFocus={true}
          onTextChange={(text) => updateFormState("pin", text)}
          focusColor="transparent"
          theme={{
            pinCodeTextStyle: {
              fontFamily: "WorkSans-SemiBold",
              fontSize: scaleText(18),
              color: COLORS.text,
            },
            pinCodeContainerStyle: {
              backgroundColor: "white",
              width: scale(46),
              height: scale(44),
            },
            focusedPinCodeContainerStyle: {
              borderWidth: 1,
              borderColor: COLORS.primary,
            },
          }}
        />
      </View>
      {errors.pin && (
        <CustomText style={styles.errorText}>{errors.pin}</CustomText>
      )}
      <CustomText
        fontWeight="Medium"
        style={[styles.label, styles.confirmPinLabel]}
      >
        Confirm your 4-digit PIN
      </CustomText>
      <View style={styles.otpContainer}>
        <OtpInput
          autoFocus={false}
          secureTextEntry
          numberOfDigits={4}
          blurOnFilled={true}
          type="numeric"
          hideStick={true}
          onTextChange={(text) => updateFormState("confirmPin", text)}
          focusColor="transparent"
          theme={{
            pinCodeTextStyle: {
              fontFamily: "WorkSans-SemiBold",
              fontSize: scaleText(18),
              color: COLORS.text,
            },
            pinCodeContainerStyle: {
              backgroundColor: "white",
              width: scale(46),
              height: scale(44),
            },
            focusedPinCodeContainerStyle: {
              borderWidth: 1,
              borderColor: COLORS.primary,
            },
          }}
        />
      </View>
      {errors.confirmPin && (
        <CustomText style={styles.errorText}>{errors.confirmPin}</CustomText>
      )}
    </Animated.View>
  );
};

export default FormStage3;
