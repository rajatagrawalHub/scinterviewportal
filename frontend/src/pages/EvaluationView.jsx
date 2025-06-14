import React, { useEffect, useState } from "react";
import "./EvaluationView.css";
import { useNavigate } from "react-router-dom";

export default function EvaluationView({ id }) {
  const [isReturning, setIsReturning] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();;

  const [formFields, setFormFields] = useState({
    personalDetails: {
      name: "",
      registerNo: "",
      mobile: "",
      program: "",
      school: "",
      gender: "",
      historyOfArrears: false,
      nativeState: "",
    },
    eventsCoordinated: [],
    rolesAndResponsibilities: [],
    leadershipRoles: [
      { role: "", organization: "", contribution: "" },
      { role: "", organization: "", contribution: "" },
      { role: "", organization: "", contribution: "" },
    ],
    suggestionsForEvents: "",
    suggestionsForCodeOfConduct: "",
    improvementArea: "",
    recommendedCommittee: [],
  });

  const [skills, setSkills] = useState({});
  const [recommended, setRecommended] = useState(false);
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [submittedBy, setSubmittedBy] = useState("CD Naiju");

  const [otherEvent, setOtherEvent] = useState("");
  const [otherRole, setOtherRole] = useState("");

  const eventOptions = [
    "New Year",
    "Pongal",
    "Republic Day",
    "Primavera",
    "Yantra",
    "Quanta",
    "Women’s Day",
    "Counselling Week",
    "University Day",
    "Alumni Day",
    "Independence Day",
    "Engineers Day",
    "Navy Day",
    "Newbie Fiesta",
    "Regional New Year",
    "Gravitas",
    "Quality Week",
    "Suicide Prevention Day",
    "ISRO Lecture",
  ];

  const roleOptions = [
    "Purchase",
    "Documentation",
    "Design",
    "Registration",
    "Email Drafting",
    "Publicity",
    "Hall Arrangement",
    "Attendance Marking",
    "Technical Committee",
    "Guest Care",
    "Event Coordination",
    "Refreshments",
    "Invitation & Certificate Distribution",
    "Involvement in SW Office Work",
  ];

  const committeeOptions = [
    "Academic Council",
    "Alumni",
    "Culturals",
    "Documentation",
    "Grievance",
    "Hostel",
    "IIC",
    "IQAC",
    "Library",
    "Sports",
    "Technical",
  ];
  const updateCandidateStatus = async (newStatus) => {
    try {
      const candidateId = id.slice(0,-9);
      const res = await fetch(
        `/api/candidates/${candidateId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Status update failed");
      alert(`Status updated to "${newStatus}"`);
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to update candidate status");
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchCandidateAndEvaluation = async () => {
      const candidateId = id.slice(-9);
      const evaluationId = id.slice(0, -9);

      try {
        const candidateRes = await fetch(
          `/api/candidates/${candidateId}`
        );
        if (!candidateRes.ok) throw new Error("Failed to fetch candidate");

        const candidateData = await candidateRes.json();
        setCandidate(candidateData);
        setIsReturning(candidateData.councilMemberLastYear);

        setFormFields((prev) => ({
          ...prev,
          personalDetails: {
            ...prev.personalDetails,
            name: candidateData.name,
            registerNo: candidateData.registerNo,
            mobile: candidateData.contactNumber,
            school: candidateData.school,
            program: candidateData.program,
          },
        }));

        const evalRes = await fetch(
          `/api/evaluation/${evaluationId}`
        );
        if (evalRes.ok) {
          const evalData = await evalRes.json();

          setIsReturning(evalData.isReturningMember || false);
          setFormFields((prev) => ({ ...prev, ...evalData.formFields }));
          setSkills(evalData.skills || {});
          setRecommended(evalData.recommended || false);
          setReason(evalData.reason || "");
          setSubmittedBy(evalData.submittedBy || "CD Naiju");
          setSubmissionSuccess(true);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchCandidateAndEvaluation();
  }, [id]);

  const handleCheckboxChange = (field, value) => {
    setFormFields((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleLeadershipChange = (index, field, value) => {
    const updated = [...formFields.leadershipRoles];
    updated[index][field] = value;
    setFormFields({ ...formFields, leadershipRoles: updated });
  };

  const handlePersonalChange = (field, value) => {
    setFormFields((prev) => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [field]: value },
    }));
  };

  const normalizedSkills = {
    communication: skills["communication"] || "",
    leadership: skills["leadership"] || "",
    teamwork: skills["teamwork"] || "",
    problemSolving: skills["problemSolving"] || "",
    impression: skills["impression"] || "",
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage("");

      const res = await fetch(
        `/api/evaluation/${id.slice(0, -9)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isReturningMember: isReturning,
            formFields,
            skills: normalizedSkills,
            recommended,
            reason,
            submittedBy,
            password,
          }),
        }
      );

      if (!res.ok) throw new Error((await res.text()) || "Failed to submit.");
      alert("Evaluation submitted successfully.");
      setSubmissionSuccess(true);
      const finalStatus =
        recommended === true
          ? "Recommended"
          : recommended === false
          ? "Not Recommended"
          : "Pending";

      await updateCandidateStatus(finalStatus);
    } catch (err) {
      setSubmissionSuccess(false);
      setErrorMessage("Invalid Password");
    }
  };

  const downloadPDF = () => {
    const url = `/api/pdf/${id.slice(0, -9)}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("PDF generation failed");
        window.open(url, "_blank");
      })
      .catch((err) => {
        alert("Error downloading PDF");
        console.error(err);
      });
  };

  const addOtherEvent = () => {
    if (otherEvent && !formFields.eventsCoordinated.includes(otherEvent)) {
      setFormFields((prev) => ({
        ...prev,
        eventsCoordinated: [...prev.eventsCoordinated, otherEvent],
      }));
      setOtherEvent("");
    }
  };

  const addOtherRole = () => {
    if (otherRole && !formFields.rolesAndResponsibilities.includes(otherRole)) {
      setFormFields((prev) => ({
        ...prev,
        rolesAndResponsibilities: [...prev.rolesAndResponsibilities, otherRole],
      }));
      setOtherRole("");
    }
  };

  return (
    <div className="eval-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2>Student Council Evaluation</h2>
        <button
          style={{
            backgroundColor: "orange",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
          }} className="addBtn"
          onClick={() => updateCandidateStatus("Absent")}
        >
          Mark as Absent
        </button>
      </div>

      {/* Evaluator Info */}
      <section className="eval-section">
        <label>Evaluator Name:</label>
        <input
          className="iBox"
          value={submittedBy}
          onChange={(e) => setSubmittedBy(e.target.value)}
        />
      </section>

      {/* Personal Details */}
      <section className="eval-section">
        <h3>Personal Details</h3>
        <div className="form-row">
          {[
            "name",
            "registerNo",
            "mobile",
            "program",
            "school",
            "nativeState",
          ].map((field) => (
            <div key={field}>
              <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
              <input
                className="iBox"
                value={formFields.personalDetails[field] || ""}
                onChange={(e) => handlePersonalChange(field, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="form-row">
          <div>
            <label>Gender:</label>
            <select
              value={formFields.personalDetails.gender}
              onChange={(e) => handlePersonalChange("gender", e.target.value)}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label>History of Arrears:</label>
            <select
              value={formFields.personalDetails.historyOfArrears ? "yes" : "no"}
              onChange={(e) =>
                handlePersonalChange(
                  "historyOfArrears",
                  e.target.value === "yes"
                )
              }
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>
      </section>

      {/* Contribution Section */}
      {isReturning ? (
        <section className="eval-section">
          <h3>Contributions of Existing Members</h3>
          <label>Events Coordinated:</label>
          <div className="checkbox-grid">
            {eventOptions.map((event) => (
              <label key={event}>
                <input
                  type="checkbox"
                  checked={formFields.eventsCoordinated.includes(event)}
                  onChange={() =>
                    handleCheckboxChange("eventsCoordinated", event)
                  }
                />
                {event}
              </label>
            ))}
          </div>
          <div className="form-row">
            <input
              className="iBox"
              placeholder="Others"
              value={otherEvent}
              onChange={(e) => setOtherEvent(e.target.value)}
            />
            <button className="addBtn" type="button" onClick={addOtherEvent}>
              Add
            </button>
          </div>

          <label>Roles and Responsibilities:</label>
          <div className="checkbox-grid">
            {roleOptions.map((role) => (
              <label key={role}>
                <input
                  type="checkbox"
                  checked={formFields.rolesAndResponsibilities.includes(role)}
                  onChange={() =>
                    handleCheckboxChange("rolesAndResponsibilities", role)
                  }
                />
                {role}
              </label>
            ))}
          </div>
          <div className="form-row">
            <input
              className="iBox"
              placeholder="Others"
              value={otherRole}
              onChange={(e) => setOtherRole(e.target.value)}
            />
            <button className="addBtn" type="button" onClick={addOtherRole}>
              Add
            </button>
          </div>
        </section>
      ) : (
        <section className="eval-section">
          <h3>Contributions</h3>
          {formFields.leadershipRoles.map((entry, index) => (
            <div key={index} className="leadership-entry">
              {["role", "organization", "contribution"].map((field) => (
                <div key={field}>
                  <label>
                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                  </label>
                  <input
                    className="iBox"
                    value={entry[field]}
                    onChange={(e) =>
                      handleLeadershipChange(index, field, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          ))}

          <label>Recommended Committees:</label>
          <div className="checkbox-grid">
            {committeeOptions.map((committee) => (
              <label key={committee}>
                <input
                  type="checkbox"
                  checked={formFields.recommendedCommittee.includes(committee)}
                  onChange={() =>
                    handleCheckboxChange("recommendedCommittee", committee)
                  }
                />
                {committee}
              </label>
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      <section className="eval-section">
        <h3>Suggestions</h3>
        <div className="form-row">
          <textarea
            className="full-width"
            placeholder="Suggestions to promote CC events without OD"
            value={formFields.suggestionsForEvents}
            onChange={(e) =>
              setFormFields({
                ...formFields,
                suggestionsForEvents: e.target.value,
              })
            }
          />
          <textarea
            className="full-width"
            placeholder="Suggestions to create mass awareness about Code of Conduct"
            value={formFields.suggestionsForCodeOfConduct}
            onChange={(e) =>
              setFormFields({
                ...formFields,
                suggestionsForCodeOfConduct: e.target.value,
              })
            }
          />
          <textarea
            className="full-width"
            placeholder="One important aspect in VIT that needs refinement"
            value={formFields.improvementArea}
            onChange={(e) =>
              setFormFields({ ...formFields, improvementArea: e.target.value })
            }
          />
        </div>
      </section>

      {/* Skill Ratings */}
      <section className="eval-section">
        <h3>Skill Ratings</h3>
        <div className="form-row">
          {[
            "communication",
            "leadership",
            "teamwork",
            "problemSolving",
            "impression",
          ].map((skill) => (
            <div key={skill}>
              <label>
                {skill === "impression"
                  ? "Overall Impression"
                  : skill
                      .replace(/([A-Z])/g, " $1") // add space before capital letters
                      .replace(/^./, (char) => char.toUpperCase())}
                :
              </label>

              <select
                value={skills[skill] || ""}
                onChange={(e) =>
                  setSkills({ ...skills, [skill]: e.target.value })
                }
              >
                <option value="">Select</option>
                <option>Excellent</option>
                <option>Good</option>
                <option>Average</option>
                <option>Below Average</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendation */}
      <section className="eval-section">
        <h3>Recommendation</h3>
        <div className="form-row">
          <div>
            <label>Recommended?</label>
            <select
              value={recommended ? "yes" : "no"}
              onChange={(e) => setRecommended(e.target.value === "yes")}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          <div className="full-width">
            <label>Reason:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="full-width">
            <label>Evaluator Password:</label>
            <input
              type="password"
              className="iBox"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="eval-actions">
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Evaluation
        </button>
        {submissionSuccess && (
          <button className="pdf-btn" onClick={downloadPDF}>
            Download PDF
          </button>
        )}
      </div>

      {errorMessage && (
        <p style={{ color: "red", marginTop: "1rem" }}>{errorMessage}</p>
      )}
    </div>
  );
}
