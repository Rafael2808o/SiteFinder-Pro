import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

// A4 at 96dpi. The sheet component lays out its content in blocks of
// exactly this height so a page break always lands on a section boundary,
// never mid-paragraph or mid-image.
export const PDF_PAGE_WIDTH = 794
export const PDF_PAGE_HEIGHT = 1123

export async function exportNodeToPdf(node: HTMLElement, filename: string): Promise<void> {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: PDF_PAGE_WIDTH,
  })

  const pxScale = canvas.width / PDF_PAGE_WIDTH
  const sliceHeightPx = Math.round(PDF_PAGE_HEIGHT * pxScale)
  const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeightPx))

  const pdf = new jsPDF({ unit: 'px', format: [PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT] })

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) pdf.addPage([PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT])

    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = canvas.width
    sliceCanvas.height = sliceHeightPx
    const ctx = sliceCanvas.getContext('2d')
    if (!ctx) continue
    ctx.drawImage(
      canvas,
      0,
      page * sliceHeightPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx,
    )
    const imgData = sliceCanvas.toDataURL('image/jpeg', 0.92)
    pdf.addImage(imgData, 'JPEG', 0, 0, PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT)
  }

  pdf.save(filename)
}
