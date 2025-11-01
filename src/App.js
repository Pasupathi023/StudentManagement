// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const API_BASE = "https://wkft7cc6eg.execute-api.ap-south-1.amazonaws.com/dev/students";

  const [form, setForm] = useState({ name: "", age: "", rollNo: "", course: "" });
  const [errors, setErrors] = useState({});
  const [viewPage, setViewPage] = useState(false);
  const [students, setStudents] = useState([]);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setMessage("Error loading students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewPage) fetchStudents();
  }, [viewPage]);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (!isNaN(form.name)) newErrors.name = "Name must be a string";

    if (!form.age) newErrors.age = "Age is required";
    else if (isNaN(form.age)) newErrors.age = "Age must be a number";

    if (!form.rollNo.trim()) newErrors.rollNo = "Roll No is required";
    else if (!/^[A-Za-z0-9]+$/.test(form.rollNo))
      newErrors.rollNo = "Roll No must contain only letters and numbers";

    if (!form.course.trim()) newErrors.course = "Course is required";
    else if (!isNaN(form.course)) newErrors.course = "Course must be a string";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (editId) {
        await axios.put(API_BASE, {
          _id: editId,
          name: form.name,
          age: form.age,
          roll_no: form.rollNo,
          course: form.course,
        });
        setMessage("✓ Student updated successfully");
      } else {
        await axios.post(API_BASE, {
          name: form.name,
          age: form.age,
          roll_no: form.rollNo,
          course: form.course,
        });
        setMessage("✓ Student added successfully");
      }

      setForm({ name: "", age: "", rollNo: "", course: "" });
      setErrors({});
      setEditId(null);
      fetchStudents();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error saving record:", err);
      setMessage("✗ Error saving student record");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    setForm({ name: s.name, age: s.age, rollNo: s.roll_no || s.rollNo, course: s.course });
    setEditId(s._id);
    setViewPage(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    
    setLoading(true);
    try {
      await axios.delete(API_BASE, {
        data: { _id: id },
      });
      setMessage("✓ Student deleted successfully");
      fetchStudents();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting record:", err);
      setMessage("✗ Error deleting student record");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: "", age: "", rollNo: "", course: "" });
    setErrors({});
    setEditId(null);
  };

  const filtered = students.filter((s) =>
    [s.name, s.age, s.roll_no || s.rollNo, s.course]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="header-title"> STUDENT MANAGEMENT SYSTEM</h1>
          {!viewPage && (
            <button onClick={() => setViewPage(true)} className="header-btn">
              View All Students →
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {!viewPage ? (
          <div className="form-container">
            <div className="form-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    {editId ? "Update Student" : "Add New Student"}
                  </h2>
                  <p className="card-subtitle">
                    {editId ? "Modify student information" : "Enter student details below"}
                  </p>
                </div>
              </div>

              {message && (
                <div className={`message ${message.includes("✓") ? "success" : "error"}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Student Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter full name"
                      className="form-input"
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="text"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      placeholder="Enter age"
                      className="form-input"
                    />
                    {errors.age && <span className="error">{errors.age}</span>}
                  </div>

                  <div className="form-group">
                    <label>Roll Number</label>
                    <input
                      type="text"
                      value={form.rollNo}
                      onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
                      placeholder="e.g., CS2024001"
                      className="form-input"
                    />
                    {errors.rollNo && <span className="error">{errors.rollNo}</span>}
                  </div>

                  <div className="form-group">
                    <label>Course</label>
                    <input
                      type="text"
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      placeholder="e.g., Computer Science"
                      className="form-input"
                    />
                    {errors.course && <span className="error">{errors.course}</span>}
                  </div>
                </div>

                <div className="btn-row">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Processing..." : editId ? " Update Student" : "➕ Add Student"}
                  </button>
                  <button type="button" onClick={handleCancel} className="cancel-btn">
                    ✕ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="records-container">
            <div className="records-card">
              <div className="records-header">
                <div className="records-info">
                  <h2 className="records-title"> Student Records</h2>
                  <p className="records-count">
                    {filtered.length} {filtered.length === 1 ? "student" : "students"} found
                  </p>
                </div>
                <button onClick={() => setViewPage(false)} className="back-btn">
                  ← Back to Form
                </button>
              </div>

              {message && (
                <div className={`message ${message.includes("✓") ? "success" : "error"}`}>
                  {message}
                </div>
              )}

              <div className="search-container">
                <input
                  type="text"
                  placeholder=" Search by name, roll no, age, or course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="table-container">
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading students...</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Roll Number</th>
                        <th>Course</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length ? (
                        filtered.map((s) => (
                          <tr key={s._id}>
                            <td className="name-col">{s.name}</td>
                            <td>{s.age}</td>
                            <td className="roll-col">{s.roll_no || s.rollNo}</td>
                            <td>{s.course}</td>
                            <td>
                              <div className="action-buttons">
                                <button onClick={() => handleEdit(s)} className="edit-btn">
                                   Edit
                                </button>
                                <button onClick={() => handleDelete(s._id)} className="delete-btn">
                                   Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-state">
                            <div className="empty-icon">📭</div>
                            <p>No students found</p>
                            <small>Try adjusting your search terms</small>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;