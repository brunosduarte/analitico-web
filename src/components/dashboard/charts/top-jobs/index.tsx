'use client'

import { useMemo } from 'react'
import { BarChart } from '@/components/charts'
import { WorkTooltip } from '@/components/charts/utils/tooltips'
import { formatCurrency } from '@/lib/utils'
import { CHART_COLORS } from '@/lib/constants'

interface TopJobsProps {
  trabalhos: any[] // Trabalhos com campos adicionados
  isLoading?: boolean
  limit?: number
}

/**
 * Componente TopJobs: Exibe gráfico de barras horizontais com os trabalhos de maior valor
 */
export function TopJobs({
  trabalhos,
  isLoading = false,
  limit = 10,
}: TopJobsProps) {
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
      .slice(0, limit)
  }, [trabalhos, limit])

  // Renderizador de legenda personalizado para o eixo Y
  const yAxisTickFormatter = (value: string) => {
    if (!value) return ''

    // Extrair as partes do nome formatado
    const parts = value.split(' ')
    const pasta = parts[0] // Navio

    // Retornar em formato compacto
    return pasta
  }

  return (
    <BarChart
      data={topJobsData}
      title="Top Fainas (R$)"
      description="Trabalhos com maior valor bruto"
      isLoading={isLoading}
      emptyMessage="Não há dados suficientes para exibir o gráfico"
      tooltipContent={<WorkTooltip />}
      height={320}
      layout="vertical"
      yAxisFormatter={yAxisTickFormatter}
      xAxisFormatter={(value) => formatCurrency(value).split(',')[0]}
      colors={[CHART_COLORS[3]]}
    />
  )
}
