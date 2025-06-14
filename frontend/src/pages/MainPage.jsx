import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EvaluationView from "./EvaluationView";
import "./MainPage.css";

export default function MainPage() {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState("form");
  const [showEvaluationTab, setShowEvaluationTab] = useState(false);
  const [rolePreferences, setRolePreferences] = useState([]);
  const navigate = useNavigate();

  const registerNo = id.slice(-9);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/forms/${registerNo}`);
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error("Error loading form", err);
      }
    };

    const fetchRole = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/role", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        const data = await res.json();
        setShowEvaluationTab(data.role === "DSW");
      } catch (err) {
        console.error("Error fetching role", err);
        setShowEvaluationTab(false);
      }
    };

    const fetchCandidate = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/candidates`);
        const allCandidates = await res.json();
        const candidate = allCandidates.find(c => c.registerNo === registerNo);
        if (candidate?.rolePreferences) {
          setRolePreferences(candidate.rolePreferences.sort());
        }
      } catch (err) {
        console.error("Error fetching candidate preferences", err);
      }
    };

    fetchForm();
    fetchRole();
    fetchCandidate();
  }, [id, registerNo]);

  const renderRoleTags = () => {
    if (rolePreferences.length === 0) return null;

    const getTagClass = (role) => {
      switch (role.trim()) {
        case "Executive Member":
          return "tag tag-blue";
        case "Member Secretary":
          return "tag tag-green";
        case "Member Secretary - Technical":
          return "tag tag-purple";
        case "Member Secretary - Cultural":
          return "tag tag-orange";
        default:
          return "tag tag-default";
      }
    };

    return (
      <div className="role-tags">
        <h4>Role Preferences</h4>
        {rolePreferences.map((role, index) => (
          <span key={index} className={getTagClass(role)}>
            {role}
          </span>
        ))}
      </div>
    );
  };

  const renderFormView = () => {
    if (!formData) return <p className="loading-text">Loading form data...</p>;
    if (!formData.responses || Object.keys(formData.responses).length === 0)
      return <p className="no-data-text">No responses submitted.</p>;

    const entries = Object.entries(formData.responses).filter(
      ([_, value]) => value && value.trim() !== ""
    );

    return (
      <div className="response-section">
        <h3>Submitted Application</h3>
        {renderRoleTags()}
        <ul className="response-list">
          {entries.map(([question, answer], index) => (
            <li key={index}>
              <strong>{question.replace(/\.\d+$/, "")}:</strong> {answer}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="main-container">
      <div className="main-header">
        <h2>Application Overview</h2>
        <p className="candidate-id">Candidate ID: <strong>{id}</strong></p>
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="tab-controls">
        <button
          className={activeTab === "form" ? "active-tab" : ""}
          onClick={() => setActiveTab("form")}
        >
          Submitted Application
        </button>
        {showEvaluationTab && (
          <button
            className={activeTab === "evaluation" ? "active-tab" : ""}
            onClick={() => setActiveTab("evaluation")}
          >
            Evaluation
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === "form" ? renderFormView() : <EvaluationView id={id} />}
      </div>
    </div>
  );
}
