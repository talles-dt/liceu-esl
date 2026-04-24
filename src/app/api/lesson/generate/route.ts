"use server"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { type NextRequest } from 'next/server'

// Define Lesson type
interface Lesson {
 grammar: string
 logic: string
 communication: string
 mnemonic: string
}

// Helper: Build prompt for NVIDIA NIM
function buildPrompt(pillar: string, level: string, interest: string): string {
 return `
You are Lexio, an AI tutor specializing in ${pillar} for Brazilians learning English (CEFR ${level}).
Use the memory palace anchor: **${interest}**.

Output **JSON-only** with these fields:
{
 "grammar": "PT-BR interference + rule",
 "logic": "Reasoning behind usage",
 "communication": "Real-world scenario + examples",
 "mnemonic": "CONCEPT→LOCATION→HOOK→TRIGGER"
}

Example:
{
 "grammar": "*The* vs. *zero article*. PT error: 'Eu gosto de *o* café'. Correct: 'I like coffee'.",
 "logic": "English uses zero article for uncountables/general plurals.",
 "communication": "Ask for 'advice' (uncountable), not 'an advice'.",
 "mnemonic": "COFFEE SHOP→COUNTER→COIN JAR→CAIXINHA DE MOEDAS"
}
`.trim()
}

// Helper: Call NVIDIA API
async function generateLesson(prompt: string): Promise<Lesson> {
 const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 model: 'qwen/qwen3-14b-instruct',
 messages: [{ role: 'user', content: prompt }],
 temperature: 0.3,
 max_tokens: 1024
 })
 })

 if (!response.ok) {
 throw new Error(`NVIDIA API error: ${await response.text()}`)
 }

 const data = await response.json()
 return JSON.parse(data.choices[0].message.content)
}

// Main API handler
export async function POST(req: NextRequest) {
 try {
 const { user_id, level, pillar } = await req.json()

 // Validate input
 if (!user_id || !level || !pillar) {
 return NextResponse.json(
 { error: "Missing user_id, level, or pillar" },
 { status: 400 }
 }
 }

 // Fetch user interests from Supabase
 const { data: user, error } = await supabase
 .from('user_profiles')
 .select('interests')
 .eq('id', user_id)
 .single()

 if (error || !user) {
 return NextResponse.json(
 { error: "User not found or Supabase error" },
 { status: 500 }
 )
 }

 // Generate lesson
 const interest = user.interests[0] || "coffee"
 const prompt = buildPrompt(pillar, level, interest)
 const lesson = await generateLesson(prompt)

 // Save lesson to Supabase
 const { error: saveError } = await supabase
 .from('lessons')
 .insert([{
 user_id,
 pillar,
 difficulty: level,
 content: lesson
 }])

 if (saveError) {
 console.error("Supabase save error:", saveError)
 }

 return NextResponse.json(lesson)

 } catch (err) {
 console.error("Lesson API error:", err)
 return NextResponse.json(
 { error: err instanceof Error ? err.message : "Internal server error" },
 { status: 500 }
 )
 }
}