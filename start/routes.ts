/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const PdfReportsController = () => import('#controllers/pdf_reports_controller')

router.group(() => {
  router.get('/list', [PdfReportsController, 'index'])
  router.post('/generate', [PdfReportsController, 'generate'])
  router.post('/upload', [PdfReportsController, 'upload'])
  router.delete('/:id', [PdfReportsController, 'destroy'])
}).prefix('api/pdf')

