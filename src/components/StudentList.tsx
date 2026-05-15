import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  Clipboard, 
  Download,
  AlertCircle,
  Search,
  Loader2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, AppConfig } from '../types';
import { cn, calculateAverage, determineStatus, getStatusCode } from '../lib/utils';
import { cleanRawData, getPedagogicalSuggestions } from '../services/geminiService';

interface StudentListProps {
  students: Student[];
  onUpdate: (student: Student) => void;
  onDelete: (id: string) => void;
  onAddBulk: (students: Student[]) => void;
  config: AppConfig;
}

export default function StudentList({ students, onUpdate, onDelete, onAddBulk, config }: StudentListProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const incompleteCount = useMemo(() => {
    return students.filter(s => {
      const vals = Object.values(s.performance);
      return vals.some(v => v === 0 || v === undefined) || !s.name.trim();
    }).length;
  }, [students]);

  const handleBulkImport = async () => {
    if (!importText.trim()) return;
    setIsLoading(true);
    try {
      const cleaned = await cleanRawData(importText);
      const newStudents: Student[] = cleaned.map(s => {
        const perf = s.performance || { carreras: 5, tuneles: 5, salto: 5, joquey: 5, lanzamiento: 5 };
        const avg = calculateAverage(perf as any);
        const status = determineStatus(avg, config.thresholds);
        return {
          id: crypto.randomUUID(),
          name: s.name || 'Alumno Sin Nombre',
          gender: s.gender || 'M',
          performance: perf as any,
          average: avg,
          status: status,
          code: getStatusCode(status),
        };
      });
      onAddBulk([...students, ...newStudents]);
      setImportText('');
      setIsImporting(false);
    } catch (error) {
      console.error(error);
      alert('Error procesando datos inteligentes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowSuggestions = async (student: Student) => {
    setSelectedStudent(student);
    setSuggestion('Analizando rendimiento pedagógico...');
    const result = await getPedagogicalSuggestions(student, config);
    setSuggestion(result || 'No hay sugerencias disponibles.');
  };

  const handleScoreChange = (sid: string, field: string, val: string) => {
    const student = students.find(s => s.id === sid);
    if (!student) return;
    
    const numVal = Math.min(10, Math.max(0, Number(val) || 0));
    const newPerf = { ...student.performance, [field]: numVal };
    const newAvg = calculateAverage(newPerf);
    const newStatus = determineStatus(newAvg, config.thresholds);
    
    onUpdate({
      ...student,
      performance: newPerf as any,
      average: newAvg,
      status: newStatus,
      code: getStatusCode(newStatus)
    });
  };

  const exportToExcel = () => {
    const csv = [
      ['Nombre', 'Genero', 'Clasificacion', 'Carreras', 'Tuneles', 'Salto', 'Joquey', 'Lanzamiento', 'Promedio', 'Estado'],
      ...students.map(s => [
        s.name, s.gender, s.code, s.performance.carreras, s.performance.tuneles, s.performance.salto, 
        s.performance.joquey, s.performance.lanzamiento, s.average, s.status
      ])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NIA_Reporte_${config.district}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Search and Incomplete Warning */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o ID de alumno..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-black/5 focus:ring-2 ring-[#00FF00]/50 outline-none shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-black/5 text-[10px] font-bold">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> AZ: ALTO</span>
            <span className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full bg-yellow-400" /> MW: MEDIANO</span>
            <span className="flex items-center gap-1 ml-2"><div className="w-2 h-2 rounded-full bg-red-500" /> LOW: BAJO</span>
          </div>
          
          {incompleteCount > 0 && (
            <div className="flex items-center gap-3 px-6 py-3 bg-orange-50 text-orange-700 rounded-2xl border border-orange-100 animate-pulse">
              <AlertCircle size={20} />
              <span className="text-sm font-bold">{incompleteCount} Incompletos</span>
            </div>
          )}
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-[#141414] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="text-[#00FF00]" />
            <h3 className="text-xl font-bold">Importación Inteligente de Datos</h3>
          </div>
          <p className="opacity-60 mb-6 text-sm max-w-xl">
            Pega el listado de alumnos o texto desordenado. Nuestra IA procesará y clasificará automáticamente.
          </p>
          
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            disabled={isLoading}
            placeholder="Ej: Juan Perez M 8 7 9 10 8..."
            className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 text-sm focus:outline-none focus:border-[#00FF00]/50 h-32 mb-4"
          />
          
          <button
            onClick={handleBulkImport}
            disabled={isLoading || !importText}
            className="flex items-center gap-2 bg-[#00FF00] text-[#141414] px-8 py-3 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {isLoading ? 'Procesando con Gemini...' : 'Procesar y Agregar'}
          </button>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex justify-end gap-4 overflow-x-auto pb-4">
        <button 
          onClick={() => {
            const template = "Nombre,Genero(M/F),Carreras,Tuneles,Salto,Joquey,Lanzamiento\nAlumno Ejemplo,M,10,10,10,10,10";
            const blob = new Blob([template], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "Plantilla_NIA_Excel.csv";
            link.click();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <Clipboard size={16} /> Descargar Plantilla Excel
        </button>
        <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-bold uppercase tracking-widest border border-black/5 hover:bg-black/5 transition-colors">
          <Download size={16} /> Exportar Reporte
        </button>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-black/5 bg-gray-50">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">ALUMNO</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold text-center">CLASIF.</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">M/F</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Carreras</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Túneles</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Salto</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Joquey</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">Lanzamiento</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">PROM</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">ESTADO</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest opacity-40 font-bold"></th>
              </tr>
            </thead>
            <motion.tbody layout>
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student) => (
                  <motion.tr 
                    key={student.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "border-b border-black/5 hover:bg-black/[0.02] transition-colors group",
                      student.code === 'AZ' && "bg-green-50/30",
                      student.code === 'LOW' && "bg-red-50/30"
                    )}
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={student.name}
                        onChange={(e) => onUpdate({ ...student, name: e.target.value })}
                        className="bg-transparent focus:outline-none focus:border-b border-[#00FF00] font-medium w-full"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs ring-2 ring-inset",
                          student.code === 'AZ' ? "bg-green-500 text-white ring-green-600" :
                          student.code === 'MW' ? "bg-yellow-400 text-black ring-yellow-500" :
                          "bg-red-500 text-white ring-red-600"
                        )}>
                          {student.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-xs">{student.gender}</td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={student.performance.carreras}
                        onChange={(e) => handleScoreChange(student.id, 'carreras', e.target.value)}
                        className="w-12 bg-white rounded p-1 text-center font-mono text-sm shadow-inner border border-black/5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={student.performance.tuneles}
                        onChange={(e) => handleScoreChange(student.id, 'tuneles', e.target.value)}
                        className="w-12 bg-white rounded p-1 text-center font-mono text-sm shadow-inner border border-black/5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={student.performance.salto}
                        onChange={(e) => handleScoreChange(student.id, 'salto', e.target.value)}
                        className="w-12 bg-white rounded p-1 text-center font-mono text-sm shadow-inner border border-black/5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={student.performance.joquey}
                        onChange={(e) => handleScoreChange(student.id, 'joquey', e.target.value)}
                        className="w-12 bg-white rounded p-1 text-center font-mono text-sm shadow-inner border border-black/5"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={student.performance.lanzamiento}
                        onChange={(e) => handleScoreChange(student.id, 'lanzamiento', e.target.value)}
                        className="w-12 bg-white rounded p-1 text-center font-mono text-sm shadow-inner border border-black/5"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold font-mono text-[#141414]">
                      <motion.span
                        key={student.average}
                        initial={{ scale: 1.2, color: '#00FF00' }}
                        animate={{ scale: 1, color: '#141414' }}
                      >
                        {student.average}
                      </motion.span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          student.status === 'Excelente' ? "bg-green-100 text-green-700" :
                          student.status === 'En Proceso' ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {student.status}
                        </span>
                        <span className="text-[9px] opacity-40 mt-1 font-bold">
                          {student.code === 'AZ' ? 'Alto' : student.code === 'MW' ? 'Mediano' : 'Bajo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleShowSuggestions(student)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sugerencia AI"
                        >
                          {isLoading && selectedStudent?.id === student.id ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        </button>
                        <button 
                          onClick={() => onDelete(student.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </div>

      {/* Suggestion Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight size={24} className="rotate-90 md:rotate-0" />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-sm opacity-50 uppercase tracking-widest font-bold">Análisis Pedagógico AI</p>
                </div>
              </div>
              
              <div className="bg-[#F5F5F0] p-6 rounded-2xl border border-black/5 italic font-serif leading-relaxed text-[#141414]/80">
                {suggestion}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-8 py-3 bg-[#141414] text-[#00FF00] rounded-full font-bold"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
