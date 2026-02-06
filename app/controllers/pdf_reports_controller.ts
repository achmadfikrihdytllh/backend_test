import { HttpContext } from '@adonisjs/core/http'
import { generatePdfValidator, uploadPdfValidator } from '#validators/pdf'
import PdfService from '#services/pdf_service'
import { inject } from '@adonisjs/core'

@inject()
export default class PdfReportsController {
  constructor(protected pdfService: PdfService) {}

  async index({ response }: HttpContext) {
    const files = await this.pdfService.getAllActive()
    return response.ok({ success: true, message: 'List PDF retrieved successfully', data: files })
  }

  async generate({ request, response }: HttpContext) {
    const payload = await request.validateUsing(generatePdfValidator)
    const newFile = await this.pdfService.generatePdf(payload)
    
    return response.created({ success: true, message: 'PDF generated successfully', data: newFile })
  }

  async upload({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(uploadPdfValidator)
      const newFile = await this.pdfService.uploadPdf(payload.file)

      return response.created({ success: true, message: 'PDF uploaded successfully', data: newFile })
    } catch (error) {
      if (error.messages && error.messages[0]?.rule === 'file.size') {
        return response.status(413).json({ success: false, message: 'File size exceeds limit (10MB)' })
      }
      return response.badRequest({ success: false, message: 'Validation failed' })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const pdf = await this.pdfService.softDelete(params.id)
      return response.ok({ success: true, message: 'PDF deleted successfully', data: pdf })
    } catch (error) {
      if (error.message === 'ALREADY_DELETED') {
        return response.badRequest({ success: false, message: 'PDF already deleted' })
      }
      return response.notFound({ success: false, message: 'PDF file not found' })
    }
  }
}