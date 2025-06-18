const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright'); // ✅ Replaces puppeteer
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const HandlebarsInstance = allowInsecurePrototypeAccess(Handlebars);
const archiver = require('archiver');
const Evaluation = require('../models/Evaluation');

// ─── Handlebars Helpers ────────────────────────────────────────────────
HandlebarsInstance.registerHelper('eq', (a, b) => a === b);
HandlebarsInstance.registerHelper('inc', (i) => i + 1);
HandlebarsInstance.registerHelper('add', (a, b, c) => a + b + c);
HandlebarsInstance.registerHelper('sub', (a, b) => Math.max(a - b, 0));
HandlebarsInstance.registerHelper('times', function (n, block) {
  let out = '';
  for (let i = 0; i < n; ++i) out += block.fn(i);
  return out;
});

const EVENTS = [
  "New Year", "Pongal", "Republic Day", "Primavera", "Yantra", "Quanta", "Women’s Day", "Counselling week",
  "University Day", "Alumni Day", "Independence Day", "Engineers Day", "Navy Day", "Newbie fiesta",
  "Regional New Year", "Gravitas", "Quality Week", "Suicide Prevention Day", "ISRO Lecture"
];

const ROLES = [
  "Purchase", "Documentation", "Design", "Registration", "Email Drafting", "Publicity",
  "Hall Arrangement", "Attendance Marking", "Technical Committee", "Guest Care",
  "Event Coordination", "Refreshments", "Invitation & Certificate Distribution", "Involvement in SW Office Work"
];

function prepareTemplateData(evalData) {
  const f = evalData.formFields;
  const logoPath = path.join(__dirname, '../templates/logo.png');
  const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });

  const flagsFor = (val) => ({
    excellent: val === 'Excellent',
    good: val === 'Good',
    average: val === 'Average',
    belowAverage: val === 'Below Average'
  });

  const skillFlags = {
    skills: [
      { label: "Communication", value: evalData.skills.communication },
      { label: "Leadership", value: evalData.skills.leadership },
      { label: "Teamwork", value: evalData.skills.teamwork },
      { label: "Problem Solving", value: evalData.skills.problemSolving },
      { label: "Overall Impression", value: evalData.skills.impression }
    ]
  };

  const leadershipRoles = !evalData.isReturningMember && Array.isArray(f.leadershipRoles)
    ? f.leadershipRoles.filter(item =>
      (item.organization && item.organization.trim()) ||
      (item.role && item.role.trim()) ||
      (item.contribution && item.contribution.trim())
    )
    : [];

  const eventsCoordinated = f.eventsCoordinated || [];
  const rolesSelected = f.rolesAndResponsibilities || [];

  const events = EVENTS.map(e => ({
    label: e,
    checked: eventsCoordinated.includes(e)
  }));
  const roles = ROLES.map(r => ({
    label: r,
    checked: rolesSelected.includes(r)
  }));

  // Compute unlisted ("Other") values
  const otherEvents = eventsCoordinated.filter(e => !EVENTS.includes(e)).join(', ');
  const otherRoles = rolesSelected.filter(r => !ROLES.includes(r)).join(', ');

  return {
    logoBase64,
    name: f.personalDetails.name,
    registerNo: f.personalDetails.registerNo,
    mobile: f.personalDetails.mobile,
    program: f.personalDetails.program,
    school: f.personalDetails.school,
    gender: f.personalDetails.gender,
    historyOfArrears: f.personalDetails.historyOfArrears ? 'Yes' : 'No',
    nativeState: f.personalDetails.nativeState,
    events,
    roles,
    otherEvents,  // ✅ Add this
    otherRoles,   // ✅ And this
    suggestionsForEvents: f.suggestionsForEvents,
    suggestionsForCodeOfConduct: f.suggestionsForCodeOfConduct,
    improvementArea: f.improvementArea,
    leadershipRoles,
    recommended: evalData.recommended ? 'Yes' : 'No',
    reason: evalData.reason,
    submittedAt: evalData.submittedAt?.toDateString() || '',
    ...skillFlags
  };
}


router.get('/pdf/all', async (req, res) => {
  const evalList = await Evaluation.find({});
  const archive = archiver('zip', { zlib: { level: 9 } });

  res.set({
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="evaluations.zip"'
  });

  archive.pipe(res);
  const browser = await chromium.launch({ headless: true }); // ✅ Playwright

  for (const evalData of evalList) {
    try {
      const templateFile = evalData.isReturningMember
        ? 'evaluation_template_returning.html'
        : 'evaluation_template_new.html';

      const templatePath = path.join(__dirname, '../templates', templateFile);
      const templateHtml = fs.readFileSync(templatePath, 'utf8');
      const compiled = HandlebarsInstance.compile(templateHtml, {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
      });

      const html = compiled(prepareTemplateData(evalData));
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle' });

      const buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });

      const fileName = `evaluation_${evalData.formFields.personalDetails.registerNo}.pdf`;
      archive.append(buffer, { name: fileName });
      await page.close();
    } catch (err) {
      console.error(`Error generating PDF for ${evalData._id}:`, err);
    }
  }

  await browser.close();
  archive.finalize();
});

router.get('/pdf/:id', async (req, res) => {
  try {
    const evalData = await Evaluation.findOne({ candidateId: req.params.id });
    if (!evalData) return res.status(404).send('Evaluation not found');

    const templateFile = evalData.isReturningMember
      ? 'evaluation_template_returning.html'
      : 'evaluation_template_new.html';

    const templatePath = path.join(__dirname, '../templates', templateFile);
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const compiled = HandlebarsInstance.compile(templateHtml);
    const finalHtml = compiled(prepareTemplateData(evalData));

    const browser = await chromium.launch({ headless: true }); // ✅ Playwright here
    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="evaluation_${evalData.formFields.personalDetails.registerNo}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = router;
