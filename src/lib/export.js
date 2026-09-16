import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { LEAD_STATUS_LABELS } from './constants'

function toRow(lead) {
  return {
    Nome: lead.name,
    Categoria: lead.category,
    Telefone: lead.phone ?? '',
    Endereço: lead.address,
    Cidade: lead.city,
    Avaliação: lead.rating ?? '',
    Instagram: lead.instagram ?? '',
    Site: lead.website ?? '',
    Status: LEAD_STATUS_LABELS[lead.status],
    Observações: lead.notes,
  }
}

export function exportLeadsToCsv(leads, filename = 'leads-sitefinder-pro.csv') {
  const rows = leads.map(toRow)
  const csv = Papa.unparse(rows)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

export function exportLeadsToExcel(leads, filename = 'leads-sitefinder-pro.xlsx') {
  const rows = leads.map(toRow)
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads')
  XLSX.writeFile(workbook, filename)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
