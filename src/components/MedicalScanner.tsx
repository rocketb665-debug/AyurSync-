import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  FileText, 
  X, 
  Search, 
  Activity, 
  ShieldAlert 
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../contexts/lib/utils';

interface MedicalScannerProps {
  medicalReportImage: string | null;
  setMedicalReportImage: (img: string | null) => void;
  medicalReportResult: any;
  setMedicalReportResult: (res: any) => void;
  setExploreView: (view: any) => void;
  reportInputRef: React.RefObject<HTMLInputElement>;
  handleMedicalReportUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleMedicalReportScan: () => void;
  isScanningReport: boolean;
  scanProgressText: string;
}

export const MedicalScanner = React.memo(({
  medicalReportImage,
  setMedicalReportImage,
  medicalReportResult,
  setMedicalReportResult,
  setExploreView,
  reportInputRef,
  handleMedicalReportUpload,
  handleMedicalReportScan,
  isScanningReport,
  scanProgressText
}: MedicalScannerProps) => {
  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => {
            setExploreView('launcher');
            setMedicalReportImage(null);
            setMedicalReportResult(null);
          }}
          className="p-3 bg-gray-50 text-gray-400 hover:text-sage-primary rounded-2xl transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Scan Health Report</h2>
          <p className="text-sage-600 font-serif italic text-lg mt-2">"Namaste! I am Kavya, your AI Health Strategist. Upload any medical report (Blood tests, Scans, etc.), and I will summarize your internal vitality for you."</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8 max-w-3xl mx-auto w-full">
        {!medicalReportImage ? (
          <div 
            onClick={() => reportInputRef.current?.click()}
            className="border-2 border-dashed border-sage-primary/20 rounded-[32px] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-sage-light/5 transition-colors"
          >
            <div className="w-20 h-20 bg-sage-light/20 rounded-full flex items-center justify-center mb-6 text-sage-primary">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              Upload Report
              <span className="text-[10px] uppercase tracking-wider bg-sage-primary/10 text-sage-primary px-2 py-1 rounded-full font-bold">Powered by Kavya AI</span>
            </h3>
            <p className="text-gray-500 max-w-sm">Tap to upload a photo or PDF of your health report (blood test, scan, etc.)</p>
            <input 
              type="file" 
              ref={reportInputRef} 
              className="hidden" 
              accept="image/*,application/pdf" 
              onChange={handleMedicalReportUpload} 
            />
          </div>
        ) : (
          <div className="space-y-8">
            {!isScanningReport ? (
              <div className="relative rounded-[32px] overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center min-h-[200px]">
                {medicalReportImage.startsWith('data:application/pdf') ? (
                  <div className="flex flex-col items-center gap-4 py-12">
                    <FileText className="w-16 h-16 text-sage-primary" />
                    <p className="text-gray-600 font-medium">PDF Document Ready for Analysis</p>
                  </div>
                ) : (
                  <img src={medicalReportImage} alt="Health Report" className="w-full max-h-[400px] object-contain" />
                )}
                <button 
                  onClick={() => {
                    setMedicalReportImage(null);
                    setMedicalReportResult(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative w-full h-[300px] rounded-[32px] overflow-hidden bg-gray-900 shadow-inner">
                  {medicalReportImage.startsWith('data:application/pdf') ? (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40 blur-sm bg-white">
                      <FileText className="w-32 h-32 text-gray-400" />
                    </div>
                  ) : (
                    <img src={medicalReportImage} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" alt="Scanning" />
                  )}
                  
                  <motion.div
                    animate={{ top: ["0%", "95%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-sage-primary shadow-[0_0_20px_rgba(var(--sage-primary-rgb),1)] z-10"
                  >
                    <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-xl text-sage-primary border-2 border-sage-primary/20">
                      <Search className="w-6 h-6" />
                    </div>
                  </motion.div>
                </div>
                <p className="text-sage-primary font-medium animate-pulse text-lg">{scanProgressText}</p>
              </div>
            )}

            {!medicalReportResult && !isScanningReport && (
              <button 
                onClick={handleMedicalReportScan}
                className="w-full py-4 bg-sage-primary text-white rounded-2xl font-bold text-lg hover:bg-sage-accent transition-all shadow-lg shadow-sage-primary/20 flex items-center justify-center gap-3"
              >
                <Search className="w-5 h-5" />
                Analyze Report
              </button>
            )}

            {medicalReportResult && (
              <div className="bg-sage-light/10 border border-sage-primary/20 rounded-[32px] p-8 space-y-8">
                <h3 className="text-2xl font-serif font-bold text-sage-primary flex items-center gap-3">
                  <Activity className="w-6 h-6" />
                  Vitality Brief
                </h3>
                
                {typeof medicalReportResult === 'string' ? (
                  <div className="prose prose-sage max-w-none">
                    <Markdown>{medicalReportResult}</Markdown>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {medicalReportResult.vitalityBrief}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-gray-900">Extracted Metrics</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 text-gray-500 text-sm">
                              <th className="pb-3 font-medium">Test Name</th>
                              <th className="pb-3 font-medium">Value</th>
                              <th className="pb-3 font-medium">Reference Range</th>
                              <th className="pb-3 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {medicalReportResult.extractedData.map((item: any, idx: number) => (
                              <tr key={item.testName || idx} className="border-b border-gray-100 last:border-0">
                                <td className="py-4 font-medium text-gray-900">{item.testName}</td>
                                <td className="py-4 text-gray-600">{item.value}</td>
                                <td className="py-4 text-gray-500">{item.referenceRange}</td>
                                <td className="py-4">
                                  <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-medium",
                                    item.status === 'Normal' ? "bg-green-100 text-green-700" :
                                    item.status === 'Low' ? "bg-blue-100 text-blue-700" :
                                    "bg-red-100 text-red-700"
                                  )}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl text-sm text-gray-500">
                      <ShieldAlert className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <p><strong>Privacy Note:</strong> This is an AI summary for wellness, not a final medical diagnosis. Please consult your healthcare provider for medical advice.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
