import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AcademicContext } from "../context/AcademicContext";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const Planner = () => {
  const { state, dispatch } = useContext(AcademicContext);

  const [actModalVisible, setActModalVisible] = useState(false);
  const [studyModalVisible, setStudyModalVisible] = useState(false);

  const months = [
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

  const [isEdit, setIsEdit] = useState(false);

  const [actForm, setActForm] = useState({
    id: "",
    title: "",
    detail: "",
    dayNum: "",
  });
  const [studyTitle, setStudyTitle] = useState("");

  const studyTasks = state.tasks.filter((t) => t.type === "study");
  const activityTasks = state.tasks.filter((t) => t.type === "activity");
  const completedTasks = studyTasks.filter((t) => t.completed).length;
  const progress =
    studyTasks.length > 0 ? (completedTasks / studyTasks.length) * 100 : 0;

  const handleOpenAddActivity = () => {
    setIsEdit(false);
    setActForm({ id: "", title: "", detail: "", date: "" });
    setActModalVisible(true);
  };

  const handleOpenEditActivity = (task) => {
    setIsEdit(true);
    setActForm(task);
    setActModalVisible(true);
  };

  const handleSaveActivity = () => {
    if (isEdit) {
      dispatch({ type: "UPDATE_ITEM", category: "tasks", payload: actForm });
    } else {
      dispatch({
        type: "ADD_TASK",
        payload: { ...actForm, type: "activity", completed: false },
      });
    }
    setActModalVisible(false);
  };

  const handleDeleteTask = (id, title) => {
    Alert.alert("ยืนยันการลบ", `คุณต้องการลบ "${title}" ใช่หรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        onPress: () => dispatch({ type: "DELETE_ITEM", category: "tasks", id }),
        style: "destructive",
      },
    ]);
  };

  const handleAddStudy = () => {
    dispatch({
      type: "ADD_TASK",
      payload: { title: studyTitle, type: "study", completed: false },
    });
    setStudyModalVisible(false);
    setStudyTitle("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.mainTitle}>กิจกรรม & แพลนเนอร์</Text>

        {/* ส่วนกิจกรรมนอกหลักสูตร - ปรับปรุงให้เหมือนแผนการอ่าน */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>📋 กิจกรรมนอกหลักสูตร</Text>
            <TouchableOpacity
              style={styles.AddBtn}
              onPress={handleOpenAddActivity}
            >
              <Text style={styles.AddBtnText}>+ เพิ่ม</Text>
            </TouchableOpacity>
          </View>
          {activityTasks.map((task) => (
            <View key={task.id} style={styles.activityItem}>
              {/* Checkbox สำหรับกิจกรรม */}
              <TouchableOpacity
                style={[
                  styles.uncheckCircle,
                  task.completed && styles.checkedCircle,
                ]}
                onPress={() =>
                  dispatch({ type: "TOGGLE_TASK", payload: task.id })
                }
              >
                {task.completed && (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                )}
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.activityName,
                    task.completed && styles.completedText,
                  ]}
                >
                  {task.title}
                </Text>
                <Text style={styles.activitySub}>
                  {task.detail || "ไม่มีรายละเอียด"}
                </Text>
                <Text style={styles.activityDate}>
                  📅 {task.date || "ไม่ระบุวันที่"}
                </Text>
              </View>

              {/* ปุ่มแก้ไขและลบ */}
              <View style={styles.actionIcons}>
                <TouchableOpacity onPress={() => handleOpenEditActivity(task)}>
                  <Ionicons name="pencil-outline" size={20} color="#74787B" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteTask(task.id, task.title)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#DC2626"
                    style={{ marginLeft: 15 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* ส่วนแผนการอ่านหนังสือ (คงเดิม) */}
        <View style={styles.sectionCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>📚 แผนการอ่านหนังสือ</Text>
            <TouchableOpacity
              style={styles.AddBtn}
              onPress={() => setStudyModalVisible(true)}
            >
              <Text style={styles.AddBtnText}>+ เพิ่ม</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.progressLabel}>
            ความคืบหน้า: {completedTasks} / {studyTasks.length} รายการ
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          {studyTasks.map((task) => (
            <View key={task.id} style={styles.checkTaskRow}>
              <TouchableOpacity
                style={[styles.checkBox, task.completed && styles.checkedBox]}
                onPress={() =>
                  dispatch({ type: "TOGGLE_TASK", payload: task.id })
                }
              >
                {task.completed && (
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                )}
              </TouchableOpacity>
              <Text
                style={[
                  styles.taskLabel,
                  task.completed && styles.completedText,
                ]}
              >
                {task.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteTask(task.id, task.title)}
              >
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal เพิ่ม/แก้ไข กิจกรรม */}
      <Modal visible={actModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEdit ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรม"}
              </Text>
              <TouchableOpacity onPress={() => setActModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>ชื่อกิจกรรม</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น ประชุมชมรม"
              value={actForm.title}
              onChangeText={(v) => setActForm({ ...actForm, title: v })}
            />
            <Text style={styles.label}>รายละเอียด</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="เพิ่มรายละเอียดเพิ่มเติม (ถ้ามี)"
              value={actForm.detail}
              onChangeText={(v) => setActForm({ ...actForm, detail: v })}
            />
            <Text style={styles.label}>วันที่</Text>
            <View style={styles.row}>
              <Picker
                style={{ flex: 1 }}
                selectedValue={actForm.dayNum}
                mode="dropdown"
                onValueChange={(v) => setActForm({ ...actForm, dayNum: v })}
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
                ))}
              </Picker>
              <Picker
                style={{ flex: 1 }}
                selectedValue={actForm.month}
                mode="dropdown"
                onValueChange={(v) => setActForm({ ...actForm, month: v })}
              >
                {months.map((m) => (
                  <Picker.Item key={m} label={m} value={m} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleSaveActivity}
              >
                <Text style={styles.confirmBtnText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setActModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal เพิ่มรายการอ่านหนังสือ (คงเดิม) */}
      <Modal visible={studyModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เพิ่มรายการ</Text>
              <TouchableOpacity onPress={() => setStudyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>รายการ</Text>
            <TextInput
              style={styles.input}
              placeholder="เช่น อ่านบท 5: Data Structures"
              value={studyTitle}
              onChangeText={setStudyTitle}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleAddStudy}
              >
                <Text style={styles.confirmBtnText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setStudyModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 25,
    color: "#006664",
  },
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  AddBtn: {
    backgroundColor: "#006664",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
  },
  AddBtnText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  activityItem: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  uncheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedCircle: {
    backgroundColor: "#B2BB1E",
    borderColor: "#B2BB1E",
  },
  activityName: { fontSize: 15, fontWeight: "bold" },
  activitySub: { fontSize: 12, color: "#64748B", marginVertical: 4 },
  activityDate: { fontSize: 11, color: "#6366F1", fontWeight: "bold" },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  progressLabel: { fontSize: 12, color: "#64748B", marginBottom: 8 },
  progressTrack: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginBottom: 20,
  },
  progressFill: { height: "100%", backgroundColor: "#006664", borderRadius: 4 },
  checkTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: { backgroundColor: "#006664", borderColor: "#006664" },
  taskLabel: { flex: 1, fontSize: 14, color: "#1E293B" },
  completedText: { textDecorationLine: "line-through", color: "#94A3B8" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#FFF", borderRadius: 20, padding: 25 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: "#F1F5F9", borderRadius: 10, padding: 12 },
  modalButtons: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 25,
  },
  confirmBtn: {
    backgroundColor: "#006664",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginLeft: 10,
  },
  confirmBtnText: { color: "#FFF", fontWeight: "bold" },
  cancelBtn: {
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelBtnText: { color: "#64748B", fontWeight: "bold" },
  row: { flexDirection: "row" },
});

export default Planner;
