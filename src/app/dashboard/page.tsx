// src/app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { CardIcon, LightBulbIcon, ChatBubbleLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline"

export default async function DashboardPage() {
 const supabase = await createClient()
 const { data: { user } } = await supabase.auth.getUser()

 if (!user) {
 return (
 <div className="min-h-screen bg-gray-50 flex items-center justify-center">
 <div className="bg-white p-8 rounded-lg shadow-md text-center">
 <h2 className="text-xl font-semibold mb-4">Please sign in</h2>
 <Link href="/auth" className="text-blue-600 hover:underline">
 Sign In →
 </Link>
 </div>
 </div>
 )
 }

 // Fetch streak and latest lesson
 const { data: lessons, error: lessonsError } = await supabase
 .from('lessons')
 .select('created_at')
 .eq('user_id', user.id)
 .order('created_at', { ascending: false })
 .limit(7)

 const streak = lessons?.length || 0
 const latestLesson = lessons?.[0]?.created_at || null

 return (
 <main className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
 <div className="max-w-6xl mx-auto">
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Your Learning Dashboard</h1>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 {/* Streak */}
 <StatCard
 title="Current Streak"
 value={`${streak} days`}
 icon={<CardIcon className="h-6 w-6" />}
 className="bg-white dark:bg-gray-800"
 />

 {/* Latest Lesson */}
 <StatCard
 title="Last Lesson"
 value={latestLesson ? new Date(latestLesson).toLocaleDateString() : "Never"}
 icon={<BookOpenIcon className="h-6 w-6" />}
 className="bg-white dark:bg-gray-800"
 />

 {/* XP */}
 <StatCard
 title="XP Earned"
 value="1,234 XP"
 icon={<LightBulbIcon className="h-6 w-6" />}
 className="bg-white dark:bg-gray-800"
 />

 {/* Memory Palace */}
 <StatCard
 title="Memory Anchors"
 value="8/12"}
 icon={<ChatBubbleLeftIcon className="h-6 w-6" />}
 className="bg-white dark:bg-gray-800"
 />
 </div>

 {/* Lesson Preview */}
 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
 <h2 className="text-xl font-semibold mb-4">Today's Lesson Preview</h2>
 <p className="text-gray-500 dark:text-gray-400">Generate a new {latestLesson ? "B2" : "A2"} lesson →</p>
 <div className="mt-4 flex gap-2">
 <Link href="/lesson?pillar=grammar" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
 Grammar
 </Link>
 <Link href="/lesson?pillar=logic" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
 Logic
 </Link>
 </div>
 </div>
 </div>
 </main>
 )
}

function StatCard({ title, value, icon, className }: {
 title: string
 value: string
 icon: React.ReactNode
 className?: string
}) {
 return (
 <div className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col gap-3 ${className}`}>
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
 {icon}
 </div>
 <h3 className="font-medium text-gray-700 dark:text-gray-300">{title}</h3>
 </div>
 <p className="text-2xl font-bold">{value}</p>
 </div>
 )
}