import {
  getDeploymentSheetData,
  generateExcelDeploymentSheet,
  generatePdfDeploymentSheet,
} from "../services/report.service.js";

/**
 * Get aggregated deployment sheet data as JSON (for UI presentation)
 */
export const getDeploymentSheet = async (req, res) => {
  try {
    const data = await getDeploymentSheetData(req.params.runId);

    return res.status(200).json({
      success: true,
      message: "Deployment sheet data retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Get deployment sheet error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to retrieve deployment sheet",
    });
  }
};

/**
 * Export deployment sheet as downloadable Excel workbook (.xlsx)
 */
export const exportExcel = async (req, res) => {
  try {
    const workbook = await generateExcelDeploymentSheet(req.params.runId);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=DeploymentSheet_${req.params.runId}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Export Excel error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to export Excel report",
    });
  }
};

/**
 * Export deployment sheet as downloadable PDF document (.pdf)
 */
export const exportPdf = async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=DeploymentSheet_${req.params.runId}.pdf`
    );

    await generatePdfDeploymentSheet(req.params.runId, res);
  } catch (error) {
    console.error("Export PDF error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to export PDF report",
    });
  }
};
