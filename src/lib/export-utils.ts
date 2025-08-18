import { MeetingMinutes } from '@/hooks/use-process-meeting-notes';
import { saveAs } from 'file-saver';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Function to export meeting minutes as a Word document
export async function exportToWord(minutes: MeetingMinutes, filename: string = 'meeting-minutes.docx') {
  // Create a new document with professional styling
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
      properties: {},
      children: [
        // Company Header (if you want to add a company logo or name)
        // Title
        new Paragraph({
          text: minutes.title,
          heading: HeadingLevel.HEADING_1,
        }),
        
        // Date
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
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
                  children: [new Paragraph({ text: "Name", bold: true })],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Role", bold: true })],
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
        }),
        
        // Decisions Made
        new Paragraph({
          text: "Decisions Made",
          heading: HeadingLevel.HEADING_2,
        }),
        ...minutes.decisions.map(decision => 
          new Paragraph({
            children: [
              new TextRun({ text: decision.description, break: 1 }),
              new TextRun({ 
                text: `Made by: ${decision.madeBy} | Date: ${decision.date}`, 
                break: 1,
                italics: true,
                size: 20,
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
        ...minutes.risks.map(risk => [
          new Paragraph({
            children: [
              new TextRun({ text: "Risk: ", bold: true }),
              new TextRun({ text: risk.description, break: 1 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Mitigation: ", bold: true }),
              new TextRun({ text: risk.mitigation, break: 1 }),
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
                  children: [new Paragraph({ text: "Description", bold: true })],
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Owner", bold: true })],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
                new TableCell({
                  children: [new Paragraph({ text: "Deadline", bold: true })],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  shading: { fill: "D9E1F2" }, // Light blue header
                }),
              ],
            }),
            ...minutes.actionItems.map(item => 
              new TableRow({
                children: [
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
        }),
        
        // Observations & Insights
        new Paragraph({
          text: "Observations & Insights",
          heading: HeadingLevel.HEADING_2,
        }),
        ...minutes.observations.map(observation => 
          new Paragraph({
            text: observation.description,
            spacing: { after: 200 },
          })
        ),
      ],
    }],
  });

  // Convert to blob and save
  const blob = await Document.create(doc).then(docxDoc => docxDoc.toBlob());
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
  
  // Define colors for professional look
  const primaryColor = rgb(0.18, 0.33, 0.59); // Dark blue
  const secondaryColor = rgb(0.85, 0.88, 0.95); // Light blue for headers
  const blackColor = rgb(0, 0, 0);
  const grayColor = rgb(0.3, 0.3, 0.3);
  
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
  const drawTableRow = (cells: string[], columnWidths: number[], isHeader: boolean = false) => {
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
      
      // Move to next column
      xPosition += columnWidths[index];
    });
    
    // Move to next row
    yPosition -= cellHeight;
  };
  
  // Title
  addText(minutes.title, 20, true, true, primaryColor);
  
  // Date
  addText(`Generated on ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 12, false, false, grayColor);
  
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
    
    minutes.attendees.forEach(attendee => {
      drawTableRow([attendee.name, attendee.role], columnWidths);
    });
    
    yPosition -= 10;
  }
  
  addSeparator();
  
  // Decisions Made
  addText("Decisions Made", 16, true, true, primaryColor);
  minutes.decisions.forEach(decision => {
    addText(decision.description);
    addText(`Made by: ${decision.madeBy} | Date: ${decision.date}`, 10, false, false, grayColor);
    yPosition -= 15;
  });
  
  addSeparator();
  
  // Risks & Mitigations
  addText("Risks & Mitigations", 16, true, true, primaryColor);
  minutes.risks.forEach(risk => {
    addText(`Risk: ${risk.description}`, 12, true);
    addText(risk.mitigation);
    yPosition -= 15;
  });
  
  addSeparator();
  
  // Action Items
  addText("Action Items", 16, true, true, primaryColor);
  
  // Draw action items table
  if (minutes.actionItems.length > 0) {
    const columnWidths = [(pageWidth - 2 * margin) * 0.4, (pageWidth - 2 * margin) * 0.3, (pageWidth - 2 * margin) * 0.3];
    drawTableRow(["Description", "Owner", "Deadline"], columnWidths, true);
    
    minutes.actionItems.forEach(item => {
      drawTableRow([item.description, item.owner, item.deadline], columnWidths);
    });
    
    yPosition -= 10;
  }
  
  addSeparator();
  
  // Observations & Insights
  addText("Observations & Insights", 16, true, true, primaryColor);
  minutes.observations.forEach(observation => {
    addText(observation.description);
    yPosition -= 15;
  });
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Create a Blob and save it
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, filename);
}