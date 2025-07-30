import CustomButton from "@/components/common/CustomButton";
import CustomText from "@/components/common/CustomText";
import Header from "@/components/common/Header";
import { COLORS } from "@/constants/Colors";
import { scale, scaleText } from "@/constants/Layout";
import useApi from "@/hooks/useApi";
import { useAppStore } from "@/stores/useAppStore";
import { Storage } from "@/utility/asyncStorageHelper";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import Toast from "react-native-toast-message";

export default function OTPScreen() {
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const { phone, isRegistered } = useLocalSearchParams<{
    phone: string;
    isRegistered: string;
  }>();
  const { fetchData, loading } = useApi();
  const router = useRouter();
  const { setUser } = useAppStore();

  const sendCode = async () => {
    try {
      const otpResponse = await fetchData("post", "/auth/request-otp", {
        phone,
      });

      if (otpResponse.data) {
        console.log("otp-->", otpResponse.data);
        setResendTimer(30);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({
          type: "customToast",
          text1: "OTP sent successfully",
          props: { type: "Success" },
        });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: "customToast",
          text1: "Failed to send OTP",
          props: { type: "Error" },
        });
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "customToast",
        text1: err.response?.data?.message || "Failed to send OTP",
        props: { type: "Error" },
      });
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const verifyOtp = async () => {
    if (otp.length < 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "customToast",
        text1: "Please enter a 6-digit OTP",
        props: { type: "Error" },
      });
      return;
    }

    try {
      const { status, data } = await fetchData("post", "/auth/verify-otp", {
        phone,
        otp,
      });

      if (status === 200) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (isRegistered === "true" && data.token) {
          // User is registered, store token and user, then navigate to tabs
          await Storage.set("access_token", data.token);
          await setUser(
            {
              id: data.user.id,
              phone: data.user.phone,
              role: data.user.role,
              // name: data.user.name,
              // email: data.user.email,
              gender: data.user.gender,
            },
            data.token
          );
          router.push("/(tabs)");
        } else {
          // User is not registered, navigate to registration
          router.push({ pathname: "/(auth)/register", params: { phone } });
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: "customToast",
          text1: data.message || "Invalid OTP",
          props: { type: "Error" },
        });
      }
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: "customToast",
        text1: err.response?.data?.message || "Failed to verify OTP",
        props: { type: "Error" },
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ paddingHorizontal: scale(16) }}>
        <Header />
      </View>

      <View style={{ paddingHorizontal: scale(16) }}>
        <View style={{ paddingVertical: scale(12) }}>
          <CustomText
            fontWeight="Medium"
            style={{
              fontSize: scaleText(30),
              color: COLORS.text,
              marginBottom: scale(16),
            }}
          >
            Phone Verification
          </CustomText>
          <CustomText
            fontWeight="Medium"
            style={{
              fontSize: scaleText(14),
              color: COLORS.secondaryText,
            }}
          >
            We sent a verification code to your phone number{" "}
            <CustomText style={{ color: COLORS.primary }}>{phone}</CustomText>
          </CustomText>
        </View>

        <OtpInput
          numberOfDigits={6}
          blurOnFilled={true}
          type="numeric"
          hideStick={true}
          onTextChange={(t) => setOtp(t)}
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

        <View style={{ marginTop: scale(96), alignItems: "center" }}>
          {resendTimer > 0 ? (
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <CustomText
                fontWeight="Medium"
                style={{
                  fontSize: scaleText(12),
                  color: COLORS.secondaryText,
                  marginRight: scale(5),
                }}
              >
                Ask for a new code within
              </CustomText>
              <CustomText
                style={{ fontSize: scaleText(12), color: COLORS.primary }}
              >
                {`${Math.floor(resendTimer / 60)}:${String(
                  resendTimer % 60
                ).padStart(2, "0")}`}
              </CustomText>
            </View>
          ) : (
            <CustomText
              fontWeight="Medium"
              style={{
                fontSize: scaleText(12),
                color: COLORS.secondaryText,
              }}
            >
              Didn’t get the code?
            </CustomText>
          )}
          <CustomButton
            title="Resend code"
            disabled={resendTimer > 0}
            onPress={sendCode}
            backgroundColor="#FF450012"
            textStyles={{ color: resendTimer > 0 ? "#757575" : COLORS.primary }}
            style={{
              height: scale(30),
              width: scale(177),
              marginTop: scale(16),
            }}
          />
        </View>
      </View>
      <View
        style={{
          backgroundColor: "white",
          paddingVertical: scale(16),
          paddingHorizontal: scale(21),
          marginTop: "auto",
        }}
      >
        <CustomButton
          title="Verify"
          onPress={verifyOtp}
          loading={loading}
          disabled={loading || otp.length < 6}
        />
      </View>
    </SafeAreaView>
  );
}
