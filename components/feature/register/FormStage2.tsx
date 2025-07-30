import CustomText from "@/components/common/CustomText";
import React from "react";
import { Animated, Image, TouchableOpacity } from "react-native";

const FormStage2 = ({
  fadeAnim,
  handlePresentImageSourceModal,
  errors,
  profilePicture,
  styles,
}: any) => {
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <CustomText fontWeight="Medium" style={styles.label}>
        Profile Picture
      </CustomText>
      <TouchableOpacity
        onPress={handlePresentImageSourceModal}
        style={[
          styles.imagePicker,
          errors.profilePicture && styles.imagePickerError,
        ]}
        accessible
      >
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.profileImage} />
        ) : (
          <CustomText fontWeight="Medium" style={styles.imagePlaceholder}>
            Tap to select or take a profile picture
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
};

export default FormStage2;
