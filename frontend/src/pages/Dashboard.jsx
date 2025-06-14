import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [councilFilter, setCouncilFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedRoleFilter, setAppliedRoleFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get("/api/candidates");
        setCandidates(res.data);
      } catch (err) {
        alert("Failed to fetch candidates");
      }
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.registerNo.toLowerCase().includes(search.toLowerCase()) ||
      c.school.toLowerCase().includes(search.toLowerCase()) ||
      c.contactNumber.includes(search);

    const matchesCouncil =
      councilFilter === "" ||
      (councilFilter === "yes" && c.councilMemberLastYear) ||
      (councilFilter === "no" && !c.councilMemberLastYear);

    const matchesStatus =
      statusFilter === "" || c.applicationStatus === statusFilter;

    const matchesAppliedRole =
      appliedRoleFilter === "" || c.appliedForRole === appliedRoleFilter;

    return (
      matchesSearch && matchesCouncil && matchesStatus && matchesAppliedRole
    );
  });

  const handleRowClick = (candidateId) => {
    navigate(`/main/${candidateId}`);
  };

  const getStatusTagClass = (status) => {
    switch (status) {
      case "Submitted":
        return "tag tag-gray";
      case "Shortlisted":
        return "tag tag-blue";
      case "Rejected":
        return "tag tag-red";
      case "Absent":
        return "tag tag-orange";
      case "Recommended":
        return "tag tag-green";
      case "Not Recommended":
        return "tag tag-orange";
      case "Pending":
        return "tag tag-yellow";
      default:
        return "tag tag-default";
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header dashboard-actions">
        <h1>Candidate Dashboard</h1>
        <button
          className="download-zip-btn"
          onClick={() => {
            window.open("/api/pdf/all", "_blank");
          }}
        >
          Download All Evaluation Sheet
        </button>
        <div className="dashboard-actions">
          <button onClick={() => navigate("/change-password")}>
            Change Password
          </button>
          <button onClick={() => navigate("/logout")}>Logout</button>
        </div>
      </header>
      <input
        className="nameSearch"
        type="text"
        value={search}
        placeholder="Search by name, reg no, school, contact..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="filters">
        <select
          value={councilFilter}
          onChange={(e) => setCouncilFilter(e.target.value)}
        >
          <option value="">SC24-25 Member</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Application Status</option>
          <option value="Submitted">Submitted</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Absent">Absent</option>
          <option value="Recommended">Recommended</option>
          <option value="Not Recommended">Not Recommended</option>
          <option value="Pending">Pending</option>
        </select>

        <select
          value={appliedRoleFilter}
          onChange={(e) => setAppliedRoleFilter(e.target.value)}
        >
          <option value="">Applied Role</option>
          <option value="Executive Member">Executive Member</option>
          <option value="Member Secretary">Member Secretary</option>
        </select>
      </div>

      <p className="result-count">
        {filteredCandidates.length} candidate(s) found
      </p>

      <div className="table-wrapper">
        <table className="candidate-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg No</th>
              <th>School</th>
              <th>Contact</th>
              <th>Applied Role</th>
              <th>Status</th>
              <th>SC24-25 Member</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="7">No candidates found.</td>
              </tr>
            ) : (
              filteredCandidates.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => handleRowClick(c._id + c.registerNo)}
                >
                  <td>{c.name}</td>
                  <td>{c.registerNo}</td>
                  <td>{c.school}</td>
                  <td>{c.contactNumber}</td>
                  <td>{c.appliedForRole}</td>
                  <td>
                    <span className={getStatusTagClass(c.applicationStatus)}>
                      {c.applicationStatus}
                    </span>
                    {["Recommended", "Not Recommended"].includes(
                      c.applicationStatus
                    ) && (
                      <button
                        className="pdf-btn-o"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `/api/pdf/${c._id}`,
                            "_blank"
                          );
                        }}
                      >
                        📄
                      </button>
                    )}
                  </td>
                  <td>{c.councilMemberLastYear ? "Yes" : "No"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
