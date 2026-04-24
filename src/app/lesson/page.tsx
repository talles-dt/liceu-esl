// src/app/lesson/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Lesson {
 grammar: string
 logic: string
 communication: string
 mnemonic: string
}

export default function LessonPage() {
 const [lesson, setLesson] = useState<Lesson | null>(null)
 const [loading, setLoading] = useState(true)
 const router = useRouter()

 useEffect(() => {
 // Fetch lesson based on CEFR level (from user profile or URL param)
 async function generateLesson() {
 try {
 const response = await fetch('/api/lesson/generate', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ user_id: 'dummy-user', level: 'B1' })
 })
 const data = await response.json()
 setLesson(data)
 } catch (err) {
 console.error("Failed to generate lesson:", err)
 } finally {
 setLoading(false)
 }
 }

 generateLesson()
 }, [])

 if (loading) return <div className="text-center py-20 text-xl">Generating lesson...</div>
 if (!lesson) return <div className="text-center py-20 text-xl">Failed to load lesson.</div>

 return (
 <div className="max-w-4xl mx-auto px-4 py-8">
 <button
 onClick={() => router.push('/')}
 className="mb-4 text-sm text-gray-500 hover:text-white"
 >← Back to Dashboard</button>

 <div className="border-l-4 border-blue-500 pl-6">
 <div className="prose dark:prose-invert">
 <ReactMarkdown>{lesson.grammar}</ReactMarkdown>
 </div>
 </div>

 <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="bg-gray-800 p-6 rounded-lg">
 <h3 className="text-xl text-blue-400 font-semibold">Logic</h3>
 <div className="prose dark:prose-invert mt-4">
 <ReactMarkdown>{lesson.logic}</ReactMarkdown>
 </div>
 </div>

 <div className="bg-gray-700 p-6 rounded-lg">
 <h3 className="text-xl text-green-400 font-semibold">Communication</h3>
 <div className="prose dark:prose-invert mt-4">
 <ReactMarkdown>{lesson.communication}</ReactMarkdown>
 </div>
 </div>
 </div>

 <div className="mt-8 bg-purple-900 p-6 rounded-lg">
 <h3 className="text-xl text-purple-300 font-semibold">Memory Palace</h3>
 <p className="mt-2 text-gray-300">
 {lesson.mnemonic.split('→').join(' → ')}
 </p>
 </div>
 </div>
 )
}

interface Lesson {
 grammar: string
 logic: string
 communication: string
 mnemonic: string
}