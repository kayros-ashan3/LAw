/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  Trophy, 
  AlertCircle,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AppConfig, MetricSummary } from './types';
import { cn, calculateAverage, determineStatus, getStatusCode } from './lib/utils';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ConfigPanel from './components/ConfigPanel';

const INITIAL_CONFIG: AppConfig = {
  district: '1201-3',
  school: 'Escuela Oficial Urbana Mixta',
  cycle: '2026',
  adminName: 'Maestro Eliú Rigoberto Terraza Arreaga',
  thresholds: {
    excellent: 9.0,
    inProcess: 7.0
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'config'>('dashboard');
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('nia_config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('nia_students');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('nia_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('nia_students', JSON.stringify(students));
  }, [students]);

  const metrics = useMemo((): MetricSummary => {
    if (students.length === 0) return {
      generalAverage: 0,
      percentExcellent: 0,
      needsReinforcement: 0,
      maleAverage: 0,
      femaleAverage: 0
    };

    const averages = students.map(s => s.average);
    const genAvg = averages.reduce((a, b) => a + b, 0) / students.length;
    const excellentCount = students.filter(s => s.status === 'Excelente').length;
    const reinforcementCount = students.filter(s => s.status === 'Necesita Refuerzo').length;

    const males = students.filter(s => s.gender === 'M');
    const females = students.filter(s => s.gender === 'F');

    const maleAvg = males.length > 0 ? males.reduce((a, b) => a + b.average, 0) / males.length : 0;
    const femaleAvg = females.length > 0 ? females.reduce((a, b) => a + b.average, 0) / females.length : 0;

    return {
      generalAverage: Number(genAvg.toFixed(2)),
      percentExcellent: Number(((excellentCount / students.length) * 100).toFixed(1)),
      needsReinforcement: reinforcementCount,
      maleAverage: Number(maleAvg.toFixed(2)),
      femaleAverage: Number(femaleAvg.toFixed(2))
    };
  }, [students]);

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleAddStudent = (studentData: Partial<Student>) => {
    const perf = studentData.performance || { carreras: 5, tuneles: 5, salto: 5, joquey: 5, lanzamiento: 5 };
    const avg = calculateAverage(perf as any);
    const status = determineStatus(avg, config.thresholds);
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: studentData.name || 'Nuevo Alumno',
      gender: studentData.gender || 'M',
      performance: perf as any,
      average: avg,
      status: status,
      code: getStatusCode(status),
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans">
      {/* Sidebar Overlay */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden"
        >
          <Menu size={24} />
        </button>
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
          className="bg-[#141414] text-[#E4E3E0] overflow-hidden flex-shrink-0 z-40 transition-all"
        >
          <div className="p-8 h-full flex flex-col w-[280px]">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <Trophy className="text-[#00FF00]" size={32} />
                <h1 className="text-xl font-bold tracking-tight">NIA CORE</h1>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                <X size={24} />
              </button>
            </div>

            <nav className="space-y-2 flex-grow">
              <NavItem 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                icon={<LayoutDashboard size={20} />}
                label="Tablero de Control"
              />
              <NavItem 
                active={activeTab === 'students'} 
                onClick={() => setActiveTab('students')}
                icon={<Users size={20} />}
                label="Listado de Alumnos"
              />
              <NavItem 
                active={activeTab === 'config'} 
                onClick={() => setActiveTab('config')}
                icon={<Settings size={20} />}
                label="Configuración"
              />
            </nav>

            <div className="mt-auto pt-8 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-widest opacity-50 mb-2">AUTORIDAD TÉCNICA</p>
              <p className="font-serif italic text-sm">{config.adminName}</p>
              <p className="text-[10px] opacity-40 mt-1">Distrito {config.district}</p>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-grow overflow-y-auto bg-white/50 backdrop-blur-sm p-4 lg:p-12">
          <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1">
                {config.school} • Ciclo {config.cycle}
              </p>
              <h2 className="text-4xl font-medium tracking-tight">
                {activeTab === 'dashboard' && 'Tablero de Control'}
                {activeTab === 'students' && 'Gestión de Alumnos'}
                {activeTab === 'config' && 'Parámetros del Sistema'}
              </h2>
            </div>
            
            {activeTab === 'students' && (
              <button 
                onClick={() => handleAddStudent({})}
                className="flex items-center gap-2 bg-[#00FF00] text-[#141414] px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-xl shadow-green-500/20"
              >
                <Plus size={20} />
                Nuevo Alumno
              </button>
            )}
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard metrics={metrics} students={students} />
              )}
              {activeTab === 'students' && (
                <StudentList 
                  students={students} 
                  onUpdate={handleUpdateStudent}
                  onDelete={handleDeleteStudent}
                  onAddBulk={setStudents}
                  config={config}
                />
              )}
              {activeTab === 'config' && (
                <ConfigPanel config={config} onUpdate={setConfig} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
        active ? "bg-[#00FF00] text-[#141414]" : "hover:bg-white/5 opacity-70 hover:opacity-100"
      )}
    >
      <div className={cn(active ? "text-[#141414]" : "text-[#00FF00] group-hover:scale-110 transition-transform")}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}

