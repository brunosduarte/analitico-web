'use client'

import { useState } from 'react'
import { useDashboardData } from '@/hooks/use-dashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  subDays,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

// Card displays for summary data
function SummaryCard({ title, value, label }) {
  return (
    <div className="bg-background border rounded-md p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export default function DashboardPage() {
  // State for date range selection
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  // Parse dates to get month and year for data fetching
  const mesSelecionado = format(dateRange.from, 'MMM', {
    locale: ptBR,
  }).toUpperCase()
  const anoSelecionado = format(dateRange.from, 'yyyy')

  // Selected period display string
  const selectedPeriodText = `${format(dateRange.from, 'dd/MM/yy')} - ${format(dateRange.to, 'dd/MM/yy')}`
  const daysDifference =
    Math.round(
      (dateRange.to.getTime() - dateRange.from.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1

  // Fetch dashboard data based on selected period
  const { isLoading, extratos, categoriasTotais, trabalhos } = useDashboardData(
    mesSelecionado,
    anoSelecionado,
  )

  // Create period preset handlers
  const selectThisMonth = () => {
    const now = new Date()
    setDateRange({
      from: startOfMonth(now),
      to: endOfMonth(now),
    })
  }

  const selectThisWeek = () => {
    const now = new Date()
    setDateRange({
      from: startOfWeek(now, { weekStartsOn: 0 }),
      to: endOfWeek(now, { weekStartsOn: 0 }),
    })
  }

  const selectLastWeek = () => {
    const now = subWeeks(new Date(), 1)
    setDateRange({
      from: startOfWeek(now, { weekStartsOn: 0 }),
      to: endOfWeek(now, { weekStartsOn: 0 }),
    })
  }

  const selectLastMonth = () => {
    const now = subMonths(new Date(), 1)
    setDateRange({
      from: startOfMonth(now),
      to: endOfMonth(now),
    })
  }

  const selectLast30Days = () => {
    const now = new Date()
    setDateRange({
      from: subDays(now, 29),
      to: now,
    })
  }

  const selectLast3Months = () => {
    const now = new Date()
    setDateRange({
      from: startOfMonth(subMonths(now, 2)),
      to: endOfMonth(now),
    })
  }

  const selectLast6Months = () => {
    const now = new Date()
    setDateRange({
      from: startOfMonth(subMonths(now, 5)),
      to: endOfMonth(now),
    })
  }

  const selectLast12Months = () => {
    const now = new Date()
    setDateRange({
      from: startOfMonth(subMonths(now, 11)),
      to: endOfMonth(now),
    })
  }

  // Prepare data for charts

  // 1. Salário Bruto (Pie chart)
  const prepareSalaryBreakdownData = () => {
    if (!extratos || extratos.length === 0) return []

    // Calculate totals from all extracts
    let totalLiquido = 0
    let totalIRPF = 0
    let totalINSS = 0
    let totalDAS = 0
    let totalSindical = 0
    let totalJudicial = 0
    let totalOutros = 0

    extratos.forEach((extrato) => {
      // Get trabalhos from each extrato
      const trabalhos = extrato.trabalhos || []

      trabalhos.forEach((trabalho) => {
        totalLiquido += trabalho.liquido || 0
        totalIRPF += trabalho.impostoDeRenda || 0
        totalINSS += trabalho.inss || 0
        totalDAS += trabalho.das || 0
        totalSindical += trabalho.impostoSindical || 0
        totalJudicial += trabalho.descontoJudicial || 0

        // Outros = EPI/Crachá + Mensalidade
        totalOutros +=
          (trabalho.descontosEpiCracha || 0) + (trabalho.mensal || 0)
      })
    })

    // Create pie chart data
    return [
      { name: 'Líquido', value: totalLiquido },
      { name: 'IRPF', value: totalIRPF },
      { name: 'INSS', value: totalINSS },
      { name: 'DAS', value: totalDAS },
      { name: 'Sindical', value: totalSindical },
      { name: 'Judicial', value: totalJudicial },
      { name: 'Outros', value: totalOutros },
    ].filter((item) => item.value > 0)
  }

  // 2. Valor Bruto por Faina (Bar chart)
  const prepareWorkValueData = () => {
    if (!trabalhos || trabalhos.length === 0) return []

    // Sort by value descending
    return trabalhos
      .map((trabalho) => ({
        name: `${trabalho.pasta} ${trabalho.dia}/${trabalho.pagto.split('/')[0]}`,
        value: trabalho.baseDeCalculo,
      }))
      .sort((a, b) => b.value - a.value)
  }

  // 3. Rendimentos por Operador (Cards)
  const prepareOperatorData = () => {
    if (!trabalhos || trabalhos.length === 0) return []

    // Group by 'tomador'
    const operatorData = trabalhos.reduce((acc, trabalho) => {
      const tomador = trabalho.tomador
      if (!acc[tomador]) {
        acc[tomador] = {
          tomador,
          fainas: 0,
          totalValor: 0,
          maiorBruto: 0,
          porcentagemTotal: 0,
        }
      }

      acc[tomador].fainas += 1
      acc[tomador].totalValor += trabalho.baseDeCalculo
      acc[tomador].maiorBruto = Math.max(
        acc[tomador].maiorBruto,
        trabalho.baseDeCalculo,
      )

      return acc
    }, {})

    // Calculate total value for percentage
    const totalValue = Object.values(operatorData).reduce(
      (sum, op: any) => sum + op.totalValor,
      0,
    )

    // Calculate percentages and averages
    return Object.values(operatorData)
      .map((op: any) => ({
        ...op,
        porcentagemTotal: ((op.totalValor / totalValue) * 100).toFixed(2),
        mediaValor: op.fainas > 0 ? op.totalValor / op.fainas : 0,
      }))
      .sort((a: any, b: any) => b.totalValor - a.totalValor)
  }

  // 4. Trabalhos por Semana (Bar chart by week with month color coding)
  const prepareWeeklyJobsData = () => {
    if (!trabalhos || trabalhos.length === 0) return []

    // Group by week
    const weeklyData = trabalhos.reduce((acc, trabalho) => {
      const dateParts = trabalho.pagto.split('/')
      const month = parseInt(dateParts[1])
      const year = parseInt(anoSelecionado)

      // Create date object to get week
      const date = new Date(year, month - 1, parseInt(trabalho.dia))
      const weekStart = startOfWeek(date, { weekStartsOn: 0 })
      const weekKey = format(weekStart, 'MM/dd')
      const monthKey = format(date, 'MM/yy')

      if (!acc[weekKey]) {
        acc[weekKey] = {}
      }

      if (!acc[weekKey][monthKey]) {
        acc[weekKey][monthKey] = 0
      }

      acc[weekKey][monthKey] += 1

      return acc
    }, {})

    // Convert to array format for chart
    return Object.entries(weeklyData)
      .map(([week, months]) => {
        return {
          week: `Semana ${week}`,
          ...months,
        }
      })
      .sort((a, b) => {
        const weekA = a.week.split(' ')[1]
        const weekB = b.week.split(' ')[1]
        return weekA.localeCompare(weekB)
      })
  }

  // 5. Turnos Trabalhados (Pie chart)
  const prepareShiftsData = () => {
    if (!trabalhos || trabalhos.length === 0) return []

    // Count by 'tur' (shift)
    const shiftCounts = trabalhos.reduce((acc, trabalho) => {
      const shift = trabalho.tur
      acc[shift] = (acc[shift] || 0) + 1
      return acc
    }, {})

    // Convert to array format for chart
    return Object.entries(shiftCounts)
      .map(([shift, count]) => ({
        name: `Turno ${shift}`,
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
  }

  // 6. Top Fainas (Bar chart)
  const prepareTopJobsData = () => {
    if (!trabalhos || trabalhos.length === 0) return []

    // Sort by value and get top 10
    return trabalhos
      .map((trabalho) => ({
        name: `${trabalho.pasta} ${trabalho.dia}/${trabalho.pagto.split('/')[0]}-${trabalho.tur}`,
        value: trabalho.baseDeCalculo,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }

  // 7. Trabalhos por Mês (Horizontal bar chart)
  const prepareMonthlyJobsData = () => {
    if (!trabalhos || trabalhos.length === 0) return []

    // Count by month
    const monthCounts = trabalhos.reduce((acc, trabalho) => {
      const dateParts = trabalho.pagto.split('/')
      const month = parseInt(dateParts[1])
      const year = parseInt(anoSelecionado)

      const monthKey = format(new Date(year, month - 1, 1), 'MM/yy')

      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {})

    // Convert to array format for chart
    return Object.entries(monthCounts)
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // 8. Retornos Totais (Donut chart)
  const prepareReturnsData = () => {
    if (!trabalhos || trabalhos.length === 0) return []

    // Calculate totals
    let totalFerias = 0
    let totalDecimo = 0
    let totalFGTS = 0

    trabalhos.forEach((trabalho) => {
      totalFerias += trabalho.ferias || 0
      totalDecimo += trabalho.decimoTerceiro || 0
      totalFGTS += trabalho.fgts || 0
    })

    // Return data for donut chart
    return [
      { name: 'Férias', value: totalFerias },
      { name: '13º', value: totalDecimo },
      { name: 'FGTS', value: totalFGTS },
    ]
  }

  // 9. Summary data
  const prepareSummaryData = () => {
    if (!trabalhos || trabalhos.length === 0) {
      return {
        totalFainas: 0,
        mediaFainasSemana: 0,
        diasTrabalhados: 0,
        mediaBrutoFaina: 0,
        mediaLiquidoFaina: 0,
      }
    }

    const totalFainas = trabalhos.length

    // Count unique days worked
    const diasTrabalhados = new Set(
      trabalhos.map(
        (t) => `${t.dia}/${t.pagto.split('/')[0]}/${t.pagto.split('/')[1]}`,
      ),
    ).size

    // Calculate number of weeks in period for average
    const weeks = Math.ceil(daysDifference / 7)

    // Calculate averages
    const mediaBrutoFaina =
      trabalhos.reduce((sum, t) => sum + t.baseDeCalculo, 0) / totalFainas
    const mediaLiquidoFaina =
      trabalhos.reduce((sum, t) => sum + t.liquido, 0) / totalFainas

    return {
      totalFainas,
      mediaFainasSemana: totalFainas / weeks,
      diasTrabalhados,
      mediaBrutoFaina,
      mediaLiquidoFaina,
    }
  }

  // Prepare data for all charts
  const salaryBreakdownData = prepareSalaryBreakdownData()
  const workValueData = prepareWorkValueData()
  const operatorData = prepareOperatorData()
  const weeklyJobsData = prepareWeeklyJobsData()
  const shiftsData = prepareShiftsData()
  const topJobsData = prepareTopJobsData()
  const monthlyJobsData = prepareMonthlyJobsData()
  const returnsData = prepareReturnsData()
  const summaryData = prepareSummaryData()

  // Colors for charts
  const COLORS = [
    '#2563eb',
    '#10b981',
    '#8b5cf6',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
    '#6366f1',
  ]

  // Custom tooltip for pie charts
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            {`(${((payload[0].value / payload[0].payload.total) * 100).toFixed(0)}%)`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visualização analítica dos dados de extratos portuários
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal md:w-[300px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedPeriodText}
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                  {daysDifference} dias
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 border-b">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={selectThisMonth}>
                    Esse mês
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectThisWeek}>
                    Essa semana
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectLastWeek}>
                    Semana passada
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectLastMonth}>
                    Mês passado
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectLast30Days}
                  >
                    Últimos 30 dias
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectLast3Months}
                  >
                    Últimos 3 meses
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectLast6Months}
                  >
                    Últimos 6 meses
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectLast12Months}
                  >
                    Últimos 12 meses
                  </Button>
                </div>
              </div>
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange(range)
                  }
                }}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard
          title="Faina(s) realizada(s)"
          value={summaryData.totalFainas}
          label="Total no período"
        />
        <SummaryCard
          title="Média Faina(s)/Semana"
          value={summaryData.mediaFainasSemana.toFixed(1)}
          label="No período selecionado"
        />
        <SummaryCard
          title="Dom/Fer Trabalhado(s)"
          value={summaryData.diasTrabalhados}
          label="Dias efetivamente trabalhados"
        />
        <SummaryCard
          title="Média Bruto/Faina"
          value={formatCurrency(summaryData.mediaBrutoFaina)}
          label="Valor médio bruto por trabalho"
        />
        <SummaryCard
          title="Média Líquido/Faina"
          value={formatCurrency(summaryData.mediaLiquidoFaina)}
          label="Valor médio líquido por trabalho"
        />
      </div>

      <Tabs defaultValue="geral">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
          <TabsTrigger value="tomadores">Por Tomador</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Salário Bruto (Gross Salary) - Pie chart */}
            <Card>
              <CardHeader>
                <CardTitle>Salário Bruto (R$)</CardTitle>
                <CardDescription>
                  Distribuição das deduções e valor líquido
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : salaryBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salaryBreakdownData.map((item) => ({
                          ...item,
                          total: salaryBreakdownData.reduce(
                            (sum, i) => sum + i.value,
                            0,
                          ),
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {salaryBreakdownData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Não há dados suficientes para exibir o gráfico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Retornos Totais (Total Returns) - Donut chart */}
            <Card>
              <CardHeader>
                <CardTitle>Retornos Totais (R$)</CardTitle>
                <CardDescription>
                  Distribuição entre Férias, 13º e FGTS
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : returnsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={returnsData.map((item) => ({
                          ...item,
                          total: returnsData.reduce(
                            (sum, i) => sum + i.value,
                            0,
                          ),
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {returnsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Não há dados suficientes para exibir o gráfico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Trabalhos por Mês (Jobs by Month) - Horizontal bar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Trabalhos por Mês</CardTitle>
                <CardDescription>
                  Quantidade de trabalhos realizados por mês
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : monthlyJobsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyJobsData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="month"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={50}
                      />
                      <Tooltip
                        formatter={(value) => [value, 'Trabalhos']}
                        labelFormatter={(label) => `Mês: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Trabalhos" fill={COLORS[0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Não há dados suficientes para exibir o gráfico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trabalhos por Semana (Jobs per Week) - Bar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Trabalhos por Semana</CardTitle>
                <CardDescription>
                  Quantidade de trabalhos por semana, coloridos por mês
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : weeklyJobsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyJobsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {/* Dynamically create bars for each month in the data */}
                      {Object.keys(weeklyJobsData[0] || {})
                        .filter((key) => key !== 'week')
                        .map((month, index) => (
                          <Bar
                            key={month}
                            dataKey={month}
                            name={`Mês ${month}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Não há dados suficientes para exibir o gráfico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Valores por Categoria</CardTitle>
              <CardDescription>Valores totais por categoria</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : categoriasTotais.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoriasTotais}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="categoria" />
                    <YAxis
                      tickFormatter={(value) =>
                        formatCurrency(value).split(',')[0]
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Categoria: ${label}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="valorTotal"
                      name="Valor Total"
                      fill={COLORS[0]}
                    />
                    <Bar dataKey="count" name="Quantidade" fill={COLORS[1]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Não há dados suficientes para exibir o gráfico
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Turnos Trabalhados (Worked Shifts) - Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle>Turnos Trabalhados</CardTitle>
              <CardDescription>
                Distribuição de trabalhos por turno
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : shiftsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shiftsData.map((item) => ({
                        ...item,
                        total: shiftsData.reduce((sum, i) => sum + i.value, 0),
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {shiftsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Não há dados suficientes para exibir o gráfico
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tomadores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimentos por Operador</CardTitle>
              <CardDescription>
                Resumo de valores por operador portuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-20" />
                  ))}
                </div>
              ) : operatorData.length > 0 ? (
                <div className="space-y-4">
                  {operatorData.map((operator: any) => (
                    <Card key={operator.tomador} className="bg-muted/10">
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold">
                            {operator.tomador}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Fainas
                            </p>
                            <p className="text-lg font-medium">
                              {operator.fainas}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Média
                            </p>
                            <p className="text-lg font-medium">
                              {formatCurrency(operator.mediaValor)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Maior Bruto
                            </p>
                            <p className="text-lg font-medium">
                              {formatCurrency(operator.maiorBruto)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              % do Total
                            </p>
                            <p className="text-lg font-medium">
                              {operator.porcentagemTotal}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-36">
                  <p className="text-muted-foreground">
                    Não há dados suficientes para exibir operadores
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Valor Bruto por Faina (Gross Value per Work) - Bar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Valor Bruto por Faina (R$)</CardTitle>
                <CardDescription>
                  Valor bruto de cada trabalho realizado
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : workValueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={workValueData.slice(0, 15)} // Limit to 15 items
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          formatCurrency(value).split(',')[0]
                        }
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Trabalho: ${label}`}
                      />
                      <Bar
                        dataKey="value"
                        name="Valor Bruto"
                        fill={COLORS[2]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Não há dados suficientes para exibir o gráfico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Fainas (Top Jobs) - Bar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Fainas (R$)</CardTitle>
                <CardDescription>
                  Trabalhos com maior valor bruto
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : topJobsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topJobsData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(value) =>
                          formatCurrency(value).split(',')[0]
                        }
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 10 }}
                        width={120}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Trabalho: ${label}`}
                      />
                      <Bar dataKey="value" name="Valor" fill={COLORS[3]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      Não há dados suficientes para exibir o gráfico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
