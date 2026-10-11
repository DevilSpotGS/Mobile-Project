import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import {
  AcademicContext,
  timeToNumber,
  isTimeOverlapping,
} from "../context/AcademicContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";

const Timetable = () => {
  const { state, dispatch } = useContext(AcademicContext);
  const [activeTab, setActiveTab] = useState("เรียน");
  const [selectedDay, setSelectedDay] = useState("จันทร์");
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const timeOptions = [
    "--:--",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    room: "",
    day: "จันทร์",
    startTime: "",
    endTime: "",
    date: "",
    time: "",
  });

  const days = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
  const examdays = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
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

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormData({
      id: "",
      name: "",
      code: "",
      room: "",
      day: selectedDay,
      startTime: "",
      endTime: "",
      dayNum: "",
      month: "",
      time: "",
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (item) => {
    setIsEdit(true);
    setFormData(item);
    setModalVisible(true);
  };

  const handleSave = () => {
    const category = activeTab === "เรียน" ? "classes" : "exams";

    if (activeTab === "เรียน") {
      const newStart = timeToNumber(formData.startTime);
      const newEnd = timeToNumber(formData.endTime);

      if (!formData.startTime || !formData.endTime) {
        Alert.alert("ข้อมูลไม่ครบ", "กรุณาระบุเวลาเริ่มและเวลาจบ");
        return;
      }
      if (newStart >= newEnd) {
        Alert.alert("เวลาไม่ถูกต้อง", "เวลาจบต้องมาหลังเวลาเริ่ม");
        return;
      }

      const overlappingClass = state.classes.find((item) => {
        if (isEdit && item.id === formData.id) return false;

        if (item.day === formData.day) {
          const existingStart = timeToNumber(item.startTime);
          const existingEnd = timeToNumber(item.endTime);
          return isTimeOverlapping(
            newStart,
            newEnd,
            existingStart,
            existingEnd,
          );
        }
        return false;
      });

      if (overlappingClass) {
        Alert.alert(
          "เวลาซ้อนกัน!",
          `ไม่สามารถบันทึกได้ เนื่องจากเวลาทับซ้อนกับวิชา: ${overlappingClass.name} (${overlappingClass.startTime} - ${overlappingClass.endTime})`,
        );
        return;
      }
    }
    if (isEdit) {
      dispatch({ type: "UPDATE_ITEM", category, payload: formData });
    } else {
      const type = activeTab === "เรียน" ? "ADD_CLASS" : "ADD_EXAM";
      dispatch({ type: type, payload: formData });
    }
    setModalVisible(false);
  };

  const handleDelete = (id, name) => {
    const category = activeTab === "เรียน" ? "classes" : "exams";
    Alert.alert("ยืนยันการลบ", `คุณต้องการลบ ${name} ใช่หรือไม่?`, [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        onPress: () => dispatch({ type: "DELETE_ITEM", category, id }),
        style: "destructive",
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemCard, activeTab === "สอบ" && styles.examCard]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSub}>{item.code}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.footerText}>
            {activeTab === "เรียน"
              ? `🕒 ${item.startTime}-${item.endTime}`
              : `📅 ${item.day} - ${item.dayNum} - ${item.month} `}
          </Text>
          <Text style={styles.footerText}>📍 {item.room}</Text>
        </View>
      </View>
      <View style={styles.actionIcons}>
        <TouchableOpacity onPress={() => handleOpenEdit(item)}>
          <Ionicons name="pencil-outline" size={20} color="#74787B" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
          <Ionicons
            name="trash-outline"
            size={20}
            color="#DC2626"
            style={{ marginLeft: 15 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "เรียน" && styles.activeTab]}
            onPress={() => setActiveTab("เรียน")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "เรียน" && { color: "#006664" },
              ]}
            >
              ตารางเรียน
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "สอบ" && styles.activeTab]}
            onPress={() => setActiveTab("สอบ")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "สอบ" && { color: "#006664" },
              ]}
            >
              ตารางสอบ
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "เรียน" && (
          <View style={styles.dayScroll}>
            {days.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayBtn,
                  selectedDay === day && styles.activeDayBtn,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDay === day && { color: "#FFF" },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.contentCard}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {activeTab === "เรียน" ? `วัน${selectedDay}` : "ตารางสอบ"}
            </Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
              <Text style={{ color: "#FFF", fontWeight: "bold" }}>+ เพิ่ม</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={
              activeTab === "เรียน"
                ? state.classes.filter((c) => c.day === selectedDay)
                : state.exams
            }
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEdit
                ? "แก้ไขข้อมูล"
                : activeTab === "เรียน"
                  ? "เพิ่มวิชาเรียน"
                  : "เพิ่มการสอบ"}
            </Text>
            <ScrollView>
              <Text style={styles.label}>ชื่อวิชา</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                placeholder="เช่น Data Structures"
              />
              <Text style={styles.label}>รหัสวิชา</Text>
              <TextInput
                style={styles.input}
                value={formData.code}
                onChangeText={(v) => setFormData({ ...formData, code: v })}
                placeholder="เช่น CS201"
              />

              {activeTab === "เรียน" ? (
                <>
                  <Text style={styles.label}>ห้องเรียน</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.room}
                    onChangeText={(v) => setFormData({ ...formData, room: v })}
                    placeholder="เช่น SC301"
                  />
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>เวลาเริ่ม</Text>
                      <View style={styles.pickerBox}>
                        <Picker
                          selectedValue={formData.startTime}
                          onValueChange={(v) =>
                            setFormData({ ...formData, startTime: v })
                          }
                        >
                          {timeOptions.map((t) => (
                            <Picker.Item key={t} label={t} value={t} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.label}>เวลาจบ</Text>
                      <View style={styles.pickerBox}>
                        <Picker
                          selectedValue={formData.endTime}
                          onValueChange={(v) =>
                            setFormData({ ...formData, endTime: v })
                          }
                        >
                          {timeOptions.map((t) => (
                            <Picker.Item key={t} label={t} value={t} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.label}>วันที่สอบ</Text>
                  <View style={styles.row}>
                    <Picker
                      style={{ flex: 1 }}
                      selectedValue={formData.day}
                      mode="dropdown"
                      onValueChange={(v) =>
                        setFormData({ ...formData, day: v })
                      }
                    >
                      {examdays.map((d) => (
                        <Picker.Item key={d} label={d} value={d} />
                      ))}
                    </Picker>
                    <Picker
                      style={{ flex: 1 }}
                      selectedValue={formData.dayNum}
                      mode="dropdown"
                      onValueChange={(v) =>
                        setFormData({ ...formData, dayNum: v })
                      }
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <Picker.Item
                          key={i}
                          label={`${i + 1}`}
                          value={`${i + 1}`}
                        />
                      ))}
                    </Picker>
                    <Picker
                      style={{ flex: 1 }}
                      selectedValue={formData.month}
                      mode="dropdown"
                      onValueChange={(v) =>
                        setFormData({ ...formData, month: v })
                      }
                    >
                      {months.map((m) => (
                        <Picker.Item key={m} label={m} value={m} />
                      ))}
                    </Picker>
                  </View>
                  <Text style={styles.label}>เวลาสอบ</Text>
                  <View style={styles.pickerBox}>
                    <Picker
                      selectedValue={formData.time}
                      onValueChange={(v) =>
                        setFormData({ ...formData, time: v })
                      }
                    >
                      {timeOptions.map((t) => (
                        <Picker.Item key={t} label={t} value={t} />
                      ))}
                    </Picker>
                  </View>
                  <Text style={styles.label}>ห้องสอบ</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.room}
                    onChangeText={(v) => setFormData({ ...formData, room: v })}
                    placeholder="เช่น SC402"
                  />
                </>
              )}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: "#006664" }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#FFF", fontWeight: "bold" }}>
                  บันทึก
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
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
  safeArea: { flex: 1, backgroundColor: "#F8F9F9" },
  container: { flex: 1, padding: 20 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E4E4",
    borderRadius: 12,
    padding: 5,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#FFF", elevation: 2 },
  tabText: { fontWeight: "bold", color: "#74787B" },
  dayScroll: { flexDirection: "row", marginBottom: 20 },
  dayBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#B2BB1E",
  },
  activeDayBtn: { backgroundColor: "#B2BB1E", borderColor: "#B2BB1E" },
  dayText: { fontSize: 13, color: "#B2BB1E" },
  contentCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#006664" },
  addBtn: {
    backgroundColor: "#006664",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 10,
  },
  itemCard: {
    flexDirection: "row",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: 12,
  },
  examCard: { backgroundColor: "#FFFDE7", borderColor: "#FFD800" },
  itemTitle: { fontSize: 18, fontWeight: "bold", color: "#006664" },
  itemSub: { fontSize: 16, color: "#64748B", marginBottom: 8 },
  itemFooter: { flexDirection: "row", marginTop: 5 },
  footerText: { fontSize: 14, color: "#74787B", marginRight: 12 },
  actionIcons: { flexDirection: "row", alignItems: "center" },
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
    maxHeight: "80%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    textAlign: "left",
  },
  row: { flexDirection: "row" },
  modalButtons: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 20,
  },
  confirmBtn: {
    padding: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
  },
  cancelBtn: {
    padding: 12,
    borderRadius: 10,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  pickerBox: {
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: "center",
  },
});

export default Timetable;
