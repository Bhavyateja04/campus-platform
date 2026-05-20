import { FiMail, FiPhone, FiCalendar, FiActivity, FiEdit, FiTrash2 } from "react-icons/fi";
import Modal from "../components/layout/Modal";
import { useState } from "react";
function ProfileDetails({ user, onEdit, onDelete }) {
  return (
    <div className="profile-modal">
      <img src={user.avatar} alt="" />
      <h2>{user.name}</h2>
      <p>{user.department}</p>
      <div className="detail-grid">
        <span>
          <FiMail /> {user.email}
        </span>
        <span>
          <FiPhone /> {user.phone}
        </span>
        <span>
          <FiCalendar /> Joined {user.joined}
        </span>
        <span>
          <FiActivity /> {user.activity}% activity score
        </span>
      </div>
      <div className="button-row">
        <button className="soft-button" onClick={onEdit}>
          <FiEdit /> Edit user
        </button>
        <button className="danger-button" onClick={onDelete}>
          <FiTrash2 /> Delete user
        </button>
      </div>
    </div>
  );
}
export default ProfileDetails;