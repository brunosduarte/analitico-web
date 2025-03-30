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
import { MESES_ABREV, MESES_ORDEM } from '@/lib/constants'

// Componentes de Gráficos
import {
  SalaryBreakdown,
  ReturnsBreakdown,
  WeeklyDistribution,
  MonthlyJobs,
  ShiftDistribution,
  JobValue,
  TopJobs,
} from '@/components/dashboard/charts'

// Componente para aba de funções (novo)
import { FunctionDistribution } from '@/components/dashboard/function/function-distribution'

// Importar o componente reutilizado do detalhe de extrato
import { TrabalhoChart } from '@/components/charts/trabalho-chart'

import { DashboardTomadorSection } from '@/components/dashboard/tomador/tomador-section'

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

  // Hook para obter dados do dashboard com base no período selecionado
  const {
    isLoading,
    error,
    summaryData,
    salaryBreakdown,
    returnsData,
    weeklyDistribution,
    monthlyJobsData,
    tomadoresData,
    trabalhos,
    functionDistribution,
    extratos,
    refetch,
    allExtratos, // Todos os extratos disponíveis sem filtro de período
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

  // Efeito para verificar se há dados no período atual e ajustar conforme necessário
  useEffect(() => {
    // Se não houver dados no período selecionado, mas existirem extratos em outros períodos
    if (
      !isLoading &&
      !isInitialLoad &&
      extratos.length === 0 &&
      allExtratos?.length > 0
    ) {
      console.log(
        'Sem dados no período atual, mas existem extratos em outros períodos',
      )

      // Encontrar o extrato mais recente para definir o período
      const latestExtrato = [...allExtratos].sort((a, b) => {
        // Primeiro ordenar por ano (decrescente)
        if (a.ano !== b.ano) return parseInt(b.ano) - parseInt(a.ano)

        // Depois ordenar por mês (decrescente) usando a ordem dos meses no array MESES_ORDEM
        const indexA = MESES_ORDEM.indexOf(a.mes)
        const indexB = MESES_ORDEM.indexOf(b.mes)
        return indexB - indexA
      })[0]

      if (latestExtrato) {
        console.log(
          'Definindo novo período com base no extrato mais recente:',
          latestExtrato.mes,
          latestExtrato.ano,
        )

        // Obter primeiro e último dia do mês do extrato mais recente
        const mesNumerico = MESES_ORDEM.indexOf(latestExtrato.mes)
        const anoNumerico = parseInt(latestExtrato.ano)

        // Criar datas para o início e fim do mês
        const from = new Date(anoNumerico, mesNumerico, 1)
        const to = new Date(anoNumerico, mesNumerico + 1, 0) // O dia 0 do próximo mês é o último dia do mês atual

        // Atualizar o período selecionado
        const newRange = { from, to }
        handlePeriodChange(newRange)
      }
    }
  }, [isLoading, isInitialLoad, extratos, allExtratos])

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
  const hasAnyData = allExtratos && allExtratos.length > 0

  // Se não houver dados, mostrar estado vazio
  if (!hasData) {
    if (hasAnyData) {
      // Se existem dados em outros períodos, mostrar mensagem específica
      return (
        <EmptyState
          title="Nenhum dado encontrado no período selecionado"
          description="Não há dados disponíveis para o período atual. Estamos ajustando para mostrar os extratos existentes."
          icon={EmptyTypes.NO_DATA.icon}
          action={{
            label: 'Carregar Todos os Dados',
            onClick: () => {
              // Buscar todos os dados sem filtro de período
              const range = {
                from: new Date(2000, 0, 1), // 1 de Janeiro de 2000
                to: new Date(), // Hoje
              }
              handlePeriodChange(range)
            },
          }}
        />
      )
    } else {
      // Se não existem dados em nenhum período
      return (
        <EmptyState
          title="Nenhum dado encontrado"
          description="Não há extratos disponíveis. Por favor, faça o upload de novos extratos."
          icon={EmptyTypes.NO_DATA.icon}
          action={{
            label: 'Ir para Upload',
            onClick: () => {
              window.location.href = '/upload'
            },
          }}
        />
      )
    }
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
          <TabsTrigger value="funcoes">Por Função</TabsTrigger>
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
        </TabsContent>

        {/* Tab de Funções (Nova) */}
        <TabsContent value="funcoes" className="space-y-4">
          <FunctionDistribution
            functionData={functionDistribution}
            trabalhos={trabalhos}
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
