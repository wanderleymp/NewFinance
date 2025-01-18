import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockData } from '../lib/mockData';
import {
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Dashboard() {
  const { data: contracts = [] } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => mockData.getContracts(),
  });

  const { data: historicalMRR = [] } = useQuery({
    queryKey: ['historical-mrr'],
    queryFn: () => mockData.getHistoricalMRR(),
  });

  const { data: contractDistribution = [] } = useQuery({
    queryKey: ['contract-distribution'],
    queryFn: () => mockData.getContractDistribution(),
  });

  const { data: groupDistribution = [] } = useQuery({
    queryKey: ['group-distribution'],
    queryFn: () => mockData.getGroupDistribution(),
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => mockData.getRecentActivities(),
  });

  // Calculate dashboard metrics
  const activeContracts = contracts.filter((c) => c.status === 'ativo');
  const inactiveContracts = contracts.filter((c) => c.status !== 'ativo');
  const totalMRR = activeContracts.reduce((sum, contract) => sum + contract.currentValue, 0);
  const upcomingDue = contracts.filter(
    (c) => new Date(c.nextBillingDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;

  const metrics = [
    {
      title: 'Contratos Ativos',
      value: activeContracts.length,
      change: '+2.5%',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Contratos Inativos',
      value: inactiveContracts.length,
      change: '-0.5%',
      icon: Users,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Receita Mensal (MRR)',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(totalMRR),
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Próximos Vencimentos',
      value: upcomingDue,
      change: '30 dias',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // Chart configurations
  const mrrChartData = {
    labels: historicalMRR.map(item => item.month),
    datasets: [
      {
        label: 'MRR',
        data: historicalMRR.map(item => item.value),
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const mrrChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(context.raw);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact',
            }).format(value);
          },
        },
      },
    },
  };

  const contractDistributionData = {
    labels: contractDistribution.map(item => item.status),
    datasets: [
      {
        data: contractDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const groupDistributionData = {
    labels: groupDistribution.map(item => item.group),
    datasets: [
      {
        label: 'Contratos por Grupo',
        data: groupDistribution.map(item => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const groupChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">{metric.change}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Evolução do MRR</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Line data={mrrChartData} options={mrrChartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Distribuição por Status</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Pie data={contractDistributionData} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Contratos por Grupo</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <Bar data={groupDistributionData} options={groupChartOptions} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{activity.type}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(activity.date), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <AlertCircle className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}