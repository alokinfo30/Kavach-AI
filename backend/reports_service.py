import io
import logging
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas

from .models import AITest, ComplianceLog

logger = logging.getLogger(__name__)

def generate_compliance_pdf(user_id: int) -> bytes:
    """Generates a PDF report of compliance logs for a specific user."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    # Title
    elements.append(Paragraph("RAI Ops Compliance Report", styles["Title"]))
    elements.append(
        Paragraph(
            f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            styles["Normal"],
        )
    )
    elements.append(Spacer(1, 12))

    # Fetch Data
    logs = (
        ComplianceLog.query.filter_by(user_id=user_id)
        .order_by(ComplianceLog.timestamp.desc())
        .limit(100)
        .all()
    )

    if not logs:
        elements.append(Paragraph("No compliance logs found.", styles["Normal"]))
    else:
        # Table Data
        data = [["Timestamp", "Action", "Resource", "Status"]]
        for log in logs:
            data.append(
                [
                    log.timestamp.strftime("%Y-%m-%d %H:%M"),
                    log.action,
                    Paragraph(log.resource, styles["BodyText"]),  # Wrap long text
                    log.status,
                ]
            )

        # Table Styling
        table = Table(data, colWidths=[100, 120, 200, 80])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ]
            )
        )
        elements.append(table)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

def generate_test_report_pdf(test: AITest) -> bytes:
    """Generates a PDF report for a specific Red Team test."""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 50, f"Red Team Test Report: {test.test_name}")

    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Test Type: {test.test_type}")
    p.drawString(50, height - 100, f"Target System: {test.target_system}")
    p.drawString(50, height - 120, f"Date: {test.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
    p.drawString(50, height - 140, f"Status: {test.status}")

    # Results Summary
    y = height - 180
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Results Summary")
    y -= 25

    p.setFont("Helvetica", 12)
    if test.results:
        p.drawString(50, y, f"Risk Level: {results.get('risk_level', 'N/A')}")
        y -= 20
        p.drawString(50, y, f"Overall Score: {results.get('overall_score', 0) * 100:.1f}%")
        y -= 20
        p.drawString(50, y, f"Tests Conducted: {results.get('tests_conducted', 0)}")
        y -= 30

        # Precautions & Mitigation Techniques
        precautions = results.get("precautions", [])
        if precautions:
            p.setFont("Helvetica-Bold", 13)
            p.drawString(50, y, "Recommended Precautions & Mitigation Techniques")
            y -= 20
            p.setFont("Helvetica", 10)
            for prec in precautions:
                if y < 80:
                    p.showPage()
                    y = height - 50
                    p.setFont("Helvetica", 10)
                p.setFont("Helvetica-Bold", 10)
                p.drawString(50, y, f"• {prec.get('technique', '')} [{prec.get('priority', 'High')} Priority]")
                y -= 15
                p.setFont("Helvetica", 9)
                desc = prec.get("description", "")
                if len(desc) > 85:
                    p.drawString(65, y, desc[:85])
                    y -= 12
                    p.drawString(65, y, desc[85:170])
                else:
                    p.drawString(65, y, desc)
                y -= 18
        
        # Vulnerabilities found
        vulns = results.get("vulnerabilities_found", [])
        if vulns and y > 100:
            p.setFont("Helvetica-Bold", 13)
            p.drawString(50, y, "Vulnerabilities Identified")
            y -= 20
            p.setFont("Helvetica", 10)
            for v in vulns:
                if y < 80:
                    p.showPage()
                    y = height - 50
                    p.setFont("Helvetica", 10)
                p.drawString(50, y, f"- {v.get('type', '')} ({v.get('severity', '')}): {v.get('description', '')[:75]}")
                y -= 16
    else:
        p.drawString(50, y, "No results available.")

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer.getvalue()