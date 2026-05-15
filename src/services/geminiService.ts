import { GoogleGenAI } from "@google/genai";
import { Student, AppConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getPedagogicalSuggestions(student: Student, config: AppConfig) {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Analiza el rendimiento del estudiante ${student.name} en el Distrito ${config.district}, Escuela ${config.school}.
  Resultados:
  - Promedio: ${student.average}
  - Estado: ${student.status}
  - Detalle: ${JSON.stringify(student.performance)}
  
  Basado en la Propuesta Pedagógica, si el rendimiento es bajo en alguna área (Lanzamiento, Carreras, etc.), sugiere una variante de juego tipo Montessori específica para mejorar esa competencia. Proporciona una respuesta concisa y profesional.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudieron generar sugerencias en este momento.";
  }
}

export async function cleanRawData(rawText: string): Promise<Partial<Student>[]> {
  const model = ai.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });
  
  const prompt = `Limpia y organiza el siguiente texto desordenado que contiene datos de alumnos y sus calificaciones en áreas físicas (Carreras, Túneles, Salto, Joquey, Lanzamiento).
  Texto: "${rawText}"
  Devuelve UNICAMENTE un array JSON de objetos con las propiedades: name, gender ('M' o 'F'), y performance (objeto con carreras, tuneles, salto, joquey, lanzamiento como números de 1 a 10).
  Si faltan datos, usa 5 como valor predeterminado.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text() || "[]");
  } catch (error) {
    console.error("Cleaning Error:", error);
    return [];
  }
}
