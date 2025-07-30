import CustomInput from "@/components/common/CustomInput";
import { COLORS } from "@/constants/Colors";
import React from "react";
import { Animated } from "react-native";

const FormStage4 = ({
  fadeAnim,
  updateFormState,
  vehicleNumber,
  errors,
  styles,
  plateNumber,
}: any) => {
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <CustomInput
        placeholder="Enter vehicle number"
        placeholderTextColor={COLORS.secondaryText}
        label="Vehicle Number"
        value={vehicleNumber}
        onChangeText={(text) => updateFormState("vehicleNumber", text)}
        error={errors.vehicleNumber}
        required
        containerStyle={styles.inputContainer}
      />
      <CustomInput
        placeholder="Enter plate number"
        placeholderTextColor={COLORS.secondaryText}
        label="Plate Number"
        value={plateNumber}
        onChangeText={(text) => updateFormState("plateNumber", text)}
        error={errors.plateNumber}
        required
        containerStyle={styles.inputContainer}
      />
    </Animated.View>
  );
};

export default FormStage4;
