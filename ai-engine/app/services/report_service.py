import os
from typing import Any, Dict, List

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable,
)


def generate_pdf_report(
    dataset_info: dict,
    eda_result: dict,
    insights: list,
    output_path: str,
) -> str:
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=20,
        spaceAfter=12,
        textColor=colors.HexColor("#1a1a2e"),
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading2"],
        fontSize=14,
        spaceBefore=12,
        spaceAfter=6,
        textColor=colors.HexColor("#16213e"),
    )
    body_style = styles["BodyText"]

    story = []

    # Title
    story.append(Paragraph("Visual Analytics — Dataset Report", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0f3460")))
    story.append(Spacer(1, 0.5 * cm))

    # Dataset summary
    story.append(Paragraph("Dataset Summary", heading_style))
    shape = eda_result.get("shape", {})
    ds_name = dataset_info.get("name", dataset_info.get("dataset_id", "N/A"))
    summary_data = [
        ["Property", "Value"],
        ["Dataset Name", str(ds_name)],
        ["Rows", str(shape.get("rows", "N/A"))],
        ["Columns", str(shape.get("cols", "N/A"))],
        ["Numeric Columns", str(len(eda_result.get("numeric_stats", {})))],
        ["Categorical Columns", str(len(eda_result.get("categorical_stats", {})))],
    ]
    summary_table = Table(summary_data, colWidths=[7 * cm, 10 * cm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.5 * cm))

    # Top Insights
    story.append(Paragraph("Top Insights", heading_style))
    top_insights = sorted(insights, key=lambda x: x.get("score", 0), reverse=True)[:10]
    if top_insights:
        insight_data = [["#", "Type", "Title", "Score"]]
        for i, ins in enumerate(top_insights, 1):
            insight_data.append([
                str(i),
                str(ins.get("type", "")),
                str(ins.get("title", ""))[:60],
                f"{ins.get('score', 0):.2f}",
            ])
        ins_table = Table(insight_data, colWidths=[1 * cm, 4 * cm, 11 * cm, 2 * cm])
        ins_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(ins_table)
    else:
        story.append(Paragraph("No insights available.", body_style))
    story.append(Spacer(1, 0.5 * cm))

    # EDA Statistics
    story.append(Paragraph("EDA Statistics — Numeric Columns", heading_style))
    numeric_stats = eda_result.get("numeric_stats", {})
    if numeric_stats:
        stats_data = [["Column", "Mean", "Median", "Std", "Min", "Max", "Skewness"]]
        for col, st in numeric_stats.items():
            stats_data.append([
                col[:25],
                str(st.get("mean", "N/A")),
                str(st.get("median", "N/A")),
                str(st.get("std", "N/A")),
                str(st.get("min", "N/A")),
                str(st.get("max", "N/A")),
                str(st.get("skewness", "N/A")),
            ])
        stat_col_widths = [4 * cm, 2.5 * cm, 2.5 * cm, 2.5 * cm, 2 * cm, 2 * cm, 2.5 * cm]
        stats_table = Table(stats_data, colWidths=stat_col_widths)
        stats_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3460")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(stats_table)
    else:
        story.append(Paragraph("No numeric statistics available.", body_style))

    story.append(Spacer(1, 0.5 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc")))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph("Generated by Visual Analytics AI Engine", styles["Italic"]))

    doc.build(story)
    return output_path
