import { MeetingMinutes } from '@/hooks/use-process-meeting-notes';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Function to export meeting minutes as a Word document
export async function exportToWord(minutes: MeetingMinutes, filename: string = 'meeting-minutes.docx') {
  // Create a new document with professional Fortune 500 styling
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 24, // 12pt
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 48, // 24pt
            bold: true,
            color: "2F5496", // Professional blue
          },
          paragraph: {
            spacing: { after: 240 },
            alignment: AlignmentType.CENTER,
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 36, // 18pt
            bold: true,
            color: "2F5496", // Professional blue
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 720, // 1 inch
            right: 720, // 1 inch
            bottom: 720, // 1 inch
            left: 720, // 1 inch
          },
        },
      },
      children: [
        // Company Header (Watermark)
        new Paragraph({
          children: [
            new TextRun({
              text: "CONFIDENTIAL",
              bold: true,
              size: 20,
              color: "CCCCCC",
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 120 },
        }),
        
        // Title
        new Paragraph({
          text: minutes.title,
          heading: HeadingLevel.HEADING_1,
        }),
        
        // Date and Meeting Info
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated on: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}`,
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        
        // Executive Summary & Action Minutes
        new Paragraph({
          text: "Executive Summary & Action Minutes",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: minutes.executiveSummary,
          spacing: { after: 200 },
        }),
        ...(minutes.actionMinutes ? [
          new Paragraph({
            text: minutes.actionMinutes,
            spacing: { after: 400 },
          })
        ] : []),
        
        // Attendees
        new Paragraph({
          text: "Attendees",
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Role", bold: true })] })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
              ],
            }),
            ...minutes.attendees.map(attendee => 
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph(attendee.name)],
                  }),
                  new TableCell({
                    children: [new Paragraph(attendee.role)],
                  }),
                ],
              })
            ),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 100, bottom: 100 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "2F5496" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "2F5496" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "2F5496" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "2F5496" },
          },
        }),
        
        // Decisions Made
        new Paragraph({
          text: "Decisions Made",
          heading: HeadingLevel.HEADING_2,
        }),
        ...minutes.decisions.map((decision, index) => 
          new Paragraph({
            children: [
              new TextRun({ 
                text: `${index + 1}. ${decision.description}`, 
                break: 1,
                bold: false,
              }),
              new TextRun({ 
                text: `   Made by: ${decision.madeBy} | Date: ${decision.date}`, 
                break: 1,
                italics: true,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { after: 200 },
          })
        ),
        
        // Risks & Mitigations
        new Paragraph({
          text: "Risks & Mitigations",
          heading: HeadingLevel.HEADING_2,
        }),
        ...minutes.risks.map((risk, index) => [
          new Paragraph({
            children: [
              new TextRun({ 
                text: `Risk ${index + 1}: ${risk.description}`, 
                bold: true,
                break: 1,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ 
                text: `Mitigation: ${risk.mitigation}`, 
                break: 1,
              }),
            ],
            spacing: { after: 300 },
          }),
        ]).flat(),
        
        // Action Items
        new Paragraph({
          text: "Action Items",
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "#", bold: true })] })],
                  width: { size: 5, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })],
                  width: { size: 55, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Owner", bold: true })] })],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Deadline", bold: true })] })],
                  width: { size: 20, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
              ],
            }),
            ...minutes.actionItems.map((item, index) => 
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph(`${index + 1}`)],
                  }),
                  new TableCell({
                    children: [new Paragraph(item.description)],
                  }),
                  new TableCell({
                    children: [new Paragraph(item.owner)],
                  }),
                  new TableCell({
                    children: [new Paragraph(item.deadline)],
                  }),
                ],
              })
            ),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { top: 100, bottom: 100 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "2F5496" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "2F5496" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "2F5496" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "2F5496" },
          },
        }),
        
        // Observations & Insights
        new Paragraph({
          text: "Observations & Insights",
          heading: HeadingLevel.HEADING_2,
        }),
        ...minutes.observations.map((observation, index) => 
          new Paragraph({
            children: [
              new TextRun({ 
                text: `${index + 1}. ${observation.description}`, 
                break: 1,
              }),
            ],
            spacing: { after: 200 },
          })
        ),
        
        // Footer
        new Paragraph({
          children: [
            new TextRun({
              text: "Generated by EasyMinutes - Fortune 500 Standard Meeting Minutes",
              size: 18,
              color: "666666",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
      ],
    }],
  });

  // Convert to blob and save
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// Function to export meeting minutes as a PDF
export async function exportToPdf(minutes: MeetingMinutes, filename: string = 'meeting-minutes.pdf') {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add a new page
  let page = pdfDoc.addPage([612, 792]); // Standard letter size
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const margin = 50;
  const lineHeight = 20;
  let yPosition = pageHeight - 70; // Start from top with some margin
  
  // Define colors for professional Fortune 500 look
  const primaryColor = rgb(0.18, 0.33, 0.59); // Dark blue
  const secondaryColor = rgb(0.85, 0.88, 0.95); // Light blue for headers
  const blackColor = rgb(0, 0, 0);
  const grayColor = rgb(0.3, 0.3, 0.3);
  const lightGrayColor = rgb(0.8, 0.8, 0.8);
  
  // Helper function to add text to PDF
  const addText = (text: string, fontSize: number = 12, isBold: boolean = false, isHeading: boolean = false, color = blackColor) => {
    if (yPosition < 50) {
      // Add a new page if we're near the bottom
      page = pdfDoc.addPage([612, 792]);
      yPosition = pageHeight - 70;
    }
    
    const usedFont = isBold ? boldFont : font;
    const actualFontSize = isHeading ? fontSize + 4 : fontSize;
    
    // Split text into lines that fit within the page width
    const words = text.split(' ');
    let line = '';
    const lines = [];
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const textWidth = usedFont.widthOfTextAtSize(testLine, actualFontSize);
      
      if (textWidth > pageWidth - 2 * margin && line !== '') {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    }
    
    lines.push(line);
    
    // Add each line to the PDF
    for (const line of lines) {
      if (yPosition < 50) {
        // Add a new page if we're near the bottom
        page = pdfDoc.addPage([612, 792]);
        yPosition = pageHeight - 70;
      }
      
      page.drawText(line.trim(), {
        x: margin,
        y: yPosition,
        size: actualFontSize,
        font: usedFont,
        color: color,
      });
      
      yPosition -= lineHeight * (isHeading ? 1.5 : 1);
    }
    
    // Add extra space after headings
    if (isHeading) {
      yPosition -= 15;
    }
  };
  
  // Helper function to add a separator
  const addSeparator = () => {
    yPosition -= 10;
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: pageWidth - margin, y: yPosition },
      thickness: 1,
      color: grayColor,
    });
    yPosition -= 20;
  };
  
  // Helper function to draw a table row
  const drawTableRow = (cells: string[], columnWidths: number[], isHeader: boolean = false, rowIndex: number = 0) => {
    if (yPosition < 100) {
      // Add a new page if we're near the bottom
      page = pdfDoc.addPage([612, 792]);
      yPosition = pageHeight - 70;
    }
    
    // Draw background for header
    if (isHeader) {
      page.drawRectangle({
        x: margin,
        y: yPosition - 15,
        width: pageWidth - 2 * margin,
        height: 25,
        color: secondaryColor,
      });
    } else if (rowIndex % 2 === 0) {
      // Alternate row coloring for better readability
      page.drawRectangle({
        x: margin,
        y: yPosition - 15,
        width: pageWidth - 2 * margin,
        height: 25,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    let xPosition = margin;
    const cellHeight = 25;
    
    cells.forEach((cell, index) => {
      // Draw cell text
      page.drawText(cell, {
        x: xPosition + 5, // Add some padding
        y: yPosition,
        size: isHeader ? 12 : 11,
        font: isHeader ? boldFont : font,
        color: isHeader ? primaryColor : blackColor,
      });
      
      // Draw cell border
      page.drawRectangle({
        x: xPosition,
        y: yPosition - 15,
        width: columnWidths[index],
        height: cellHeight,
        borderColor: lightGrayColor,
        borderWidth: 0.5,
      });
      
      // Move to next column
      xPosition += columnWidths[index];
    });
    
    // Move to next row
    yPosition -= cellHeight;
  };
  
  // Add watermark
  page.drawText("CONFIDENTIAL", {
    x: pageWidth - margin - 100,
    y: pageHeight - 30,
    size: 14,
    font: boldFont,
    color: rgb(0.8, 0.8, 0.8),
  });
  
  // Title
  addText(minutes.title, 20, true, true, primaryColor);
  
  // Date
  addText(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 12, true, false, blackColor);
  
  yPosition -= 30;
  
  // Executive Summary & Action Minutes
  addText("Executive Summary & Action Minutes", 16, true, true, primaryColor);
  addText(minutes.executiveSummary);
  if (minutes.actionMinutes) {
    yPosition -= 15;
    addText(minutes.actionMinutes);
  }
  
  addSeparator();
  
  // Attendees
  addText("Attendees", 16, true, true, primaryColor);
  
  // Draw attendees table
  if (minutes.attendees.length > 0) {
    const columnWidths = [(pageWidth - 2 * margin) * 0.5, (pageWidth - 2 * margin) * 0.5];
    drawTableRow(["Name", "Role"], columnWidths, true);
    
    minutes.attendees.forEach((attendee, index) => {
      drawTableRow([attendee.name, attendee.role], columnWidths, false, index);
    });
    
    yPosition -= 10;
  }
  
  addSeparator();
  
  // Decisions Made
  addText("Decisions Made", 16, true, true, primaryColor);
  minutes.decisions.forEach((decision, index) => {
    addText(`${index + 1}. ${decision.description}`);
    addText(`   Made by: ${decision.madeBy} | Date: ${decision.date}`, 10, false, false, grayColor);
    yPosition -= 15;
  });
  
  addSeparator();
  
  // Risks & Mitigations
  addText("Risks & Mitigations", 16, true, true, primaryColor);
  minutes.risks.forEach((risk, index) => {
    addText(`Risk ${index + 1}: ${risk.description}`, 12, true);
    addText(`Mitigation: ${risk.mitigation}`);
    yPosition -= 15;
  });
  
  addSeparator();
  
  // Action Items
  addText("Action Items", 16, true, true, primaryColor);
  
  // Draw action items table
  if (minutes.actionItems.length > 0) {
    const columnWidths = [(pageWidth - 2 * margin) * 0.05, (pageWidth - 2 * margin) * 0.55, (pageWidth - 2 * margin) * 0.2, (pageWidth - 2 * margin) * 0.2];
    drawTableRow(["#", "Description", "Owner", "Deadline"], columnWidths, true);
    
    minutes.actionItems.forEach((item, index) => {
      drawTableRow([`${index + 1}`, item.description, item.owner, item.deadline], columnWidths, false, index);
    });
    
    yPosition -= 10;
  }
  
  addSeparator();
  
  // Observations & Insights
  addText("Observations & Insights", 16, true, true, primaryColor);
  minutes.observations.forEach((observation, index) => {
    addText(`${index + 1}. ${observation.description}`);
    yPosition -= 15;
  });
  
  // Add footer
  yPosition -= 30;
  if (yPosition < 100) {
    page = pdfDoc.addPage([612, 792]);
    yPosition = pageHeight - 70;
  }
  
  page.drawText("Generated by EasyMinutes - Fortune 500 Standard Meeting Minutes", {
    x: margin,
    y: 30,
    size: 10,
    font: font,
    color: grayColor,
  });
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Create a Blob and save it
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  saveAs(blob, filename);
}