import Navbar from '../components/common/Navbar'
import DataAnalysis from '../components/shared/DataAnalysis'

export default function DataAnalysisPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">📊 Data Analysis & Risk Assessment</h1>
        <p className="text-slate-600 mb-6">Analyze district-wise health data and risk percentages</p>
        <DataAnalysis />
      </div>
    </div>
  )
}