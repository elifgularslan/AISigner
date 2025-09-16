// features/student/ui/ProfileSummaryCard.tsx

type Props = {
  summary: string
  tracks: string[]
  level: string
}

export function ProfileSummaryCard({ summary, tracks, level }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4 mt-6">
      <h2 className="text-xl font-semibold">Profil Özeti</h2>

      <p><strong>Seviye:</strong> {level}</p>

      <p className="text-gray-700">{summary}</p>

      <div>
        <h3 className="font-medium">Önerilen Öğrenme Yolları:</h3>
        <ul className="list-disc list-inside text-gray-800">
          {tracks.map((track, i) => (
            <li key={i}>{track}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
