import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiEdit, FiTrash2, FiMapPin } from "react-icons/fi";
import PageHeader from "../components/common/PageHeader";
import SearchFilter from "../components/common/SearchFilter";
import Modal from "../components/layout/Modal";
import { useAppData } from "../context/AppDataContext";
import { useFilteredData } from "../utils/hooks";

function ExamHallPage() {
  const { examHalls, examsData, apiRequest, reloadAdminData } = useAppData();
  const [search, setSearch] = useState("");
  const [halls, setHalls] = useState(examHalls);
  const [localExams, setLocalExams] = useState(examsData || []);
  const [selectedHall, setSelectedHall] = useState(null);
  const [newExam, setNewExam] = useState({
    name: "",
    code: "",
    date: "",
    time: "",
    hallId: "",
    studentsCount: 0,
    duration: 120,
  });
  const [showAddExam, setShowAddExam] = useState(false);

  useEffect(() => setHalls(examHalls), [examHalls]);
  useEffect(() => setLocalExams(examsData || []), [examsData]);
  useEffect(() => {
    if (!newExam.hallId && halls[0]?.id) {
      setNewExam((current) => ({ ...current, hallId: halls[0].id }));
    }
  }, [halls, newExam.hallId]);

  const filteredHalls = useFilteredData(halls, search, [
    "hallName",
    "location",
  ]);
  const filteredExams = useFilteredData(localExams, search, [
    "name",
    "code",
    "date",
  ]);

  const addExam = async () => {
    if (
      newExam.name &&
      newExam.code &&
      newExam.date &&
      newExam.time &&
      newExam.studentsCount > 0
    ) {
      await apiRequest("/api/admin/exams", {
        method: "POST",
        body: {
          ...newExam,
          studentsCount: Number(newExam.studentsCount),
          duration: Number(newExam.duration),
          proctors: Math.ceil(Number(newExam.studentsCount) / 30),
          status: "Scheduled",
        },
      });
      await reloadAdminData();
      setNewExam({
        name: "",
        code: "",
        date: "",
        time: "",
        hallId: halls[0]?.id || "",
        studentsCount: 0,
        duration: 120,
      });
      setShowAddExam(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Academic"
        title="Exam Hall Locator"
        text="Manage exam halls, schedules, seating capacity, facilities, and exam-to-hall assignments."
        action={
          <motion.button
            className="primary-button"
            onClick={() => setShowAddExam(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus /> Add Exam
          </motion.button>
        }
      />

      <div className="tabs">
        <button className="active">Exam Halls ({halls.length})</button>
        <button>Exams ({localExams.length})</button>
      </div>

      <SearchFilter
        search={search}
        setSearch={setSearch}
        placeholder="Search exam halls or exams by name, code, location..."
      />

      <div className="exam-halls-grid">
        <AnimatePresence>
          {filteredHalls.map((hall) => {
            const hallExams = (localExams || []).filter(
              (e) => String(e.hallId) === String(hall.id),
            );
            const facilities = Array.isArray(hall.facilities)
              ? hall.facilities
              : [];
            const floorLabel = hall.floor || "Ground";
            const seatsPerRow = hall.seatsPerRow || 0;
            const totalRows = hall.totalRows || 0;
            const availability = hall.availability || "Available";
            const planned = hall.examsScheduled ?? hallExams.length;
            return (
              <motion.article
                className="exam-hall-card"
                key={hall.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={{ y: -8 }}
              >
                <div className="hall-header">
                  <div>
                    <h3>{hall.hallName}</h3>
                    <span
                      className={`status ${availability === "Available" ? "success" : "warning"}`}
                    >
                      {availability}
                    </span>
                  </div>
                  <FiMapPin size={20} />
                </div>
                <div className="hall-details">
                  <span>
                    <strong>Capacity:</strong> {hall.capacity} students
                  </span>
                  <span>
                    <strong>Location:</strong> {hall.location || "Not provided"}{" "}
                    - {floorLabel} Floor
                  </span>
                  <span>
                    <strong>Layout:</strong> {seatsPerRow} × {totalRows} seats
                  </span>
                </div>
                <div className="hall-facilities">
                  {facilities.length > 0 ? (
                    facilities.map((facility) => (
                      <span className="facility-badge" key={facility}>
                        {facility}
                      </span>
                    ))
                  ) : (
                    <span className="facility-badge">No facilities listed</span>
                  )}
                </div>
                <div className="metric-row">
                  <span>{hallExams.length} exams scheduled</span>
                  <span>{planned} total planned</span>
                </div>
                <button
                  className="soft-button"
                  onClick={() => setSelectedHall(hall)}
                >
                  <FiEdit /> View Details
                </button>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Upcoming Exams</h3>
          <span>{filteredExams.length} scheduled</span>
        </div>
        <div className="exams-table">
          <div className="table-row table-head">
            <span>Subject</span>
            <span>Code</span>
            <span>Date & Time</span>
            <span>Hall</span>
            <span>Students</span>
            <span>Status</span>
            <span />
          </div>
          <AnimatePresence>
            {filteredExams.map((exam) => {
              const hall = halls.find(
                (h) => String(h.id) === String(exam.hallId),
              );
              return (
                <motion.div
                  className="table-row"
                  key={exam.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ backgroundColor: "var(--hover)" }}
                >
                  <span>
                    <b>{exam.name}</b>
                  </span>
                  <span>{exam.code}</span>
                  <span>
                    {exam.date} <br /> {exam.time}
                  </span>
                  <span>{hall?.hallName || "Not assigned"}</span>
                  <span>{exam.studentsCount}</span>
                  <span>
                    <span
                      className={`status ${exam.status === "Confirmed" ? "success" : "info"}`}
                    >
                      {exam.status}
                    </span>
                  </span>
                  <button
                    className="soft-button"
                    onClick={async () => {
                      try {
                        await apiRequest(`/api/admin/exams/${exam.id}`, {
                          method: "DELETE",
                        });
                        await reloadAdminData();
                      } catch (error) {
                        setLocalExams((current) =>
                          (current || []).filter((e) => e.id !== exam.id),
                        );
                        console.warn(
                          "Exam delete fell back to local state:",
                          error.message || error,
                        );
                      }
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showAddExam && (
          <Modal onClose={() => setShowAddExam(false)}>
            <form
              className="exam-form"
              onSubmit={(e) => {
                e.preventDefault();
                addExam();
              }}
            >
              <h2>Schedule New Exam</h2>
              <label>
                Subject Name
                <input
                  required
                  value={newExam.name}
                  onChange={(e) =>
                    setNewExam({ ...newExam, name: e.target.value })
                  }
                  placeholder="e.g., Data Structures"
                />
              </label>
              <label>
                Course Code
                <input
                  required
                  value={newExam.code}
                  onChange={(e) =>
                    setNewExam({ ...newExam, code: e.target.value })
                  }
                  placeholder="e.g., CS201"
                />
              </label>
              <label>
                Exam Date
                <input
                  required
                  type="date"
                  value={newExam.date}
                  onChange={(e) =>
                    setNewExam({ ...newExam, date: e.target.value })
                  }
                />
              </label>
              <label>
                Time
                <input
                  required
                  type="time"
                  value={newExam.time}
                  onChange={(e) =>
                    setNewExam({ ...newExam, time: e.target.value })
                  }
                />
              </label>
              <label>
                Expected Students
                <input
                  required
                  type="number"
                  min="1"
                  value={newExam.studentsCount}
                  onChange={(e) =>
                    setNewExam({
                      ...newExam,
                      studentsCount: parseInt(e.target.value),
                    })
                  }
                  placeholder="e.g., 85"
                />
              </label>
              <label>
                Assign Hall
                <select
                  value={newExam.hallId}
                  onChange={(e) =>
                    setNewExam({
                      ...newExam,
                      hallId: e.target.value,
                    })
                  }
                >
                  {halls.map((hall) => (
                    <option key={hall.id} value={hall.id}>
                      {hall.hallName} (Capacity: {hall.capacity})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Duration (minutes)
                <input
                  type="number"
                  min="30"
                  step="15"
                  value={newExam.duration}
                  onChange={(e) =>
                    setNewExam({
                      ...newExam,
                      duration: parseInt(e.target.value),
                    })
                  }
                />
              </label>
              <button className="primary-button" type="submit">
                <FiPlus /> Schedule Exam
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedHall && (
          <Modal onClose={() => setSelectedHall(null)} wide>
            <div className="hall-modal">
              <h2>{selectedHall.hallName}</h2>
              <div className="modal-grid">
                <div>
                  <h4>Basic Information</h4>
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedHall.location || "Not provided"}
                  </p>
                  <p>
                    <strong>Floor:</strong> {selectedHall.floor || "Ground"}
                  </p>
                  <p>
                    <strong>Capacity:</strong> {selectedHall.capacity} students
                  </p>
                  <p>
                    <strong>Seating:</strong> {selectedHall.seatsPerRow || 0}{" "}
                    columns × {selectedHall.totalRows || 0} rows
                  </p>
                </div>
                <div>
                  <h4>Facilities</h4>
                  <div className="facility-list">
                    {(Array.isArray(selectedHall.facilities)
                      ? selectedHall.facilities
                      : []
                    ).map((facility) => (
                      <span key={facility} className="facility-badge">
                        ✓ {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <h4 style={{ marginTop: "24px" }}>Scheduled Exams</h4>
              <div className="hall-exams-list">
                {(localExams || [])
                  .filter((e) => String(e.hallId) === String(selectedHall.id))
                  .map((exam) => (
                    <div className="exam-item" key={exam.id}>
                      <div>
                        <strong>{exam.name}</strong>
                        <p>
                          {exam.date} at {exam.time}
                        </p>
                        <span className="small-text">
                          {exam.studentsCount} students, {exam.duration} min
                        </span>
                      </div>
                      <span
                        className={`status ${exam.status === "Confirmed" ? "success" : "info"}`}
                      >
                        {exam.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
export default ExamHallPage;
