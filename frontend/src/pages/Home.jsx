import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar.jsx";
import Notecard from "../components/Notecard.jsx";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import AddEditNotes from "./AddEditNotes.jsx";
import Modal from "react-modal";
import moment from "moment";
import axiosInstance from "../utils/axiosInstance"; // Ensure axiosInstance is imported

const Home = () => {
  const [OpenEditModal, SetOpenEditModal] = useState({
    isShown: false,
    type: "add",
    data: "",
  });
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState("");
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(""); // Assuming these are stored in state
  const [password, setPassword] = useState(""); // Assuming these are stored in state

  const handleEdit = (noteDetails) => {
    SetOpenEditModal({ isShown: true, data: noteDetails, type: "edit" }); // Fixed typo "typr" to "type"
  };

  const deleteNote = async (note) => {
    try {
      await axiosInstance.post("/delete-note", { id: note._id }); // Assuming there's a delete endpoint
      setNotes(notes.filter((n) => n._id !== note._id)); // Remove deleted note from state
    } catch (error) {
      setError("Failed to delete note.");
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.post("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        setError("Failed to fetch user info.");
      }
    }
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.post("/get-all", {
        email: email,
        password: password,
      });

      if (response.data && response.data.notes) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getUserInfo(); // Call only if token exists
      getAllNotes();
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <NavBar user={userInfo} />
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-4 mt-8">
          {notes.map((item, index) => (
            <Notecard
              key={index}
              title={item._id}
              date={moment(item.createdOn).format("MMMM Do YYYY, h:mm:ss a")}
              content={item.content}
              tags={item.tags}
              isPinned={item.isPinned}
              onEdit={() => handleEdit(item)}
              onDelete={() => deleteNote(item)} // Fixed delete function call
              onPinNote={() => {}} // Placeholder for pinning functionality
            />
          ))}

          <button
            className="w-16 h-16 bg-blue-600 rounded-2xl flex justify-center items-center hover:bg-blue-700 absolute right-10 bottom-10"
            onClick={() => {
              SetOpenEditModal({
                isShown: true,
                type: "add",
                data: null,
              });
            }}
          >
            <MdAdd className="text-[32px] text-white" />
          </button>
        </div>
        <Modal
          isOpen={OpenEditModal.isShown}
          onRequestClose={() => {
            SetOpenEditModal({ isShown: false, type: "add", data: null });
          }}
          style={{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.5)",
            },
          }}
          contentLabel=""
          className="w-[40%] max-h- 3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
        >
          <AddEditNotes
            type={OpenEditModal.type}
            notedata={OpenEditModal.data}
            onClose={() => {
              SetOpenEditModal({ isShown: false, type: "add", data: null });
            }}
            getAllNotes={getAllNotes}
          />
        </Modal>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default Home;