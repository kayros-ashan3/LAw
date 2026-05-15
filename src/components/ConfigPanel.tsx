import React from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppConfig } from '../types';

interface ConfigPanelProps {
  config: AppConfig;
  onUpdate: (config: AppConfig) => void;
}

export default function ConfigPanel({ config, onUpdate }: ConfigPanelProps) {
  const handleChange = (field: keyof AppConfig | string, value: any) => {
    if (field === 'excellent' || field === 'inProcess') {
      onUpdate({
        ...config,
        thresholds: {
          ...config.thresholds,
          [field]: Number(value)
        }
      });
    } else {
      onUpdate({
        ...config,
        [field]: value
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-12 rounded-[40px] shadow-sm border border-black/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Identity Section */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold border-b border-black/5 pb-4">Entidad Educativa</h3>
            
            <div className="space-y-4">
              <ConfigInput 
                icon={<MapPin size={18} />}
                label="Distrito Escolar"
                value={config.district}
                onChange={(v) => handleChange('district', v)}
              />
              <ConfigInput 
                icon={<Building2 size={18} />}
                label="Nombre de la Escuela"
                value={config.school}
                onChange={(v) => handleChange('school', v)}
              />
              <ConfigInput 
                icon={<Calendar size={18} />}
                label="Ciclo Escolar"
                value={config.cycle}
                onChange={(v) => handleChange('cycle', v)}
              />
            </div>
          </div>

          {/* Admin Section */}
          <div className="space-y-8">
            <h3 className="text-xl font-bold border-b border-black/5 pb-4">Autoridad Administrativa</h3>
            
            <div className="space-y-4">
              <ConfigInput 
                icon={<User size={18} />}
                label="Administrador / Maestro"
                value={config.adminName}
                onChange={(v) => handleChange('adminName', v)}
              />
              
              <div className="p-6 bg-[#00FF00]/5 rounded-2xl border border-[#00FF00]/20 mt-4">
                <div className="flex gap-4">
                  <CheckCircle2 className="text-[#00FF00] shrink-0" />
                  <p className="text-sm text-[#141414]/70 leading-relaxed">
                    Toda la documentación, incluyendo listados de cotejo y reportes para la dirección, se generará bajo la firma de la autoridad configurada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logic Engine Config */}
        <div className="mt-12 pt-12 border-t border-black/5">
          <h3 className="text-xl font-bold mb-8">Parámetros del Motor de Lógica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40">Umbral de Excelencia (Color Verde)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.1"
                  value={config.thresholds.excellent}
                  onChange={(e) => handleChange('excellent', e.target.value)}
                  className="flex-grow accent-[#00FF00]"
                />
                <span className="font-mono text-xl font-bold">{config.thresholds.excellent.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest opacity-40">Umbral de Aprobación (Color Amarillo)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.1"
                  value={config.thresholds.inProcess}
                  onChange={(e) => handleChange('inProcess', e.target.value)}
                  className="flex-grow accent-yellow-400"
                />
                <span className="font-mono text-xl font-bold">{config.thresholds.inProcess.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-8 p-4 bg-blue-50 rounded-xl text-blue-800 text-sm italic">
            <AlertCircle size={20} className="shrink-0" />
            <p>El sistema recalcula automáticamente los estados (Excelente, En Proceso, Refuerzo) de todos los alumnos al cambiar estos umbrales.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigInput({ icon, label, value, onChange }: { icon: React.ReactNode, label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest opacity-40">{label}</label>
      <div className="flex items-center gap-4 bg-[#F5F5F0] p-4 rounded-2xl border border-black/5 focus-within:border-black/20 transition-colors">
        <div className="text-black/30">{icon}</div>
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none focus:outline-none w-full font-medium"
        />
      </div>
    </div>
  );
}
