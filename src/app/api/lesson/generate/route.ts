"use server"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { type NextRequest } from 'next/server'

function buildGrammarPrompt(level: string, interests: string[]) {
  const anchor = interests[0] || 'coffee'
  return `
You are Lexio, a witty AI tutor training Brazilians to master English.
Today's pillar: **GRAMMAR**. Target CEFR level: **${level}**. Memory palace anchor: **${anchor}**.

Output a **JSON-only** lesson with these EXACT fields:
{
 "grammar": "Specific tense/structure + PT-BR interference warning",
 "logic": "Reasoning behind usage choice",
 "communication": "Real-world scenario + natural example sentences",
 "mnemonic": "\\"CONCEPT→LOCATION→VISUAL HOOK→PT ANCHOR\\""
}

Example for "simple past":
{
 "grammar": "**Simple past: -ed verbs**. Watch for Portuguese present perfect interference ('I have seen' → 'Eu vi', not 'I saw').",
 "logic": "Fixed point in time. Move stories forward!",
 "communication": "Interview prep: Tell me about a challenge you **overcame** last year.",
 "mnemonic": "PAST ACTION→OFFICE DESK→DUSTY STAPLER→MINHA MESA DE ESCRITÓRIO"
}
`.trim()
}

async function generateWithNvidia(prompt: string) {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) throw new Error('NVIDIA_API_KEY is missing')

  const body = {
    model: 'nvidia/nemotron-3-nano-30b-a3b', // Default model from plan
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 512,
    temperature: 0.2,
    top_p: 1
  }

  const response = await fetch(
    'https://integrate.api.nvidia.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  )

  if (!response.ok) {
    throw new Error(`NVIDIA API error: ${await response.text()}`)
  }

  const data = await response.json()
  try {
    return JSON.parse(data.choices[0].message.content)
  } catch {
    throw new Error('Lesson JSON is malformed')
  }
}
  const { user_id, level } = await req.json()
  
  // Debug: Log input
  console.log('[LESSON_API] Input:', { user_id, level })
  
  // 1. Validate input
  if (!user_id || !level || !['A2', 'B1', 'B2', 'C1'].includes(level)) {
    console.error('[LESSON_API] Invalid input:', { user_id, level })
    return NextResponse.json(
      { error: 'Invalid input: user_id and CEFR level (A2/B1/B2/C1) are required.' },
      { status: 400 }
    )
  }
  
  // 2. Fetch user interests (debug Supabase)
  try {
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('interests, pillar_weights')
      .eq('id', user_id)
      .single()
    
    if (userError) {
      console.error('[LESSON_API] Supabase error:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile', details: userError.message },
        { status: 500 }
      )
    }
    console.log('[LESSON_API] User:', user)
    
    // 3. Generate lesson via NVIDIA
    const prompt = buildGrammarPrompt(level, user.interests)
    console.log('[LESSON_API] Prompt:', prompt)
    
    const lesson = await generateWithNvidia(prompt)
    console.log('[LESSON_API] Lesson:', lesson)
    
    // 4. Validate lesson
    if (!lesson.grammar || !lesson.logic || !lesson.communication || !lesson.mnemonic) {
      console.error('[LESSON_API] Validation failed:', lesson)
      return NextResponse.json(
        { error: 'Lesson failed validation', lesson },
        { status: 500 }
      )
    }
    
    // 5. Save to Supabase
    const { data: savedLesson, error: saveError } = await supabase
      .from('lessons')
      .insert([{
        user_id,
        pillar: 'grammar',
        difficulty: level,
        content: lesson,
        prompt_version: 'v1.0-mvp'
      }])
      .select('id')
      .single()
    
    if (saveError) {
      console.error('[LESSON_API] Save error:', saveError)
      return NextResponse.json(
        { error: 'Failed to save lesson', details: saveError.message },
        { status: 500 }
      )
    }
    
    // 6. Return lesson
    return NextResponse.json(lesson)
    
  } catch (err) {
    console.error('[LESSON_API] Exception:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}