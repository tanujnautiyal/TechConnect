import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
const getUserData = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) {
      throw new Error("No user data found");
    }
    
    const parsedData = JSON.parse(userData);
    if (!parsedData.token) {
      throw new Error("No valid token found");
    }
    
    return parsedData;
  } catch (error) {
    console.error("Error retrieving user data:", error.message);
    return { token: null, role: "" };
  }
};

const IetAnnouncements = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [userRole, setUserRole] = useState("null"); 
  const navigate = useNavigate();
  const userData = getUserData();

  useEffect(() => {
    if (!userData||!userData.token) {
      console.error("No token found, redirecting to login.");
      navigate("/login");
      return;
    }
    if (userData.role) {
      setUserRole(userData.role);
      if (userData.role.toLowerCase() !== "iet") {
        console.error("Unauthorized role, redirecting.");
        navigate("/home");
      }
    }
  }, [userData.role, navigate]);
  // Fetch announcements
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get("https://tech--connect.azurewebsites.net/api/iet/get", {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
        withCredentials: true,
      });
  
      console.log("Fetched Announcements:", response.data);
      
      // ✅ Update state with latest announcements
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };
  
  
  

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ Prevent default form submission
  
    try {
      const token = userData.token;
      if (!token) {
        throw new Error("No token found, user is not authenticated.");
      }
  
      const newAnnouncement = { title, message }; // ✅ Capture input values
  
      const response = await axios.post(
        "https://tech--connect.azurewebsites.net/api/iet/add",
        newAnnouncement,
        {
          headers: {
            Authorization: `Bearer ${userData.token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      console.log("Announcement added:", response.data);
  
      // ✅ Update the UI immediately
      setAnnouncements([...announcements, newAnnouncement]);
  
      // ✅ Clear input fields after submission
      setTitle("");
      setMessage("");
  
      // ✅ Fetch the latest announcements from the backend
      fetchAnnouncements();
    } catch (error) {
      console.error("Error adding announcement:", error);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      const token = userData.token;// ✅ Get the token
      if (!token) {
        throw new Error("No token found, user is not authenticated.");
      }
  
      await axios.delete(`https://tech--connect.azurewebsites.net/api/iet/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`, // ✅ Include token
        },
        withCredentials: true, // ✅ Ensure cookies are sent if needed
      });
  
      console.log("Announcement deleted successfully!");
  
      // ✅ Remove from UI immediately
      setAnnouncements(announcements.filter((ann) => ann._id !== id));
  
      // ✅ Fetch updated announcements (optional)
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <motion.div
        className="w-full max-w-2xl bg-gray-800/70 backdrop-blur-lg p-6 rounded-xl shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-4">IET Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring focus:ring-blue-500"
          />
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 text-white rounded-lg focus:ring focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 transition-all p-3 rounded-lg font-semibold"
          >
            Add Announcement
          </button>

        </form>
      </motion.div>

      <div className="w-full max-w-2xl mt-8">
        <h2 className="text-2xl font-bold text-center mb-4">Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-center text-gray-400">No announcements yet.</p>
        ) : (
          <ul className="space-y-4">
            {announcements.map((ann) => (
              <motion.li
                key={ann._id}
                className="bg-gray-800 p-4 rounded-lg shadow-lg relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold">{ann.title}</h3>
                <p className="text-gray-300">{ann.message}</p>
                <button
                  onClick={() => handleDelete(ann._id)}
                  className="absolute top-3 right-3 bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg text-sm"
                >
                  Delete
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default IetAnnouncements;
