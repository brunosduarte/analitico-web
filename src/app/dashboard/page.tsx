'use client'

import { useState, useEffect } from 'react'
import { useDashboardData } from '@/hooks/use-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DateRange,
  PeriodSelector,
} from '@/components/dashboard/period-selector'
import { LoadingState } from '@/components/common/loading-state'
import {
  EmptyState,
  EmptyTypes,
  ErrorState,
} from '@/components/common/empty-state'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { format } from 'date-fns'
import { DashboardFiltros } from '@/types/api'
import { MESES_ABREV } from '@/lib/constants'

// Componentes de Gráficos
import {
  SalaryBreakdown,
  ReturnsBreakdown,
  WeeklyDistribution,
  MonthlyJobs,
  ShiftDistribution,
  JobValue,
  TopJobs,
  CategoryDistribution,
} from '@/components/dashboard/charts'

// Importar o componente reutilizado do detalhe de extrato
import { TrabalhoChart } from '@/components/charts/trabalho-chart'

import { DashboardTomadorSection } from '@/components/dashboard/tomador/tomador-section'
import { DashboardCategorySection } from '@/components/dashboard/category/category-section'

/**
 * Dashboard Page: Página principal do dashboard
 */
export default function DashboardPage() {
  // Estado para o período selecionado
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primeiro dia do mês atual
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Último dia do mês atual
  })

  // Estado para o carregamento inicial
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Extrair mês abreviado em português
  const getMesAbreviado = (date: Date): string => {
    // Converte para um número de 0-11
    const mesNum = date.getMonth()
    // Mapeia para JAN, FEV, etc. conforme constantes da aplicação
    const mesesKeys = Object.keys(MESES_ABREV)
    return mesesKeys[mesNum] || 'JAN'
  }

  // Preparar filtros para a API com base no período selecionado
  const filtros: DashboardFiltros = {
    mes: dateRange.from ? getMesAbreviado(dateRange.from) : undefined,
    ano: dateRange.from ? dateRange.from.getFullYear().toString() : undefined,
    dataInicio: dateRange.from
      ? format(dateRange.from, 'yyyy-MM-dd')
      : undefined,
    dataFim: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
  }

  // Obter dados do dashboard com base no período selecionado
  const {
    isLoading,
    error,
    summaryData,
    salaryBreakdown,
    returnsData,
    weeklyDistribution,
    monthlyJobsData,
    tomadoresData,
    categoriasTotais,
    trabalhos,
    extratos,
    refetch,
  } = useDashboardData(filtros)

  // Efeito para marcar quando o carregamento inicial termina
  useEffect(() => {
    if (!isLoading && isInitialLoad) {
      setIsInitialLoad(false)
    }
  }, [isLoading, isInitialLoad])

  // Efeito para carregar dados no primeiro render
  useEffect(() => {
    // Tenta refetch explícito no primeiro carregamento
    if (isInitialLoad) {
      refetch()
    }
  }, [isInitialLoad, refetch])

  // Função para atualizar o período selecionado
  const handlePeriodChange = (range: DateRange) => {
    console.log('Período alterado:', range)
    setDateRange(range)
    // Force um refetch explícito quando o período mudar
    setTimeout(() => refetch(), 0)
  }

  // Se estiver carregando inicialmente, mostrar estado de carregamento
  if (isInitialLoad || isLoading) {
    return <LoadingState message="Carregando dados do dashboard..." />
  }

  // Se houver erro, mostrar estado de erro
  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar dashboard"
        description="Não foi possível carregar os dados do dashboard."
        error={error instanceof Error ? error : new Error('Erro desconhecido')}
        onRetry={() => {
          refetch()
        }}
      />
    )
  }

  // Verificação explícita para extratos vazios
  const hasData = extratos && extratos.length > 0

  // Se não houver dados, mostrar estado vazio
  if (!hasData) {
    return (
      <EmptyState
        title="Nenhum dado encontrado"
        description="Não há dados disponíveis para o período selecionado. Tente selecionar outro período ou fazer upload de novos extratos."
        icon={EmptyTypes.NO_DATA.icon}
        action={{
          label: 'Mudar Período',
          onClick: () => {
            // Definir para os últimos 6 meses
            const today = new Date()
            const sixMonthsAgo = new Date()
            sixMonthsAgo.setMonth(today.getMonth() - 6)

            const newRange = {
              from: new Date(
                sixMonthsAgo.getFullYear(),
                sixMonthsAgo.getMonth(),
                1,
              ),
              to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
            }

            handlePeriodChange(newRange)
          },
        }}
      />
    )
  }

  // Se não houver trabalhos, mostrar estado vazio específico para trabalhos
  if (!trabalhos || trabalhos.length === 0) {
    return (
      <EmptyState
        title="Sem detalhes de trabalhos"
        description="Os extratos foram encontrados, mas não possuem detalhes de trabalhos para exibir no dashboard."
        icon={EmptyTypes.NO_ITEMS.icon}
        action={{
          label: 'Mudar Período',
          onClick: () => {
            // Definir para os últimos 6 meses
            const today = new Date()
            const sixMonthsAgo = new Date()
            sixMonthsAgo.setMonth(today.getMonth() - 6)

            const newRange = {
              from: new Date(
                sixMonthsAgo.getFullYear(),
                sixMonthsAgo.getMonth(),
                1,
              ),
              to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
            }

            handlePeriodChange(newRange)
          },
        }}
      />
    )
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
          <PeriodSelector
            onChange={handlePeriodChange}
            initialRange={dateRange}
          />
        </div>
      </div>

      {/* KPIs */}
      <SummaryCards data={summaryData} />

      {/* Tabs com diferentes visões */}
      <Tabs defaultValue="geral">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
          <TabsTrigger value="tomadores">Por Tomador</TabsTrigger>
        </TabsList>

        {/* Tab de Visão Geral */}
        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalaryBreakdown data={salaryBreakdown} />
            <ReturnsBreakdown data={returnsData} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <MonthlyJobs data={monthlyJobsData} />
            <WeeklyDistribution data={weeklyDistribution} />
          </div>

          {/* Componente de gráfico de trabalhos movido do detalhe de extrato */}
          <TrabalhoChart
            trabalhos={trabalhos}
            title="Distribuição de Trabalhos"
            description="Visão consolidada de todos os trabalhos no período"
          />

          <div className="grid grid-cols-1 gap-4">
            <ShiftDistribution trabalhos={trabalhos} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <JobValue trabalhos={trabalhos} />
            <TopJobs trabalhos={trabalhos} />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <CategoryDistribution data={categoriasTotais} />
          </div>
        </TabsContent>

        {/* Tab de Categorias */}
        <TabsContent value="categorias" className="space-y-4">
          <DashboardCategorySection
            categoriasTotais={categoriasTotais}
            shiftDistribution={salaryBreakdown}
          />
        </TabsContent>

        {/* Tab de Tomadores */}
        <TabsContent value="tomadores" className="space-y-4">
          <DashboardTomadorSection
            tomadoresData={tomadoresData}
            trabalhos={trabalhos}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
