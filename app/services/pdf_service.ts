import PdfFile from '#models/pdf_file'
import app from '@adonisjs/core/services/app'
import puppeteer from 'puppeteer'
import fs from 'node:fs'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import type { MultipartFile } from '@adonisjs/core/types/bodyparser'
import axios from 'axios'

export default class PdfService {

  private async getBase64(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' })
      const buffer = Buffer.from(response.data, 'binary').toString('base64')
      const contentType = response.headers['content-type'] || 'image/png'
      return `data:${contentType};base64,${buffer}`
    } catch (error) {
      return null
    }
  }

  async getAllActive() {
    return await PdfFile.query()
      .whereNot('status', 'DELETED')
      .orderBy('createdAt', 'desc')
  }

  async generatePdf(payload: any) {
    const uniqueId = cuid()
    const dateStr = DateTime.now().toFormat('yyyyMMdd')
    const fileName = `report_${dateStr}_${uniqueId}.pdf`
    const outputDir = app.makePath('uploads/pdf')
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const absolutePath = `${outputDir}/${fileName}`
    const publicPath = `/uploads/pdf/${fileName}`
    const logoBase64 = payload.logo_url ? await this.getBase64(payload.logo_url) : null

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    const headerHtml = `
      <div style="font-size: 10px; width: 100%; display: flex; align-items: center; justify-content: center; padding: 0 20px; border-bottom: 1px solid #000; margin-bottom: 10px; font-family: sans-serif;">
        <div style="position: absolute; left: 20px;">
           ${logoBase64 ? `<img src="${logoBase64}" style="height: 40px;" />` : ''}
        </div>
        <div style="text-align: center; width: 100%;">
          <div style="font-weight: bold; font-size: 14px; text-transform: uppercase;">${payload.institution_name}</div>
          <div style="margin-top:2px;">${payload.address}</div>
          <div style="margin-top:2px;">Telp: ${payload.phone}</div>
        </div>
      </div>`

    await page.setContent(`<html>
        <head><style>body { font-family: sans-serif; font-size: 12px; margin: 40px; }</style></head>
        <body>
          <h2 style="text-align:center; margin-bottom: 20px;">${payload.title}</h2>
          <div style="text-align: justify; line-height: 1.5;">${payload.content}</div>
        </body>
      </html>`, { waitUntil: 'networkidle0' })

    await page.pdf({
      path: absolutePath,
      format: 'A4',
      displayHeaderFooter: true,
      headerTemplate: headerHtml,
      footerTemplate: `<div style="font-size: 9px; width: 100%; text-align: center; border-top: 1px solid #ccc; padding-top: 5px; font-family: sans-serif;">Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></div>`,
      margin: { top: '100px', bottom: '70px', left: '40px', right: '40px' },
      printBackground: true
    })

    await browser.close()
    const stats = fs.statSync(absolutePath)

    return await PdfFile.create({
      filename: fileName,
      filepath: publicPath,
      size: stats.size,
      status: 'CREATED'
    })
  }

  async uploadPdf(file: MultipartFile) {
    const uniqueId = cuid()
    const dateStr = DateTime.now().toFormat('yyyyMMdd')
    const fileName = `upload_${dateStr}_${uniqueId}.pdf`

    await file.move(app.makePath('uploads/pdf'), { name: fileName })

    return await PdfFile.create({
      filename: fileName,
      originalName: file.clientName,
      filepath: `/uploads/pdf/${fileName}`,
      size: file.size,
      status: 'UPLOADED'
    })
  }

  async softDelete(id: number) {
    const pdf = await PdfFile.findOrFail(id)

    if (pdf.status === 'DELETED') {
      throw new Error('ALREADY_DELETED')
    }

    pdf.status = 'DELETED'
    pdf.deletedAt = DateTime.now()
    await pdf.save()
    
    return pdf
  }
}