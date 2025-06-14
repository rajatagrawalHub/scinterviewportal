const express = require('express');
const router = express.Router();
const Evaluation = require('../models/Evaluation');
const Candidate = require('../models/Candidate');

router.get("/:id", async (req, res) => {
  try {
    const evaluation = await Evaluation.findOne({ candidateId: req.params.id });
    if (!evaluation) return res.status(404).send("Evaluation not found.");
    res.json(evaluation);
  } catch (err) {
    res.status(500).send("Server error");
  }
});


// Submit evaluation
router.post('/:id', async (req, res) => {
  try {
    const {
      isReturningMember,
      formFields,
      skills,
      recommended,
      reason,
      password,
      submittedBy
    } = req.body;

    if (password !== process.env.EVAL_PASSWORD) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const candidateId = req.params.id;

    // Check if evaluation already exists
    const existingEval = await Evaluation.findOne({ candidateId });

    if (existingEval) {
      // Update existing evaluation
      await Evaluation.updateOne(
        { candidateId },
        {
          $set: {
            isReturningMember,
            formFields,
            skills,
            recommended,
            reason,
            submittedBy
          }
        }
      );
      return res.json({ message: 'Evaluation updated' });
    }

    // Create new evaluation
    const newEval = new Evaluation({
      candidateId,
      isReturningMember,
      formFields,
      skills,
      recommended,
      reason,
      submittedBy
    });

    await newEval.save();
    res.json({ message: 'Evaluation saved' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// const PDFDocument = require('pdfkit');

// router.get('/pdf/:id', async (req, res) => {
//   const evalData = await Evaluation.findOne({ candidateId: req.params.id }).populate('candidateId');
//   if (!evalData) return res.status(404).send("Evaluation not found");

//   const doc = new PDFDocument({ size: 'A4', margin: 50 });
//   res.setHeader('Content-Disposition', `attachment; filename=evaluation_${evalData.candidateId.registerNo}.pdf`);
//   res.setHeader('Content-Type', 'application/pdf');
//   doc.pipe(res);

//   // Header
//   doc.fontSize(14).text("Office of Students' Welfare", { align: 'center' });
//   doc.moveDown(0.5);
//   doc.fontSize(16).text("Student Council 2025 - 2026 – Evaluation Sheet", { align: 'center', underline: true });
//   doc.moveDown();

//   if (evalData.isReturningMember) {
//     generateReturningMemberPage(doc, evalData);
//   } else {
//     generateNewApplicantPage(doc, evalData);
//   }

//   doc.end();
// });

// function generateReturningMemberPage(doc, data) {
//   const f = data.formFields;
//   doc.fontSize(12);
//   doc.text(`1. Name: ${f.personalDetails.name}`);
//   doc.text(`2. Reg No: ${f.personalDetails.registerNo}`);
//   doc.text(`3. Mobile No: ${f.personalDetails.mobile}`);
//   doc.text(`4. Program: ${f.personalDetails.program}`);
//   doc.text(`5. School: ${f.personalDetails.school}`);
//   doc.text(`6. Gender (M/F): ${f.personalDetails.gender}`);
//   doc.text(`7. History of Arrears: ${f.personalDetails.historyOfArrears ? "Yes" : "No"}`);
//   doc.text(`8. Native State: ${f.personalDetails.nativeState}`);
//   doc.moveDown();

//   doc.text("Events Coordinated:");
//   (f.eventsCoordinated || []).forEach(ev => doc.text(`☑ ${ev}`));
//   doc.moveDown();

//   doc.text("Roles and Responsibilities:");
//   (f.rolesAndResponsibilities || []).forEach(role => doc.text(`☑ ${role}`));
//   doc.moveDown();

//   doc.text("Suggestions to promote CC events without OD:");
//   doc.text(f.suggestionsForEvents || "");
//   doc.moveDown();

//   doc.text("Suggestions to create mass awareness about Code of Conduct:");
//   doc.text(f.suggestionsForCodeOfConduct || "");
//   doc.moveDown();

//   doc.text("One improvement area in VIT:");
//   doc.text(f.improvementArea || "");
//   doc.moveDown();

//   doc.text("Skill Ratings:");
//   Object.entries(data.skills).forEach(([key, value]) => {
//     doc.text(`${capitalize(key)}: ${value}`);
//   });
//   doc.moveDown();

//   doc.text(`Recommended for SC: ${data.recommended ? "Yes" : "No"}`);
//   doc.text(`Reason: ${data.reason}`);
//   doc.text(`Submitted By: ${data.submittedBy}`);
//   doc.text(`Submitted At: ${data.submittedAt.toDateString()}`);
// }

// function generateNewApplicantPage(doc, data) {
//   const f = data.formFields;
//   doc.fontSize(12);
//   doc.text(`1. Name: ${f.personalDetails.name}`);
//   doc.text(`2. Reg No: ${f.personalDetails.registerNo}`);
//   doc.text(`3. Mobile No: ${f.personalDetails.mobile}`);
//   doc.text(`4. Program: ${f.personalDetails.program}`);
//   doc.text(`5. School: ${f.personalDetails.school}`);
//   doc.text(`6. Gender (M/F): ${f.personalDetails.gender}`);
//   doc.text(`7. History of Arrears: ${f.personalDetails.historyOfArrears ? "Yes" : "No"}`);
//   doc.text(`8. Native State: ${f.personalDetails.nativeState}`);
//   doc.moveDown();

//   doc.text("Leadership Roles:");
//   (f.leadershipRoles || []).forEach((lr, i) => {
//     doc.text(`${i + 1}. ${lr.role} - ${lr.organization} - ${lr.contribution}`);
//   });
//   doc.moveDown();

//   doc.text("Suggestions to promote CC events without OD:");
//   doc.text(f.suggestionsForEvents || "");
//   doc.moveDown();

//   doc.text("Suggestions to create mass awareness about Code of Conduct:");
//   doc.text(f.suggestionsForCodeOfConduct || "");
//   doc.moveDown();

//   doc.text("One improvement area in VIT:");
//   doc.text(f.improvementArea || "");
//   doc.moveDown();

//   doc.text("Skill Ratings:");
//   Object.entries(data.skills).forEach(([key, value]) => {
//     doc.text(`${capitalize(key)}: ${value}`);
//   });
//   doc.moveDown();

//   doc.text(`Recommended for SC: ${data.recommended ? "Yes" : "No"}`);
//   doc.text(`Reason: ${data.reason}`);
//   doc.text(`Committee(s) Recommended: ${(f.recommendedCommittee || []).join(', ')}`);
//   doc.text(`Submitted By: ${data.submittedBy}`);
//   doc.text(`Submitted At: ${data.submittedAt.toDateString()}`);
// }

// function capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');
// }

