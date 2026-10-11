// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal, // เพิ่ม Modal
} from "react-native";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      if (error.code === "auth/user-not-found")
        errorMessage = "ไม่พบผู้ใช้งานนี้";
      if (error.code === "auth/wrong-password") errorMessage = "รหัสผ่านผิด";
      Alert.alert("เข้าสู่ระบบล้มเหลว", errorMessage);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      return Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลของคุณ");
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert(
        "สำเร็จ",
        "ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบ (รวมถึงใน Junk/Spam)",
      );
      setResetModalVisible(false);
      setResetEmail("");
    } catch (error) {
      let errorMessage = "ไม่สามารถส่งอีเมลรีเซ็ตได้";
      if (error.code === "auth/user-not-found")
        errorMessage = "ไม่พบอีเมลนี้ในระบบ";
      if (error.code === "auth/invalid-email")
        errorMessage = "รูปแบบอีเมลไม่ถูกต้อง";
      Alert.alert("เกิดข้อผิดพลาด", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>StudySync</Text>
      <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อจัดการชีวิตการเรียน</Text>

      <TextInput
        style={styles.input}
        placeholder="อีเมล"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="รหัสผ่าน"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* ปุ่มลืมรหัสผ่าน */}
      <TouchableOpacity
        style={styles.forgotPassBtn}
        onPress={() => {
          setResetEmail(email);
          setResetModalVisible(true);
        }}
      >
        <Text style={styles.forgotPassText}>ลืมรหัสผ่าน?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>ยังไม่มีบัญชี? สมัครสมาชิกที่นี่</Text>
      </TouchableOpacity>

      {/* Modal สำหรับกรอกอีเมลรีเซ็ตรหัสผ่าน */}
      <Modal visible={resetModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>รีเซ็ตรหัสผ่าน</Text>
            <Text style={styles.modalSub}>
              กรุณากรอกอีเมลเพื่อรับลิงก์ตั้งรหัสผ่านใหม่
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="ระบุอีเมลของคุณ"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#006664" }]}
                onPress={handleResetPassword}
              >
                <Text style={styles.btnTextWhite}>ส่งลิงก์</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setResetModalVisible(false)}
              >
                <Text style={styles.btnTextCancel}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#006664",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  forgotPassBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPassText: {
    color: "#006664",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#006664",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  linkText: {
    color: "#006664",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
  },
  // Styles สำหรับ Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1E293B",
  },
  modalSub: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  btnTextWhite: { color: "#FFF", fontWeight: "bold" },
  btnTextCancel: { color: "#64748B", fontWeight: "bold" },
});

export default LoginScreen;
