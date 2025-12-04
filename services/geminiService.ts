import { GoogleGenAI, Type } from "@google/genai";
import { Item, Transaction, AIAnalysisResult } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  // Ensure we don't try to create client with undefined key
  if (!apiKey || apiKey.includes('YOUR_API_KEY')) return null;
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  analyzeInventory: async (items: Item[], transactions: Transaction[]): Promise<AIAnalysisResult | null> => {
    const ai = getAiClient();
    
    if (!ai) {
      console.warn("API Key is missing or invalid for Gemini Service");
      // Return a structured error response instead of null so the UI can display a specific message
      return {
        summary: "API Key Google Gemini belum dikonfigurasi. Mohon tambahkan API_KEY di environment variables untuk menggunakan fitur AI Insight.",
        recommendations: ["Konfigurasi API Key", "Hubungi Administrator"],
        anomalies: [],
        lastAnalysisDate: new Date().toISOString()
      };
    }

    // Filter recent transactions (last 30 days) to keep context small
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = transactions.filter(t => new Date(t.date) > thirtyDaysAgo);

    // Prepare data summary for the prompt
    const inventorySummary = items.map(i => ({
      name: i.name,
      stock: i.currentStock,
      min: i.minStock,
      category: i.category
    }));

    const prompt = `
      Anda adalah asisten manajer gudang yang cerdas. Analisis data inventaris berikut ini (Barang Habis Pakai) dan berikan wawasan.
      
      Data Inventaris: ${JSON.stringify(inventorySummary)}
      Data Transaksi Terakhir (30 hari): ${JSON.stringify(recentTransactions.slice(0, 50))} (sampel)

      Tugas Anda:
      1. Identifikasi barang yang stoknya kritis (di bawah minStock).
      2. Berikan rekomendasi pengadaan (apa yang harus dibeli segera).
      3. Analisis anomali jika ada (misalnya penggunaan berlebihan pada barang tertentu berdasarkan transaksi OUT, atau stok diam).
      
      Berikan respon dalam format JSON sesuai schema.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { 
                type: Type.STRING, 
                description: "Ringkasan eksekutif singkat tentang kesehatan stok saat ini (Bahasa Indonesia)" 
              },
              recommendations: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Rekomendasi pengadaan" 
              },
              anomalies: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Analisis anomali" 
              }
            },
            propertyOrdering: ["summary", "recommendations", "anomalies"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      
      // With responseSchema, the text should be valid JSON.
      const parsed = JSON.parse(text);
      return {
        ...parsed,
        lastAnalysisDate: new Date().toISOString()
      } as AIAnalysisResult;
    } catch (error) {
      console.error("Gemini Analysis Failed", error);
      return {
        summary: "Gagal melakukan analisis AI saat ini. Silakan coba beberapa saat lagi.",
        recommendations: [],
        anomalies: [],
        lastAnalysisDate: new Date().toISOString()
      };
    }
  }
};