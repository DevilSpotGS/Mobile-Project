// src/screens/Profile.js
import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AcademicContext } from "../context/AcademicContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const Profile = () => {
  const { state, dispatch } = useContext(AcademicContext);

  const [name, setName] = useState("");

  useEffect(() => {
    if (state.user && state.user.name !== "กำลังโหลด...") {
      setName(state.user.name || "");
    }
  }, [state.user]);

  const handleSave = () => {
    if (!name) {
      return Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อ-นามสกุล");
    }

    dispatch({
      type: "UPDATE_USER",
      payload: { name },
    });

    Alert.alert("สำเร็จ", "อัปเดตชื่อโปรไฟล์เรียบร้อยแล้ว");
  };

  const handleClearAcademicData = () => {
    Alert.alert(
      "ยืนยันการล้างข้อมูล",
      "คุณต้องการลบข้อมูลวิชาเรียน ตารางสอบ และกิจกรรมทั้งหมดใช่หรือไม่? \n(ข้อมูลส่วนตัวจะยังอยู่)",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบข้อมูล",
          style: "destructive",
          onPress: () => dispatch({ type: "CLEAR_DATA" }),
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        onPress: () => signOut(auth),
        style: "destructive",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>โปรไฟล์ส่วนตัว</Text>

        {/* ส่วนแสดงรูปภาพโปรไฟล์ และอีเมล */}
        <View style={styles.headerCard}>
          {state.user.profileImage ? (
            <Image
              source={{ uri: state.user.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {state.user.name && state.user.name !== "กำลังโหลด..."
                  ? state.user.name.substring(0, 1).toUpperCase()
                  : "👤"}
              </Text>
            </View>
          )}
          <Text style={styles.displayName}>
            {state.user.name || "กำลังโหลด..."}
          </Text>
          <Text style={styles.displayEmail}>
            {state.user.email || "กำลังโหลด..."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📝 แก้ไขข้อมูลส่วนตัว</Text>

          <Text style={styles.label}>ชื่อ-นามสกุล</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="ระบุชื่อ-นามสกุล"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>บันทึกชื่อใหม่</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🎓 ข้อมูลการศึกษา</Text>
          <Text style={styles.infoSubtitle}>(ข้อมูลจากระบบลงทะเบียน)</Text>

          <Text style={styles.label}>คณะ</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{state.user.faculty || "-"}</Text>
          </View>

          <Text style={styles.label}>สาขาที่เรียน</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{state.user.major || "-"}</Text>
          </View>

          <Text style={styles.label}>ระดับชั้นปี</Text>
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{state.user.year || "-"}</Text>
          </View>
        </View>

        <View style={[styles.card, { borderColor: "#FEE2E2", borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: "#DC2626" }]}>
            ⚠️ การตั้งค่าบัญชี
          </Text>

          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearAcademicData}
          >
            <Text style={styles.clearBtnText}>
              🗑️ ล้างข้อมูลการเรียนทั้งหมด
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>ออกจากระบบ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  container: { paddingHorizontal: 20 },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
    color: "#006664",
  },

  headerCard: {
    alignItems: "center",
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    elevation: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#006664",
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#006664",
  },
  profileInitial: { fontSize: 40, fontWeight: "bold", color: "#64748B" },
  displayName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 5,
  },
  displayEmail: { fontSize: 14, color: "#64748B" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1E293B",
  },
  infoSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: -10,
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 2,
  },

  input: {
    backgroundColor: "#F1F5F9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    color: "#1E293B",
  },

  readOnlyBox: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  readOnlyText: { fontSize: 15, color: "#475569", fontWeight: "500" },

  saveBtn: {
    backgroundColor: "#006664",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  saveBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  clearBtn: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  clearBtnText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutBtn: {
    backgroundColor: "#FFF",
    borderColor: "#DC2626",
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  logoutBtnText: { color: "#DC2626", fontWeight: "bold", fontSize: 16 },
});

export default Profile;
