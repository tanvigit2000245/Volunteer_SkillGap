import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { getDeploymentPlanById } from "./planner.service.js";

/**
 * Build aggregated deployment sheet data grouped by service location
 */
export const getDeploymentSheetData = async (runId) => {
  const plan = await getDeploymentPlanById(runId);
  const { run, assignments, skillGaps } = plan;

  // Group assignments and gaps by location
  const locationMap = new Map();

  for (const loc of run.locations) {
    locationMap.set(loc._id.toString(), {
      locationId: loc._id,
      name: loc.name,
      address: loc.address || "N/A",
      city: loc.city || "N/A",
      date: loc.date,
      shiftStart: loc.shiftStart,
      shiftEnd: loc.shiftEnd,
      assignments: [],
      skillGaps: [],
    });
  }

  for (const a of assignments) {
    const locId = (a.location?._id || a.location).toString();
    if (!locationMap.has(locId)) {
      locationMap.set(locId, {
        locationId: locId,
        name: a.location?.name || "Unknown Location",
        assignments: [],
        skillGaps: [],
      });
    }

    locationMap.get(locId).assignments.push({
      assignmentId: a._id,
      task: a.task,
      volunteerId: a.volunteer?._id,
      volunteerName: a.volunteer?.user?.fullName || "Unassigned",
      volunteerEmail: a.volunteer?.user?.email || "N/A",
      volunteerPhone: a.volunteer?.phone || "N/A",
      matchScore: a.matchScore,
      isManualOverride: a.isManualOverride,
      overriddenBy: a.overriddenBy?.fullName || null,
      overrideReason: a.overrideReason || null,
      warnings: a.warnings || [],
      status: a.status,
    });
  }

  for (const g of skillGaps) {
    const locId = (g.location?._id || g.location).toString();
    if (locationMap.has(locId)) {
      locationMap.get(locId).skillGaps.push({
        gapId: g._id,
        task: g.task,
        requiredSkill: g.requiredSkill,
        requiredLanguage: g.requiredLanguage,
        required: g.required,
        assigned: g.assigned,
        shortage: g.shortage,
        reasonCodes: g.explanation?.reasonCodes || [],
        description: g.explanation?.description || "Unresolved constraint",
      });
    }
  }

  return {
    run: {
      id: run._id,
      title: run.title,
      targetDate: run.targetDate,
      status: run.status,
      summary: run.summary,
      createdBy: run.createdBy?.fullName,
      confirmedBy: run.confirmedBy?.fullName,
    },
    locations: Array.from(locationMap.values()),
    totalAssignments: assignments.length,
    totalGaps: skillGaps.length,
  };
};

/**
 * Generate Excel Deployment Sheet workbook
 */
export const generateExcelDeploymentSheet = async (runId) => {
  const sheetData = await getDeploymentSheetData(runId);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Volunteer Skill-Gap Deployment Planner";
  workbook.created = new Date();

  // Tab 1: Deployment Roster
  const rosterSheet = workbook.addWorksheet("Deployment Roster");
  rosterSheet.columns = [
    { header: "Location Name", key: "locationName", width: 25 },
    { header: "City", key: "city", width: 15 },
    { header: "Date", key: "date", width: 15 },
    { header: "Shift Time", key: "shiftTime", width: 18 },
    { header: "Task / Role", key: "task", width: 25 },
    { header: "Volunteer Name", key: "volunteerName", width: 25 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Match Score", key: "matchScore", width: 14 },
    { header: "Override?", key: "isOverride", width: 12 },
    { header: "Override Reason", key: "overrideReason", width: 30 },
  ];

  // Header styling
  rosterSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  rosterSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2B6CB0" },
  };

  for (const loc of sheetData.locations) {
    for (const a of loc.assignments) {
      rosterSheet.addRow({
        locationName: loc.name,
        city: loc.city || "N/A",
        date: loc.date ? new Date(loc.date).toISOString().split("T")[0] : "N/A",
        shiftTime: `${loc.shiftStart} - ${loc.shiftEnd}`,
        task: a.task,
        volunteerName: a.volunteerName,
        phone: a.volunteerPhone,
        email: a.volunteerEmail,
        matchScore: a.matchScore,
        isOverride: a.isManualOverride ? "YES" : "NO",
        overrideReason: a.overrideReason || "N/A",
      });
    }
  }

  // Tab 2: Skill Gaps & Explainability
  const gapSheet = workbook.addWorksheet("Unresolved Skill Gaps");
  gapSheet.columns = [
    { header: "Location Name", key: "locationName", width: 25 },
    { header: "Task Role", key: "task", width: 25 },
    { header: "Required Skill", key: "requiredSkill", width: 20 },
    { header: "Required Language", key: "requiredLanguage", width: 20 },
    { header: "Required", key: "required", width: 12 },
    { header: "Assigned", key: "assigned", width: 12 },
    { header: "Shortage", key: "shortage", width: 12 },
    { header: "Reason Codes", key: "reasonCodes", width: 35 },
    { header: "Explainability Summary", key: "description", width: 50 },
  ];

  gapSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  gapSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFC53030" },
  };

  for (const loc of sheetData.locations) {
    for (const g of loc.skillGaps) {
      gapSheet.addRow({
        locationName: loc.name,
        task: g.task,
        requiredSkill: g.requiredSkill || "N/A",
        requiredLanguage: g.requiredLanguage || "N/A",
        required: g.required,
        assigned: g.assigned,
        shortage: g.shortage,
        reasonCodes: g.reasonCodes.join(", "),
        description: g.description,
      });
    }
  }

  return workbook;
};

/**
 * Generate PDF Deployment Sheet document stream
 */
export const generatePdfDeploymentSheet = async (runId, res) => {
  const sheetData = await getDeploymentSheetData(runId);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(res);

  // Title header
  doc.fontSize(20).font("Helvetica-Bold").text("Volunteer Deployment Sheet", { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(12).font("Helvetica").text(sheetData.run.title, { align: "center" });
  doc.text(`Status: ${sheetData.run.status} | Target Date: ${new Date(sheetData.run.targetDate).toISOString().split("T")[0]}`, { align: "center" });
  doc.moveDown(1);

  // Summary box
  doc.fontSize(11).font("Helvetica-Bold").text("Executive Deployment Summary:");
  doc.font("Helvetica").fontSize(10);
  doc.text(`• Total Locations: ${sheetData.locations.length}`);
  doc.text(`• Total Headcount Required: ${sheetData.run.summary?.totalRequiredHeadcount || 0}`);
  doc.text(`• Total Assigned Volunteers: ${sheetData.totalAssignments}`);
  doc.text(`• Unresolved Skill Gaps: ${sheetData.totalGaps}`);
  doc.text(`• Manual Overrides: ${sheetData.run.summary?.totalOverrides || 0}`);
  doc.moveDown(1);

  // Iterate over each location
  for (const loc of sheetData.locations) {
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#2B6CB0").text(`Location: ${loc.name}`);
    doc.fillColor("#000000").fontSize(10).font("Helvetica");
    doc.text(`Address: ${loc.address}, ${loc.city} | Shift: ${loc.shiftStart} - ${loc.shiftEnd}`);
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold").text("Assignments:");
    if (loc.assignments.length === 0) {
      doc.font("Helvetica-Oblique").text("  (No volunteers assigned to this location yet)");
    } else {
      for (const a of loc.assignments) {
        const overrideTag = a.isManualOverride ? " [MANUAL OVERRIDE]" : "";
        doc.font("Helvetica").text(`  • [${a.task}] ${a.volunteerName} (Ph: ${a.volunteerPhone}) - Match Score: ${a.matchScore}%${overrideTag}`);
        if (a.isManualOverride && a.overrideReason) {
          doc.font("Helvetica-Oblique").text(`    Override reason: ${a.overrideReason}`);
        }
      }
    }
    doc.moveDown(0.5);

    if (loc.skillGaps.length > 0) {
      doc.font("Helvetica-Bold").fillColor("#C53030").text("Unresolved Skill Gaps:");
      for (const g of loc.skillGaps) {
        doc.font("Helvetica").fillColor("#000000").text(`  ⚠ ${g.task}: Shortage of ${g.shortage} volunteer(s).`);
        doc.font("Helvetica-Oblique").text(`    Reason: ${g.description}`);
      }
      doc.moveDown(0.5);
    }

    doc.moveDown(0.8);
  }

  // Footer / Coordinator Sign-off
  doc.moveDown(1);
  doc.fontSize(10).font("Helvetica-Bold").text("Coordinator Authorization:");
  doc.font("Helvetica").text("Prepared By: __________________________   Signature: __________________________   Date: ______________");

  doc.end();
};
