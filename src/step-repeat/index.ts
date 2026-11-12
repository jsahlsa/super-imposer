import { PDFDocument } from "pdf-lib"
import { inchesToPoints } from "../utils"
import type { StepAndRepeatOptions } from "../types"

const stepAndRepeat = async (
  fileBuffer: ArrayBuffer,
  {
    outputSize: { outputWidth = 8.5, outputHeight = 11 } = {},
    cols = 2,
    rows = 5
  }: StepAndRepeatOptions = {}
): Promise<Uint8Array<ArrayBufferLike>> => {
  const inputPDF = await PDFDocument.load(fileBuffer)
  // create output pdf
  const outputPDF = await PDFDocument.create()
  // get page count of input
  const pageCount = inputPDF.getPageCount()
  // iterate over page count to add pages
  // should refactor to a reusable function, could use for other impositions
  for (let i = 0; i < pageCount; i++) {
    outputPDF.addPage([inchesToPoints(outputWidth), inchesToPoints(outputHeight)])
  }

  // should source be drawn to smallest page size that can fit it firts
  // then drawn to th output size
  // might make positioning easier
  // for now we'll just center on the output size

  // should check if all pages are same size in source
  // also check that computed width and height < output width and height
  const { width: srcWidth, height: srcHeight } = inputPDF.getPage(0).getSize()
  const outputWidthPoints = inchesToPoints(outputWidth)
  const outputHeightPoints = inchesToPoints(outputHeight)

  if (srcWidth * cols > outputWidthPoints) {
    throw new Error('cannot fit that width')
  }

  if (srcHeight * rows > outputHeightPoints) {
    throw new Error('cannot fit that height')
  }
  // draw source to destination
  // go page by page
  for (let i = 0; i < pageCount; i++) {
    const [source] = await outputPDF.embedPdf(inputPDF, [i])
    const targetPage = outputPDF.getPages()[i]
    console.log(source, 'source in draw pages', targetPage, 'target')

    let yPos = (outputHeightPoints - (rows * srcHeight)) / 2
    let xPos = (outputWidthPoints - (cols * srcWidth)) / 2

    for (let j = 0; j < rows; j++) {
      for (let k = 0; k < cols; k++) {
        console.log(xPos, yPos, 'x and y postions when creating pages')
        // drawing starts at top row to bottom row
        // position is bottom left of each source
        const x = xPos + k * srcWidth
        const y = yPos + (rows - 1 - j) * srcHeight
        targetPage.drawPage(source, {
          x,
          y
        })
      }
    }

  }
  // return array buffer
  return await outputPDF.save()
}

export { stepAndRepeat }
