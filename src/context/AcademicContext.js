// src/context/AcademicContext.js
import React, { createContext, useReducer, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

export const AcademicContext = createContext();

export const timeToNumber = (timeStr) => {
  if (!timeStr) return 0;
  return parseInt(timeStr.replace(":", ""), 10);
};

export const isTimeOverlapping = (
  newStart,
  newEnd,
  existingStart,
  existingEnd,
) => {
  return newStart < existingEnd && newEnd > existingStart;
};

const academicReducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "SET_DATA": // ดึงข้อมูลก้อนใหญ่มาจาก Firebase
      return { ...state, [action.category]: action.payload };

    case "ADD_CLASS":
      return { ...state, classes: [...state.classes, action.payload] };
    case "ADD_EXAM":
      return { ...state, exams: [...state.exams, action.payload] };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "DELETE_ITEM":
      if (action.category === "classes") {
        const classToDelete = state.classes.find((c) => c.id === action.id);
        const className = classToDelete ? classToDelete.name : "";
        return {
          ...state,
          classes: state.classes.filter((item) => item.id !== action.id),
          exams: state.exams.filter((exam) => exam.name !== className),
        };
      }
      return {
        ...state,
        [action.category]: state[action.category].filter(
          (item) => item.id !== action.id,
        ),
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        [action.category]: state[action.category].map((item) =>
          item.id === action.payload.id ? action.payload : item,
        ),
      };
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, completed: !t.completed } : t,
        ),
      };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "CLEAR_DATA":
      return { ...state, classes: [], exams: [], tasks: [] };
    default:
      return state;
  }
};

export const AcademicProvider = ({ children }) => {
  const [state, dispatchLocal] = useReducer(academicReducer, {
    classes: [],
    exams: [],
    tasks: [],
    user: { name: "กำลังโหลด...", faculty: "-", year: "-" },
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;

        const unsubUser = onSnapshot(doc(db, "users", uid), (docSnap) => {
          if (docSnap.exists())
            dispatchLocal({ type: "SET_USER", payload: docSnap.data() });
        });

        const unsubClasses = onSnapshot(
          collection(db, `users/${uid}/classes`),
          (snap) => {
            dispatchLocal({
              type: "SET_DATA",
              category: "classes",
              payload: snap.docs.map((d) => d.data()),
            });
          },
        );

        const unsubExams = onSnapshot(
          collection(db, `users/${uid}/exams`),
          (snap) => {
            dispatchLocal({
              type: "SET_DATA",
              category: "exams",
              payload: snap.docs.map((d) => d.data()),
            });
          },
        );

        const unsubTasks = onSnapshot(
          collection(db, `users/${uid}/tasks`),
          (snap) => {
            dispatchLocal({
              type: "SET_DATA",
              category: "tasks",
              payload: snap.docs.map((d) => d.data()),
            });
          },
        );

        return () => {
          unsubUser();
          unsubClasses();
          unsubExams();
          unsubTasks();
        };
      } else {
        dispatchLocal({ type: "CLEAR_ALL" });
      }
    });

    return unsubscribeAuth;
  }, []);

  const customDispatch = async (action) => {
    if (["ADD_CLASS", "ADD_EXAM", "ADD_TASK"].includes(action.type)) {
      if (!action.payload.id) action.payload.id = Date.now().toString();
    }

    dispatchLocal(action);

    const user = auth.currentUser;
    if (!user) return;
    const uid = user.uid;

    try {
      switch (action.type) {
        case "ADD_CLASS":
          await setDoc(
            doc(db, `users/${uid}/classes`, action.payload.id),
            action.payload,
          );
          break;
        case "ADD_EXAM":
          await setDoc(
            doc(db, `users/${uid}/exams`, action.payload.id),
            action.payload,
          );
          break;
        case "ADD_TASK":
          await setDoc(
            doc(db, `users/${uid}/tasks`, action.payload.id),
            action.payload,
          );
          break;
        case "DELETE_ITEM":
          if (action.category === "classes") {
            const classToDelete = state.classes.find((c) => c.id === action.id);
            if (classToDelete) {
              const relatedExams = state.exams.filter(
                (e) => e.name === classToDelete.name,
              );
              for (let exam of relatedExams) {
                await deleteDoc(doc(db, `users/${uid}/exams`, exam.id));
              }
            }
          }
          await deleteDoc(
            doc(db, `users/${uid}/${action.category}`, action.id),
          );
          break;
        case "UPDATE_ITEM":
          await updateDoc(
            doc(db, `users/${uid}/${action.category}`, action.payload.id),
            action.payload,
          );
          break;
        case "TOGGLE_TASK":
          const task = state.tasks.find((t) => t.id === action.payload);
          if (task) {
            await updateDoc(doc(db, `users/${uid}/tasks`, action.payload), {
              completed: !task.completed,
            });
          }
          break;
        case "UPDATE_USER":
          await updateDoc(doc(db, "users", uid), action.payload);
          break;
      }
    } catch (error) {
      console.error("Firebase Sync Error:", error);
    }
  };

  return (
    <AcademicContext.Provider value={{ state, dispatch: customDispatch }}>
      {children}
    </AcademicContext.Provider>
  );
};
