import vine from '@vinejs/vine'

export const generatePdfValidator = vine.compile(
  vine.object({
    title: vine.string().trim(),
    institution_name: vine.string().trim(),
    address: vine.string().trim(),
    phone: vine.string().trim(),
    logo_url: vine.string().url().optional(), 
    content: vine.string(),
  })
)

export const uploadPdfValidator = vine.compile(
  vine.object({
    file: vine.file({
      size: '10mb',
      extnames: ['pdf'],  
    }),
  })
)