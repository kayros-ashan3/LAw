import React from 'react';
import { 
  TrendingUp, 
  UserCheck, 
  AlertTriangle, 
  Scale 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { MetricSummary, Student } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  metrics: MetricSummary;
  students: Student[];
}

export default function Dashboard({ metrics, students }: DashboardProps) {
  const statusData = [
    { name: 'AZ (ALTO)', value: students.filter(s => s.code === 'AZ').length, color: '#00FF00' },
    { name: 'MW (MEDIANO)', value: students.filter(s => s.code === 'MW').length, color: '#FFD700' },
    { name: 'LOW (BAJO)', value: students.filter(s => s.code === 'LOW').length, color: '#FF4444' }
  ].filter(d => d.value > 0);

  const genderData = [
    { name: 'Masculino', value: metrics.maleAverage },
    { name: 'Femenino', value: metrics.femaleAverage }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<TrendingUp className="text-[#00FF00]" />}
          label="Promedio General"
          value={metrics.generalAverage.toString()}
          detail="Rendimiento Global"
        />
        <StatCard 
          icon={<UserCheck className="text-blue-500" />}
          label="% Excelentes"
          value={`${metrics.percentExcellent}%`}
          detail="Alumnos Destacados"
        />
        <StatCard 
          icon={<AlertTriangle className="text-red-500" />}
          label="Refuerzo Crítico"
          value={metrics.needsReinforcement.toString()}
          detail="Casos Prioritarios"
        />
        <StatCard 
          icon={<Scale className="text-purple-500" />}
          label="Equidad de Género"
          value={`${((metrics.maleAverage / (metrics.femaleAverage || 1)) * 100).toFixed(0)}%`}
          detail="Ratio Desempeño M/F"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#141414]/5">
          <h3 className="font-serif italic text-xl mb-6">Distribución de Estados</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gender Gap Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#141414]/5">
          <h3 className="font-serif italic text-xl mb-6">Comparativa por Género</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8f8f8' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={60}>
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#141414' : '#00FF00'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {metrics.needsReinforcement > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl animate-pulse">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-red-500" />
            <div>
              <h4 className="font-bold text-red-800">Alerta de Rendimiento</h4>
              <p className="text-sm text-red-600">
                Se han identificado {metrics.needsReinforcement} alumnos con rendimiento inferior a 7.0. Se sugiere intervención pedagógica inmediata.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode, label: string, value: string, detail: string }) {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#141414]/5 hover:border-[#00FF00]/30 transition-colors group">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-[#F5F5F0] rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <p className="text-xs font-bold tracking-[0.1em] uppercase opacity-40">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
      </div>
      <p className="text-[10px] uppercase tracking-wider opacity-30 mt-2 font-bold">{detail}</p>
    </div>
  );
}
