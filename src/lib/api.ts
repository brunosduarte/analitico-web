import axios from 'axios'
import { Extrato, ExtratoResumo, ResumoMensal, TomadorAnalise } from '@/types'

// Criando uma instância do axios com configurações base
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interface para filtros de busca
export interface ExtratoFiltros {
  matricula?: string
  nome?: string
  mes?: string
  ano?: string
  categoria?: string
  tomador?: string
  dataInicio?: string
  dataFim?: string
}

// Funções de API para interação com o backend

// Buscar lista de extratos com filtros opcionais
export const getExtratos = async (
  filtros?: ExtratoFiltros,
): Promise<ExtratoResumo[]> => {
  try {
    const params = { ...filtros }
    const response = await api.get('/analitico', { params })
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar extratos:', error)
    throw error
  }
}

// Buscar um extrato específico por ID
export const getExtratoById = async (id: string): Promise<Extrato> => {
  try {
    const response = await api.get(`/analitico/${id}`)
    return response.data.data
  } catch (error) {
    console.error(`Erro ao buscar extrato ID ${id}:`, error)
    throw error
  }
}

// Buscar trabalhos por tomador
export const getTrabalhosPorTomador = async (
  tomador: string,
): Promise<any[]> => {
  try {
    const response = await api.get(`/trabalhos/tomador/${tomador}`)
    return response.data.data
  } catch (error) {
    console.error(`Erro ao buscar trabalhos do tomador ${tomador}:`, error)
    throw error
  }
}

// Buscar resumo mensal
export const getResumoMensal = async (
  mes: string,
  ano: string,
): Promise<ResumoMensal> => {
  try {
    const response = await api.get(`/resumo/${mes}/${ano}`)
    return response.data.data
  } catch (error) {
    console.error(`Erro ao buscar resumo mensal ${mes}/${ano}:`, error)
    throw error
  }
}

// Upload de extrato PDF
export const uploadExtratoPDF = async (formData: FormData): Promise<any> => {
  try {
    const response = await api.post('/analitico', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Erro ao fazer upload do extrato:', error)
    throw error
  }
}

// Obter análise de tomadores (esta é uma função de frontend que processa os dados)
export const getAnaliseTomadores = async (
  extratos: ExtratoResumo[],
): Promise<TomadorAnalise[]> => {
  try {
    const response = await api.get('/analise/tomadores', {
      params: {
        extratoIds: extratos.map((e) => e.id).join(','),
      },
    })
    return response.data.data
  } catch (error) {
    console.error('Erro ao obter análise de tomadores:', error)

    // Fallback para processamento no frontend se a API falhar
    const tomadores: Record<string, TomadorAnalise> = {}

    // Processar extratos para obter totais básicos por tomador
    for (const extrato of extratos) {
      try {
        const detalhes = await getExtratoById(extrato.id)

        detalhes.trabalhos.forEach((trabalho) => {
          const { tomador, baseDeCalculo } = trabalho

          if (!tomadores[tomador]) {
            tomadores[tomador] = {
              tomador,
              tomadorNome: trabalho.tomadorNome || tomador,
              totalTrabalhos: 0,
              valorTotal: 0,
            }
          }

          tomadores[tomador].totalTrabalhos += 1
          tomadores[tomador].valorTotal += baseDeCalculo
        })
      } catch (err) {
        console.error(
          `Erro ao processar detalhes do extrato ${extrato.id}:`,
          err,
        )
      }
    }

    // Retornar como array ordenado
    return Object.values(tomadores).sort((a, b) => b.valorTotal - a.valorTotal)
  }
}

// Função para obter os dados de salário bruto (distribuição)
export const getSalaryBreakdown = async (
  mes?: string,
  ano?: string,
  dataInicio?: string,
  dataFim?: string,
): Promise<any> => {
  try {
    const response = await api.get('/analise/salario-breakdown', {
      params: { mes, ano, dataInicio, dataFim },
    })
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar dados de distribuição salarial:', error)
    throw error
  }
}

// Função para obter distribuição de turnos
export const getShiftDistribution = async (
  mes?: string,
  ano?: string,
  dataInicio?: string,
  dataFim?: string,
): Promise<any> => {
  try {
    const response = await api.get('/analise/turnos', {
      params: { mes, ano, dataInicio, dataFim },
    })
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar distribuição de turnos:', error)
    throw error
  }
}

// Função para obter distribuição semanal de trabalhos
export const getWeeklyWorkDistribution = async (
  mes?: string,
  ano?: string,
  dataInicio?: string,
  dataFim?: string,
): Promise<any> => {
  try {
    const response = await api.get('/analise/trabalhos-semanais', {
      params: { mes, ano, dataInicio, dataFim },
    })
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar distribuição semanal de trabalhos:', error)
    throw error
  }
}

// Função para obter top trabalhos (fainas)
export const getTopJobs = async (
  mes?: string,
  ano?: string,
  dataInicio?: string,
  dataFim?: string,
  limit: number = 10,
): Promise<any> => {
  try {
    const response = await api.get('/analise/top-trabalhos', {
      params: { mes, ano, dataInicio, dataFim, limit },
    })
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar top trabalhos:', error)
    throw error
  }
}

// Função para obter dados de retornos (férias, 13º, FGTS)
export const getReturnsData = async (
  mes?: string,
  ano?: string,
  dataInicio?: string,
  dataFim?: string,
): Promise<any> => {
  try {
    const response = await api.get('/analise/retornos', {
      params: { mes, ano, dataInicio, dataFim },
    })
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar dados de retornos:', error)
    throw error
  }
}

// Função para obter resumo completo do dashboard
export const getDashboardSummary = async (
  mes?: string,
  ano?: string,
  dataInicio?: string,
  dataFim?: string,
): Promise<any> => {
  try {
    const response = await api.get('/analise/dashboard-resumo', {
      params: { mes, ano, dataInicio, dataFim },
    })
    return response.data.data
  } catch (error) {
    console.error('Erro ao buscar resumo do dashboard:', error)
    throw error
  }
}

export default api
