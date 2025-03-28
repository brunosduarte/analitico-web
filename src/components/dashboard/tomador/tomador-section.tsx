'use client'

import { TomadorCardData } from '@/types'
import { DataCard } from '@/components/common/data-card'
import { formatCurrency } from '@/lib/utils'
import { TomadorList } from '@/components/dashboard/tomador/tomador-card'
import { ShiftDistribution } from '@/components/dashboard/charts/shift-distribution'
import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CHART_COLORS } from '@/lib/constants'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardTomadorSectionProps {
  tomadoresData: TomadorCardData[]
  trabalhos: any[] // Utilizamos any aqui pois são trabalhos com campos adicionais
}

/**
 * Componente DashboardTomadorSection: Seção de tomadores do dashboard
 */
export function DashboardTomadorSection({
  tomadoresData,
  trabalhos,
}: DashboardTomadorSectionProps) {
  // Formatar o nome do trabalho para incluir informações detalhadas
  const formatTrabalhoName = (trabalho: any) => {
    const dia = trabalho.dia || ''
    const pagtoSplit = trabalho.pagto?.split('/') || []
    const mes = pagtoSplit[0] || ''
    const ano = pagtoSplit[1] || ''
    const pasta = trabalho.pasta || ''
    const turno = trabalho.tur || ''

    // Formato: "navio dd/mm/aa periodo"
    return `${pasta} ${dia}/${mes}/${ano} ${turno}`
  }

  // Calcular dados para o gráfico de valor por faina
  const workValueData = useMemo(() => {
    if (!trabalhos || trabalhos.length === 0) return []

    return trabalhos
      .map((trabalho) => ({
        name: formatTrabalhoName(trabalho),
        value: trabalho.baseDeCalculo,
        pasta: trabalho.pasta || '',
        dia: trabalho.dia || '',
        mes: trabalho.pagto?.split('/')[0] || '',
        ano: trabalho.pagto?.split('/')[1] || '',
        turno: trabalho.tur || '',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15)
  }, [trabalhos])

  // Calcular dados para o top de fainas
  const topJobsData = useMemo(() => {
    if (!trabalhos || trabalhos.length === 0) return []

    return trabalhos
      .map((trabalho) => ({
        name: formatTrabalhoName(trabalho),
        value: trabalho.baseDeCalculo,
        pasta: trabalho.pasta || '',
        dia: trabalho.dia || '',
        mes: trabalho.pagto?.split('/')[0] || '',
        ano: trabalho.pagto?.split('/')[1] || '',
        turno: trabalho.tur || '',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [trabalhos])

  // Tooltip personalizado para valor bruto por faina e top fainas
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md shadow-md p-3">
          <p className="font-medium">Trabalho: {label}</p>
          <p className="text-sm text-muted-foreground">
            Valor: {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  // Renderizador de legenda personalizado para o eixo Y
  const yAxisTickFormatter = (value: string) => {
    if (!value) return ''

    // Extrair as partes do nome formatado
    const parts = value.split(' ')
    const pasta = parts[0] // Navio
    const dataPeriodo = parts.slice(1).join(' ') // dd/mm/aa periodo

    // Retornar em formato compacto
    return `${pasta} ${dataPeriodo}`
  }

  if (tomadoresData.length === 0 || trabalhos.length === 0) {
    return (
      <>
        <DataCard
          title="Rendimentos por Operador"
          description="Resumo de valores por operador portuário"
          isLoading={true}
        >
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-full h-24" />
            ))}
          </div>
        </DataCard>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <ShiftDistribution trabalhos={[]} isLoading={true} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <DataCard
            title="Valor Bruto por Faina (R$)"
            description="Valor bruto de cada trabalho realizado"
            isLoading={true}
          >
            <div className="h-80">
              <Skeleton className="w-full h-full" />
            </div>
          </DataCard>

          <DataCard
            title="Top Fainas (R$)"
            description="Trabalhos com maior valor bruto"
            isLoading={true}
          >
            <div className="h-80">
              <Skeleton className="w-full h-full" />
            </div>
          </DataCard>
        </div>
      </>
    )
  }

  return (
    <>
      <DataCard
        title="Rendimentos por Operador"
        description="Resumo de valores por operador portuário"
      >
        <TomadorList tomadores={tomadoresData} limit={5} />
      </DataCard>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <ShiftDistribution trabalhos={trabalhos} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Valor Bruto por Faina (Gross Value per Work) - Bar chart */}
        <DataCard
          title="Valor Bruto por Faina (R$)"
          description="Valor bruto de cada trabalho realizado"
        >
          <div className="h-80">
            {workValueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workValueData}
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name="Valor Bruto"
                    fill={CHART_COLORS[2]}
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
          </div>
        </DataCard>

        {/* Top Fainas (Top Jobs) - Bar chart */}
        <DataCard
          title="Top Fainas (R$)"
          description="Trabalhos com maior valor bruto"
        >
          <div className="h-80">
            {topJobsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topJobsData}
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
                    tickFormatter={yAxisTickFormatter}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Valor" fill={CHART_COLORS[3]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Não há dados suficientes para exibir o gráfico
                </p>
              </div>
            )}
          </div>
        </DataCard>
      </div>
    </>
  )
}
