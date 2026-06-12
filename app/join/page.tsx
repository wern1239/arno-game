'use client'
import Image from 'next/image'

export default function JoinPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12 flex flex-col items-center text-center">
      <div className="text-5xl mb-4">💬</div>
      <h1 className="text-2xl font-bold text-white mb-2">เข้าร่วม OpenChat</h1>
      <p className="text-gray-400 text-sm mb-8 leading-relaxed">
        พูดคุย วิเคราะห์บอล และลุ้นผลด้วยกันใน LINE OpenChat<br />
        สแกน QR Code เพื่อเข้าร่วมกลุ่มได้เลย!
      </p>

      <div className="bg-white rounded-3xl p-4 shadow-2xl shadow-green-900/40 mb-8">
        <Image
          src="/group_invite_QR_code1781265464220.jpg"
          alt="LINE OpenChat QR Code"
          width={280}
          height={280}
          className="rounded-2xl"
          priority
        />
      </div>

      <div className="flex flex-col gap-3 w-full text-sm text-gray-400">
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <span className="text-xl shrink-0">1️⃣</span>
          <p>เปิดแอป LINE แล้วกดสแกน QR Code</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <span className="text-xl shrink-0">2️⃣</span>
          <p>กด "เข้าร่วม" เพื่อเข้ากลุ่ม OpenChat</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
          <span className="text-xl shrink-0">3️⃣</span>
          <p>ร่วมลุ้น วิเคราะห์ และทายผลบอลโลกด้วยกัน!</p>
        </div>
      </div>
    </div>
  )
}
