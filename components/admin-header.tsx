import type React from "react"

interface AdminHeaderProps {
  title: string
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
    </header>
  )
}

export default AdminHeader
