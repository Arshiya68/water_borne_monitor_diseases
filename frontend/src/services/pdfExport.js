import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import api from './api'

export const generateOutbreakReport = async (villageData, stats) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Header
  doc.setFontSize(24)
  doc.setFont(undefined, 'bold')
  doc.text('WaterGuard', 20, yPosition)
  
  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text('Community Disease Monitoring System', 20, yPosition + 8)
  
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text('Outbreak Risk Assessment Report', 20, yPosition + 20)

  yPosition += 40

  // Report Date
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 20, yPosition)
  doc.text(`Report Time: ${new Date().toLocaleTimeString()}`, 20, yPosition + 7)

  yPosition += 20

  // Summary Section
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Executive Summary', 20, yPosition)

  yPosition += 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  
  const summaryText = [
    `Total Reports Processed: ${stats.total}`,
    `Verified Cases: ${stats.verified}`,
    `High-Risk Cases: ${stats.high_risk}`,
    `Verification Rate: ${stats.verification_rate}%`,
    `Villages Under Surveillance: ${stats.villages}`,
  ]

  summaryText.forEach((text) => {
    doc.text(text, 25, yPosition)
    yPosition += 7
  })

  yPosition += 10

  // Key Metrics
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Key Metrics', 20, yPosition)

  yPosition += 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  
  const metricsText = [
    `Average Household Members Affected: ${stats.average_affected}`,
    `Most Common Symptoms: Diarrhea, Fever`,
    `Primary Water Source Issues: River, Pond`,
    `System Status: OPERATIONAL`,
  ]

  metricsText.forEach((text) => {
    doc.text(text, 25, yPosition)
    yPosition += 7
  })

  yPosition += 10

  // Recommendations
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Recommended Actions', 20, yPosition)

  yPosition += 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  
  const recommendations = [
    '1. Increase water quality monitoring in high-risk areas',
    '2. Send preventive health awareness SMS to villagers',
    '3. Coordinate with ASHA workers for ground verification',
    '4. Arrange medical camps in identified hotspots',
    '5. Track disease progression weekly and update records',
  ]

  recommendations.forEach((rec) => {
    doc.text(rec, 25, yPosition)
    yPosition += 7
    if (yPosition > pageHeight - 20) {
      doc.addPage()
      yPosition = 20
    }
  })

  // Footer
  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text('This is an official report from the WaterGuard Disease Monitoring System', 20, pageHeight - 10)

  // Save PDF
  doc.save(`WaterGuard_Report_${new Date().toISOString().split('T')[0]}.pdf`)
}

export const generateVillageRiskReport = async (villageData) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 20

  // Title
  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.text(`Village Risk Assessment: ${villageData.village}`, 20, yPosition)

  yPosition += 15

  // Village Info
  doc.setFontSize(12)
  doc.setFont(undefined, 'normal')
  doc.text(`District: ${villageData.district}`, 20, yPosition)
  doc.text(`State: ${villageData.state}`, 20, yPosition + 7)

  yPosition += 20

  // Risk Analysis
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Risk Assessment', 20, yPosition)

  yPosition += 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')

  const riskInfo = [
    `ML Predicted Risk: ${villageData.ml_prediction?.risk_level || 'N/A'}`,
    `Confidence Level: ${((villageData.ml_prediction?.probability || 0) * 100).toFixed(1)}%`,
    `Composite Risk Score: ${villageData.composite_risk?.composite_score?.toFixed(1) || 'N/A'}/100`,
    `Total Reports: ${villageData.total_reports || 0}`,
    `Verified Cases: ${villageData.verified_reports || 0}`,
  ]

  riskInfo.forEach((info) => {
    doc.text(info, 25, yPosition)
    yPosition += 7
  })

  yPosition += 10

  // Water Quality
  if (villageData.water_quality) {
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Water Quality Status', 20, yPosition)

    yPosition += 8
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    const waterInfo = [
      `Quality Index: ${villageData.water_quality.water_quality_index.toFixed(1)}/100`,
      `Risk Level: ${villageData.water_quality.risk_level}`,
      `pH Level: ${villageData.water_quality.ph?.toFixed(2) || 'N/A'}`,
      `Turbidity: ${villageData.water_quality.turbidity?.toFixed(2) || 'N/A'} NTU`,
      `Dissolved Oxygen: ${villageData.water_quality.dissolved_oxygen?.toFixed(2) || 'N/A'} mg/L`,
    ]

    waterInfo.forEach((info) => {
      doc.text(info, 25, yPosition)
      yPosition += 7
    })
  }

  // Save PDF
  doc.save(`${villageData.village}_Risk_Report.pdf`)
}

export const generateDetailedAnalytics = async (analyticsData) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  let yPosition = 20

  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('System Analytics Report', 20, yPosition)

  yPosition += 20

  // Statistics
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('System Statistics', 20, yPosition)

  yPosition += 10
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')

  const stats = [
    `Total Reports: ${analyticsData.total_reports}`,
    `Verification Rate: ${analyticsData.verification_rate}%`,
    `Affected Villages: ${analyticsData.affected_villages}`,
    `High-Risk Cases: ${analyticsData.high_risk_areas}`,
    `Average Household Size: ${analyticsData.average_affected_per_report?.toFixed(1) || 'N/A'}`,
  ]

  stats.forEach((stat) => {
    doc.text(stat, 25, yPosition)
    yPosition += 7
  })

  doc.save(`WaterGuard_Analytics_${new Date().toISOString().split('T')[0]}.pdf`)
}