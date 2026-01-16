'use client'

import React, { useState } from 'react'
import { BasicTableDemo } from '@/examples/BasicTableDemo'
import { RTLComplexTableDemo } from '@/examples/RTLComplexTableDemo'
import { InteractiveTableDemo } from '@/examples/InteractiveTableDemo'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'complex' | 'interactive'>('basic')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DataTable Component</h1>
          <p className="text-gray-500 mt-2">
            A powerful, flexible, and accessible data table component built with React.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-hidden">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('basic')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              1. Basic Table
            </button>
            <button
              onClick={() => setActiveTab('complex')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'complex'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              2. Advanced & RTL
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === 'interactive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              3. Interactive & Selection
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'basic' && <BasicTableDemo />}
          {activeTab === 'complex' && <RTLComplexTableDemo />}
          {activeTab === 'interactive' && <InteractiveTableDemo />}
        </div>

      </div>
    </div>
  )
}
