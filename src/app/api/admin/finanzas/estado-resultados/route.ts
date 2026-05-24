import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAgencyTimezone } from '@/lib/timezone.server'
import { toLocalDateKey, formatDate, DEFAULT_TIMEZONE } from '@/lib/timezone'
import ExcelJS from 'exceljs'

// ── Colores corporativos ──────────────────────────────────────────────────────
const COLOR = {
  teal:       '1FA8B8',
  tealLight:  'E8F8FA',
  tealDark:   '167585',
  red:        'EF4444',
  redLight:   'FEF2F2',
  green:      '10B981',
  greenLight: 'ECFDF5',
  dark:       '0A0A0A',
  gray:       'A1A1AA',
  border:     'E4E4E7',
  white:      'FFFFFF',
  black:      '000000',
}

// ── Helpers de fecha ──────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0') }

function resolveRango(
  periodo: string,
  desde: string,
  hasta: string,
  tz: string,
): { desde: string; hasta: string; label: string } {
  const todayKey = toLocalDateKey(new Date(), tz)
  const [y, m] = todayKey.split('-').map(Number)

  if (desde || hasta) {
    return {
      desde,
      hasta,
      label: desde && hasta ? `${desde} al ${hasta}` : desde ? `Desde ${desde}` : `Hasta ${hasta}`,
    }
  }

  switch (periodo) {
    case 'hoy':
      return { desde: todayKey, hasta: todayKey, label: `Hoy (${todayKey})` }
    case 'ayer': {
      const ayer = toLocalDateKey(new Date(new Date().setDate(new Date().getDate() - 1)), tz)
      return { desde: ayer, hasta: ayer, label: `Ayer (${ayer})` }
    }
    case 'semana': {
      const d = new Date()
      d.setDate(d.getDate() - d.getDay())
      const start = toLocalDateKey(d, tz)
      return { desde: start, hasta: todayKey, label: `Esta semana (${start} al ${todayKey})` }
    }
    case 'mes':
      return {
        desde: `${y}-${pad(m)}-01`,
        hasta: todayKey,
        label: new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric', timeZone: tz }).format(new Date()),
      }
    default:
      return { desde: '', hasta: '', label: 'Todos los períodos' }
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const supabase = await createClient()

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, nombre')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }

  const { searchParams } = req.nextUrl
  const periodo = searchParams.get('periodo') ?? 'mes'
  const desdeParam = searchParams.get('desde') ?? ''
  const hastaParam = searchParams.get('hasta') ?? ''
  const tz = searchParams.get('tz') ?? DEFAULT_TIMEZONE

  const { desde, hasta, label: periodoLabel } = resolveRango(periodo, desdeParam, hastaParam, tz)

  type RowWithCat = { titulo: string; monto: number; fecha: string; categoria: { nombre: string } | null }

  // Fetch ingresos y gastos
  let ingresosQuery = supabase
    .from('ingresos')
    .select('titulo, monto, fecha, categoria:ingreso_categorias(nombre)')
    .order('fecha', { ascending: true })

  let gastosQuery = supabase
    .from('gastos')
    .select('titulo, monto, fecha, categoria:gasto_categorias(nombre)')
    .order('fecha', { ascending: true })

  if (desde) { ingresosQuery = ingresosQuery.gte('fecha', desde); gastosQuery = gastosQuery.gte('fecha', desde) }
  if (hasta) { ingresosQuery = ingresosQuery.lte('fecha', hasta); gastosQuery = gastosQuery.lte('fecha', hasta) }

  const [{ data: rawIngresos }, { data: rawGastos }] = await Promise.all([
    ingresosQuery,
    gastosQuery,
  ])

  const ingresos = (rawIngresos ?? []) as unknown as RowWithCat[]
  const gastos   = (rawGastos ?? []) as unknown as RowWithCat[]

  // Agrupar por categoría
  const ingBycat: Record<string, number> = {}
  for (const ing of ingresos) {
    const cat = ing.categoria?.nombre ?? 'Sin categoría'
    ingBycat[cat] = (ingBycat[cat] ?? 0) + ing.monto
  }

  const gasBycat: Record<string, number> = {}
  for (const g of gastos) {
    const cat = g.categoria?.nombre ?? 'Sin categoría'
    gasBycat[cat] = (gasBycat[cat] ?? 0) + g.monto
  }

  const totalIngresos = Object.values(ingBycat).reduce((s, v) => s + v, 0)
  const totalGastos   = Object.values(gasBycat).reduce((s, v) => s + v, 0)
  const resultado     = totalIngresos - totalGastos
  const esUtilidad    = resultado >= 0

  const generadoEn = formatDate(new Date(), tz, {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  // ── Construir workbook ────────────────────────────────────────────────────
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Axendora CRM'
  wb.created = new Date()

  const ws = wb.addWorksheet('Estado de Resultados', {
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
  })

  // Anchos de columna
  ws.columns = [
    { width: 4  },   // A: margen izq
    { width: 40 },   // B: concepto
    { width: 20 },   // C: monto
    { width: 4  },   // D: margen der
  ]

  function usd(n: number) {
    return `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
  }

  // Helper: celda con estilo
  function cell(row: ExcelJS.Row, col: number | string, value: ExcelJS.CellValue, style: Partial<ExcelJS.Style> = {}) {
    const c = row.getCell(col)
    c.value = value
    if (style.font)      c.font      = style.font
    if (style.fill)      c.fill      = style.fill
    if (style.alignment) c.alignment = style.alignment
    if (style.border)    c.border    = style.border
    if (style.numFmt)    c.numFmt    = style.numFmt
    return c
  }

  function emptyRow() { ws.addRow([]) }

  const solidFill = (argb: string): ExcelJS.Fill => ({
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: `FF${argb}` },
  })

  const thinBorder = (argb = COLOR.border): Partial<ExcelJS.Borders> => ({
    top:    { style: 'thin', color: { argb: `FF${argb}` } },
    bottom: { style: 'thin', color: { argb: `FF${argb}` } },
    left:   { style: 'thin', color: { argb: `FF${argb}` } },
    right:  { style: 'thin', color: { argb: `FF${argb}` } },
  })

  // ── CABECERA ─────────────────────────────────────────────────────────────
  // Fila 1 — Nombre agencia
  const r1 = ws.addRow([])
  r1.height = 36
  ws.mergeCells(`B${r1.number}:C${r1.number}`)
  cell(r1, 'B', 'AXENDORA', {
    font:      { name: 'Calibri', size: 22, bold: true, color: { argb: `FF${COLOR.teal}` } },
    alignment: { vertical: 'middle', horizontal: 'left' },
  })

  // Fila 2 — Título
  const r2 = ws.addRow([])
  r2.height = 22
  ws.mergeCells(`B${r2.number}:C${r2.number}`)
  cell(r2, 'B', 'ESTADO DE RESULTADOS', {
    font:      { name: 'Calibri', size: 14, bold: true, color: { argb: `FF${COLOR.dark}` } },
    alignment: { vertical: 'middle', horizontal: 'left' },
  })

  // Fila 3 — Período
  const r3 = ws.addRow([])
  r3.height = 18
  ws.mergeCells(`B${r3.number}:C${r3.number}`)
  cell(r3, 'B', `Período: ${periodoLabel}`, {
    font:      { name: 'Calibri', size: 11, italic: true, color: { argb: `FF${COLOR.gray}` } },
    alignment: { vertical: 'middle', horizontal: 'left' },
  })

  // Fila 4 — Generado en
  const r4 = ws.addRow([])
  r4.height = 16
  ws.mergeCells(`B${r4.number}:C${r4.number}`)
  cell(r4, 'B', `Generado: ${generadoEn}`, {
    font:      { name: 'Calibri', size: 9, color: { argb: `FF${COLOR.gray}` } },
    alignment: { vertical: 'middle', horizontal: 'left' },
  })

  emptyRow()

  // ── SECCIÓN INGRESOS ─────────────────────────────────────────────────────
  // Header sección
  const rIngHead = ws.addRow([])
  rIngHead.height = 22
  ws.mergeCells(`B${rIngHead.number}:C${rIngHead.number}`)
  cell(rIngHead, 'B', '▲  INGRESOS', {
    font:      { name: 'Calibri', size: 11, bold: true, color: { argb: `FF${COLOR.white}` } },
    fill:      solidFill(COLOR.teal),
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
  })

  if (Object.keys(ingBycat).length === 0) {
    const r = ws.addRow([])
    r.height = 18
    ws.mergeCells(`B${r.number}:C${r.number}`)
    cell(r, 'B', 'Sin ingresos en este período', {
      font:      { name: 'Calibri', size: 10, italic: true, color: { argb: `FF${COLOR.gray}` } },
      alignment: { vertical: 'middle', horizontal: 'left', indent: 2 },
      fill:      solidFill(COLOR.tealLight),
    })
  } else {
    for (const [cat, monto] of Object.entries(ingBycat)) {
      const r = ws.addRow([])
      r.height = 18
      cell(r, 'B', cat, {
        font:      { name: 'Calibri', size: 10, color: { argb: `FF${COLOR.dark}` } },
        fill:      solidFill(COLOR.tealLight),
        alignment: { vertical: 'middle', horizontal: 'left', indent: 2 },
        border:    { bottom: { style: 'hair', color: { argb: `FF${COLOR.border}` } } },
      })
      cell(r, 'C', usd(monto), {
        font:      { name: 'Calibri', size: 10, color: { argb: `FF${COLOR.dark}` } },
        fill:      solidFill(COLOR.tealLight),
        alignment: { vertical: 'middle', horizontal: 'right' },
        border:    { bottom: { style: 'hair', color: { argb: `FF${COLOR.border}` } } },
      })
    }
  }

  // Total ingresos
  const rIngTot = ws.addRow([])
  rIngTot.height = 22
  cell(rIngTot, 'B', 'TOTAL INGRESOS', {
    font:      { name: 'Calibri', size: 11, bold: true, color: { argb: `FF${COLOR.tealDark}` } },
    fill:      solidFill(COLOR.tealLight),
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
    border:    { top: { style: 'medium', color: { argb: `FF${COLOR.teal}` } } },
  })
  cell(rIngTot, 'C', usd(totalIngresos), {
    font:      { name: 'Calibri', size: 11, bold: true, color: { argb: `FF${COLOR.tealDark}` } },
    fill:      solidFill(COLOR.tealLight),
    alignment: { vertical: 'middle', horizontal: 'right' },
    border:    { top: { style: 'medium', color: { argb: `FF${COLOR.teal}` } } },
  })

  emptyRow()

  // ── SECCIÓN GASTOS ───────────────────────────────────────────────────────
  const rGasHead = ws.addRow([])
  rGasHead.height = 22
  ws.mergeCells(`B${rGasHead.number}:C${rGasHead.number}`)
  cell(rGasHead, 'B', '▼  GASTOS', {
    font:      { name: 'Calibri', size: 11, bold: true, color: { argb: `FF${COLOR.white}` } },
    fill:      solidFill(COLOR.red),
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
  })

  if (Object.keys(gasBycat).length === 0) {
    const r = ws.addRow([])
    r.height = 18
    ws.mergeCells(`B${r.number}:C${r.number}`)
    cell(r, 'B', 'Sin gastos en este período', {
      font:      { name: 'Calibri', size: 10, italic: true, color: { argb: `FF${COLOR.gray}` } },
      alignment: { vertical: 'middle', horizontal: 'left', indent: 2 },
      fill:      solidFill(COLOR.redLight),
    })
  } else {
    for (const [cat, monto] of Object.entries(gasBycat)) {
      const r = ws.addRow([])
      r.height = 18
      cell(r, 'B', cat, {
        font:      { name: 'Calibri', size: 10, color: { argb: `FF${COLOR.dark}` } },
        fill:      solidFill(COLOR.redLight),
        alignment: { vertical: 'middle', horizontal: 'left', indent: 2 },
        border:    { bottom: { style: 'hair', color: { argb: `FF${COLOR.border}` } } },
      })
      cell(r, 'C', usd(monto), {
        font:      { name: 'Calibri', size: 10, color: { argb: `FF${COLOR.dark}` } },
        fill:      solidFill(COLOR.redLight),
        alignment: { vertical: 'middle', horizontal: 'right' },
        border:    { bottom: { style: 'hair', color: { argb: `FF${COLOR.border}` } } },
      })
    }
  }

  // Total gastos
  const rGasTot = ws.addRow([])
  rGasTot.height = 22
  cell(rGasTot, 'B', 'TOTAL GASTOS', {
    font:      { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFEF4444' } },
    fill:      solidFill(COLOR.redLight),
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
    border:    { top: { style: 'medium', color: { argb: 'FFEF4444' } } },
  })
  cell(rGasTot, 'C', usd(totalGastos), {
    font:      { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFEF4444' } },
    fill:      solidFill(COLOR.redLight),
    alignment: { vertical: 'middle', horizontal: 'right' },
    border:    { top: { style: 'medium', color: { argb: 'FFEF4444' } } },
  })

  emptyRow()

  // ── RESULTADO NETO ───────────────────────────────────────────────────────
  const resultColor = esUtilidad ? COLOR.green : COLOR.red
  const resultBg    = esUtilidad ? COLOR.greenLight : COLOR.redLight
  const resultLabel = esUtilidad ? '✓  UTILIDAD DEL PERÍODO' : '✗  PÉRDIDA DEL PERÍODO'

  // Línea separadora doble
  const rSep = ws.addRow([])
  rSep.height = 4
  ;(['B', 'C'] as const).forEach((col) => {
    rSep.getCell(col).border = {
      top:    { style: 'double', color: { argb: `FF${COLOR.border}` } },
      bottom: { style: 'double', color: { argb: `FF${COLOR.border}` } },
    }
  })

  const rRes = ws.addRow([])
  rRes.height = 28
  cell(rRes, 'B', resultLabel, {
    font:      { name: 'Calibri', size: 13, bold: true, color: { argb: `FF${resultColor}` } },
    fill:      solidFill(resultBg),
    alignment: { vertical: 'middle', horizontal: 'left', indent: 1 },
    border:    thinBorder(resultColor),
  })
  cell(rRes, 'C', usd(Math.abs(resultado)), {
    font:      { name: 'Calibri', size: 13, bold: true, color: { argb: `FF${resultColor}` } },
    fill:      solidFill(resultBg),
    alignment: { vertical: 'middle', horizontal: 'right' },
    border:    thinBorder(resultColor),
  })

  emptyRow()
  emptyRow()

  // ── PIE ──────────────────────────────────────────────────────────────────
  const rFoot = ws.addRow([])
  ws.mergeCells(`B${rFoot.number}:C${rFoot.number}`)
  cell(rFoot, 'B', 'Generado por Axendora CRM  •  axendora.com', {
    font:      { name: 'Calibri', size: 8, italic: true, color: { argb: `FF${COLOR.gray}` } },
    alignment: { horizontal: 'right' },
  })

  // ── Generar buffer y devolver ─────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()
  const fileName = `estado-resultados-${periodoLabel.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.xlsx`

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
