import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dt8ob1yeg/image/upload";
const UPLOAD_PRESET = "vghmdx8l";

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [faculty, setFaculty] = useState("เกษตร");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("ปี 1");

  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri) => {
    const data = new FormData();
    data.append("file", { uri, type: "image/jpeg", name: "profile.jpg" });
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUDINARY_URL);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: "post",
        body: data,
      });
      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error("Cloudinary Error:", error);
      return null;
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name)
      return Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบ");
    setLoading(true);

    try {
      let profileImageUrl = "";
      if (imageUri) {
        profileImageUrl = await uploadToCloudinary(imageUri);
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        profileImage: profileImageUrl,
        faculty: faculty,
        major: major,
        year: year,
        createdAt: new Date(),
      });
    } catch (error) {
      Alert.alert("สมัครสมาชิกผิดพลาด", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>สร้างบัญชีใหม่</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePickerBtn}>
        <Text style={styles.imagePickerText}>
          {imageUri ? "✅ เลือกรูปภาพโปรไฟล์แล้ว" : "เลือกรูปโปรไฟล์"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>ชื่อ-นามสกุล</Text>
      <TextInput
        style={styles.input}
        placeholder="ระบุชื่อ-นามสกุล"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>อีเมล</Text>
      <TextInput
        style={styles.input}
        placeholder="ระบุอีเมล"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>รหัสผ่าน</Text>
      <TextInput
        style={styles.input}
        placeholder="ระบุรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>คณะ</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={faculty} onValueChange={setFaculty}>
          <Picker.Item label="เกษตร" value="เกษตร" />
          <Picker.Item
            label="ศิลปศาสตร์และวิทยาศาสตร์"
            value="ศิลปศาสตร์และวิทยาศาสตร์"
          />
          <Picker.Item label="วิศวกรรมศาสตร์" value="วิศวกรรมศาสตร์" />
          <Picker.Item
            label="ศึกษาศาสตร์และพัฒนศาสตร์"
            value="ศึกษาศาสตร์และพัฒนศาสตร์"
          />
          <Picker.Item
            label="วิทยาศาสตร์การกีฬาและสุขภาพ"
            value="วิทยาศาสตร์การกีฬาและสุขภาพ"
          />
          <Picker.Item label="อุตสาหกรรมบริการ" value="อุตสาหกรรมบริการ" />
          <Picker.Item
            label="ประมง"
            value="ประมง"
          />
          <Picker.Item label="สัตวแพทยศาสตร์" value="สัตวแพทยศาสตร์" />
        </Picker>
      </View>

      <Text style={styles.label}>สาขาที่เรียน</Text>
      <TextInput
        style={styles.input}
        placeholder="เช่น วิทยาการคอมพิวเตอร์"
        value={major}
        onChangeText={setMajor}
      />

      <Text style={styles.label}>ชั้นปี</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={year} onValueChange={setYear}>
          <Picker.Item label="ปี 1" value="ปี 1" />
          <Picker.Item label="ปี 2" value="ปี 2" />
          <Picker.Item label="ปี 3" value="ปี 3" />
          <Picker.Item label="ปี 4" value="ปี 4" />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>สมัครสมาชิก</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
        <Text style={styles.linkText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
    paddingBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#006664",
    textAlign: "center",
    marginBottom: 25,
    marginTop: 20,
  },
  imagePickerBtn: {
    alignSelf: "center",
    backgroundColor: "#E2E8F0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  imagePickerText: {
    color: "#475569",
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#64748B",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pickerWrapper: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 15,
    overflow: "hidden",
  },
  button: {
    backgroundColor: "#006664",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  linkText: {
    color: "#006664",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
    marginBottom: 30,
  },
});

export default RegisterScreen;
