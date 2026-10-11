import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { AcademicContext } from "../context/AcademicContext";
import { Ionicons } from "@expo/vector-icons";

const Dashboard = ({ navigation }) => {
  const { state, dispatch } = useContext(AcademicContext);
  const [timeFilter, setTimeFilter] = useState("today");
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: "", detail: "", date: "" });

  const monthsThai = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const daysOrder = {
    อาทิตย์: 0,
    จันทร์: 1,
    อังคาร: 2,
    พุธ: 3,
    พฤหัสบดี: 4,
    ศุกร์: 5,
    เสาร์: 6,
  };

  const getCurrentDayThai = () => {
    const days = [
      "อาทิตย์",
      "จันทร์",
      "อังคาร",
      "พุธ",
      "พฤหัสบดี",
      "ศุกร์",
      "เสาร์",
    ];
    return days[new Date().getDay()];
  };

  const todayThai = getCurrentDayThai();

  // --- Logic การกรองวันที่สำหรับ กิจกรรม และ สอบ (ที่มีวันที่ระบุ) ---
  const isInRange = (dayNum, monthStr, range) => {
    if (range === "today") return true; // กรองชั้นนอกแล้ว
    if (!dayNum || !monthStr) return false;

    const now = new Date();
    const itemDate = new Date();
    const monthIndex = monthsThai.indexOf(monthStr);

    if (monthIndex === -1) return false;

    itemDate.setDate(parseInt(dayNum));
    itemDate.setMonth(monthIndex);
    itemDate.setFullYear(now.getFullYear());

    // ป้องกันกรณีข้ามปี (เช่น ตอนนี้ ธ.ค. ดูของ ม.ค. ปีหน้า)
    if (itemDate < now && range !== "today") {
      // ถ้าวันที่ผ่านไปแล้ว แต่อยู่ใน logic week/month อาจต้องเช็คปีด้วย
      // แต่ในที่นี้สมมติว่าเป็นปีปัจจุบันหรืออนาคตใกล้ๆ
    }

    const diffTime = itemDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (range === "week") return diffDays >= -1 && diffDays <= 7;
    if (range === "month") return diffDays >= -1 && diffDays <= 30;

    return true;
  };

  // --- Logic การเตรียมข้อมูล ตารางเรียน (Recurring) ---
  const getDisplayClasses = () => {
    let classes = [...state.classes];

    if (timeFilter === "today") {
      // ถ้าวันนี้: กรองเอาเฉพาะวันปัจจุบัน
      return classes
        .filter((c) => c.day === todayThai)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    } else {
      // ถ้าสัปดาห์/เดือน: เอาทั้งหมดมาเรียงตามวัน (จันทร์ -> ศุกร์)
      return classes.sort((a, b) => {
        const dayDiff = daysOrder[a.day] - daysOrder[b.day];
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      });
    }
  };

  const displayClasses = getDisplayClasses();

  // --- Logic การเตรียมข้อมูล สอบ และ กิจกรรม ---
  const displayExams = state.exams
    .filter((exam) => {
      // 1. กรอง "วันนี้" ให้ตรงวันจริงๆ
      if (timeFilter === "today") {
        const now = new Date();
        return (
          parseInt(exam.dayNum) === now.getDate() &&
          exam.month === monthsThai[now.getMonth()]
        );
      }
      // 2. กรองช่วงเวลาอื่น
      return isInRange(exam.dayNum, exam.month, timeFilter);
    })
    .sort((a, b) => {
      // เรียงลำดับตามเดือนและวัน
      const mDiff = monthsThai.indexOf(a.month) - monthsThai.indexOf(b.month);
      if (mDiff !== 0) return mDiff;
      return parseInt(a.dayNum) - parseInt(b.dayNum);
    })
    .slice(0, timeFilter === "today" ? 5 : 10);

  const displayActivities = state.tasks
    .filter((t) => t.type === "activity")
    .filter((task) => {
      if (timeFilter === "today") {
        const now = new Date();
        // ถ้าไม่ได้ระบุวัน ให้โชว์ใน today ไว้ก่อน หรือจะกรองออกก็ได้
        if (!task.dayNum) return true;
        return (
          parseInt(task.dayNum) === now.getDate() &&
          task.month === monthsThai[now.getMonth()]
        );
      }
      return isInRange(task.dayNum, task.month, timeFilter);
    })
    .slice(0, timeFilter === "today" ? 5 : 10);

  // ฟังก์ชันเพิ่มกิจกรรมด่วน
  const handleAddActivity = () => {
    if (!form.title) return;

    const now = new Date();
    const currentDayNum = now.getDate().toString();
    const currentMonthThai = monthsThai[now.getMonth()];

    dispatch({
      type: "ADD_TASK",
      payload: {
        ...form,
        type: "activity",
        completed: false,
        dayNum: currentDayNum,
        month: currentMonthThai,
        date: `${currentDayNum} ${currentMonthThai}`,
      },
    });
    setModalVisible(false);
    setForm({ title: "", detail: "", date: "" });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={["#006664", "#7CBB1E"]}
          style={styles.headerCard}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>สวัสดี, {state.user.name}</Text>
              <Text style={styles.subGreeting}>
                {state.user.faculty} • {state.user.year}
              </Text>
              <Text style={styles.todayLabel}>📅 วันนี้วัน{todayThai}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={styles.filterBar}>
          {["today", "week", "month"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                timeFilter === f && styles.filterBtnActive,
              ]}
              onPress={() => setTimeFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  timeFilter === f && styles.filterTextActive,
                ]}
              >
                {f === "today"
                  ? "วันนี้"
                  : f === "week"
                    ? "สัปดาห์นี้"
                    : "เดือนนี้"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ส่วนแสดงตารางเรียน (ปรับปรุงใหม่ให้แสดงเป็นรายการ) */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: "#006664" }]}>
            🕒 คาบเรียน
          </Text>
          {displayClasses.length > 0 ? (
            displayClasses.map((item, index) => (
              <View key={index} style={styles.classItemBox}>
                <View>
                  <Text style={styles.subjectName}>{item.name}</Text>
                  <Text style={styles.valueSmall}>
                    {/* ถ้าไม่ใช่ filter วันนี้ ให้แสดงวันกำกับด้วย */}
                    {timeFilter !== "today" && (
                      <Text style={{ fontWeight: "bold", color: "#006664" }}>
                        {item.day} |{" "}
                      </Text>
                    )}
                    {item.startTime} - {item.endTime} | ห้อง {item.room}
                  </Text>
                  {item.code ? (
                    <Text style={styles.codeText}>รหัส: {item.code}</Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              {timeFilter === "today"
                ? `ไม่มีเรียนวัน${todayThai}`
                : "ไม่มีตารางเรียน"}
            </Text>
          )}
        </View>

        {/* ส่วนแสดงกิจกรรม */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: "#B2BB1E" }]}>
            🌟 กิจกรรม
          </Text>
          {displayActivities.length > 0 ? (
            displayActivities.map((task) => (
              <View key={task.id} style={styles.activityRow}>
                <Ionicons name="ellipse" size={8} color="#B2BB1E" />
                <View>
                  <Text style={styles.activityText}>{task.title}</Text>
                  {/* แสดงวันที่ถ้าระบุไว้ */}
                  {task.date && (
                    <Text style={styles.dateSubText}>{task.date}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>ไม่มีกิจกรรมในช่วงนี้</Text>
          )}
        </View>

        {/* ส่วนแสดงตารางสอบ */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: "#6E4B32" }]}>
            ⚠️ ตารางสอบ
          </Text>
          {displayExams.length > 0 ? (
            displayExams.map((exam) => (
              <View key={exam.id} style={styles.examItem}>
                <Text style={styles.examName}>{exam.name}</Text>
                <Text style={styles.examTimeText}>
                  {exam.dayNum} {exam.month} | {exam.time} | ห้อง {exam.room}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>ยังไม่มีรายการสอบที่กำหนดไว้</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.btnAddQuick}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.btnTextWhite}>+ เพิ่มกิจกรรมด่วน</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal เพิ่มกิจกรรมด่วน */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มกิจกรรมด่วน</Text>
            <TextInput
              style={styles.textInput}
              placeholder="ชื่อกิจกรรม"
              value={form.title}
              onChangeText={(v) => setForm({ ...form, title: v })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#006664" }]}
                onPress={handleAddActivity}
              >
                <Text style={styles.btnTextWhite}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dateSubText: { fontSize: 10, color: "#94A3B8", marginLeft: 10 },
  safeArea: { flex: 1, backgroundColor: "#F8F9F9" },
  scrollContent: { padding: 20 },
  headerCard: { padding: 20, borderRadius: 20, marginBottom: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
  },
  subGreeting: { color: "#FFD800", fontSize: 16, marginBottom: 5 },
  todayLabel: { color: "#FFF", fontSize: 14, opacity: 0.9 },
  filterBar: {
    flexDirection: "row",
    backgroundColor: "#E0E4E4",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  filterBtnActive: { backgroundColor: "#FFF" },
  filterText: { fontSize: 16, color: "#74787B" },
  filterTextActive: { color: "#006664", fontWeight: "bold" },
  sectionCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },

  // Style สำหรับกล่องวิชาเรียนแบบใหม่
  classItemBox: {
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#006664",
  },

  subjectName: { fontSize: 16, fontWeight: "bold", color: "#006664" },
  valueSmall: { fontSize: 12, color: "#64748B", marginTop: 4 },
  codeText: { fontSize: 10, color: "#94A3B8", marginTop: 2 },

  activityRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  activityText: { marginLeft: 10, fontSize: 14 },
  examItem: {
    backgroundColor: "#FFFDE7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  examName: { fontWeight: "bold" },
  examTimeText: { fontSize: 11, color: "#6E4B32" },
  emptyText: { color: "#94A3B8", textAlign: "center", fontStyle: "italic" },
  btnAddQuick: {
    backgroundColor: "#006664",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  btnTextWhite: { color: "#FFF", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#FFF", borderRadius: 20, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  textInput: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  modalBtn: {
    padding: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
});

export default Dashboard;
