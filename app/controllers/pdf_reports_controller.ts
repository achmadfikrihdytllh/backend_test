import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import PdfFile from '#models/pdf_file'
import { generatePdfValidator, uploadPdfValidator } from '#validators/pdf'
import puppeteer from 'puppeteer'
import fs from 'node:fs'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'

export default class PdfReportsController {
  async index({ response }: HttpContext) {
    const files = await PdfFile.query()
      .whereNot('status', 'DELETED')
      .orderBy('createdAt', 'desc')

    return response.ok({
      success: true,
      message: 'List PDF retrieved successfully',
      data: files
    })
  }

  async generate({ request, response }: HttpContext) {
    const payload = await request.validateUsing(generatePdfValidator)
    const uniqueId = cuid()
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const fileName = `report_${dateStr}_${uniqueId}.pdf`
    const outputDir = app.makePath('uploads/pdf')
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const absolutePath = `${outputDir}/${fileName}`
    const publicPath = `/uploads/pdf/${fileName}`

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    const headerHtml = `
      <div style="font-size: 10px; width: 100%; display: flex; align-items: center; justify-content: center; padding: 0 20px; border-bottom: 1px solid #000; margin-bottom: 10px; font-family: sans-serif;">
        <div style="position: absolute; left: 20px;">
           ${payload.logo_url ? `<img src="${payload.logo_url}" style="height: 40px;" />` : ''}
        </div>
        <div style="text-align: center; width: 100%;">
          <div style="font-weight: bold; font-size: 14px; text-transform: uppercase;">${payload.institution_name}</div>
          <div style="margin-top:2px;">${payload.address}</div>
          <div style="margin-top:2px;">Telp: ${payload.phone}</div>
        </div>
      </div>`

    const footerHtml = `
      <div style="font-size: 9px; width: 100%; text-align: center; border-top: 1px solid #ccc; padding-top: 5px; font-family: sans-serif;">
        Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span> 
        | Generated at: ${new Date().toLocaleString('id-ID')}
      </div>`

    const bodyHtml = `
      <html>
        <head><style>body { font-family: sans-serif; font-size: 12px; margin: 40px; }</style></head>
        <body>
          <h2 style="text-align:center; margin-bottom: 20px;">${payload.title}</h2>
          <div style="text-align: justify; line-height: 1.5;">${payload.content}</div>
        </body>
      </html>`

    await page.setContent(bodyHtml)
    await page.pdf({
      path: absolutePath,
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: headerHtml,
      footerTemplate: footerHtml,
      margin: { top: '100px', bottom: '70px', left: '40px', right: '40px' },
      printBackground: true
    })

    await browser.close()
    const stats = fs.statSync(absolutePath)

    const newFile = await PdfFile.create({
      filename: fileName,
      filepath: publicPath,
      size: stats.size,
      status: 'CREATED'
    })

    return response.created({
      success: true,
      message: 'PDF generated successfully',
      data: newFile
    })
  }

  async upload({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(uploadPdfValidator)
      const file = payload.file
      const uniqueId = cuid()
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const fileName = `upload_${dateStr}_${uniqueId}.pdf`

      await file.move(app.makePath('uploads/pdf'), { name: fileName })

      const newFile = await PdfFile.create({
        filename: fileName,
        originalName: file.clientName,
        filepath: `/uploads/pdf/${fileName}`,
        size: file.size,
        status: 'UPLOADED'
      })

      return response.status(201).send({
        success: true,
        message: 'PDF uploaded successfully',
        data: newFile
      })
    } catch (error) {
      if (error.messages && error.messages[0]?.rule === 'file.size') {
        return response.status(413).send({
          success: false,
          message: 'File size exceeds maximum limit (10MB)',
          error_code: 'FILE_TOO_LARGE'
        })
      }
      return response.status(400).send({
        success: false,
        message: 'Validation failed',
        error_code: 'VALIDATION_ERROR'
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    const pdf = await PdfFile.find(params.id)

    if (!pdf) {
      return response.status(404).send({
        success: false,
        message: 'PDF file not found'
      })
    }

    if (pdf.status === 'DELETED') {
      return response.status(400).send({
        success: false,
        message: 'PDF file is already in DELETED status'
      })
    }

    pdf.status = 'DELETED'
    pdf.deletedAt = DateTime.now()
    await pdf.save()

    return response.ok({
      success: true,
      message: 'PDF deleted successfully',
      data: pdf
    })
  }
}