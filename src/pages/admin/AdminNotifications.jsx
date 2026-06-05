import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { Notifications } from '../../lib/base44'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

const typeColor = { order:'badge-info', stock:'badge-warning', system:'badge-success' }

export default function AdminNotifications() {
  const qc = useQueryClient()
  const { data: notifications = [] } = useQuery({ queryKey:['notifications'], queryFn:()=>Notifications.list() })

  const markRead = useMutation({
    mutationFn: id => Notifications.update(id, { is_read: true }),
    onSuccess: () => { qc.invalidateQueries(['notifications']); toast.success('Marked as read') },
  })

  const unread = notifications.filter(n=>!n.is_read).length

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar/>
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Notifications</h1>
          {unread>0&&<span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} new</span>}
        </div>
        <div className="space-y-3">
          {notifications.map(n=>(
            <div key={n.id} className={`card p-5 flex items-start gap-4 ${!n.is_read?'border-l-4 border-accent':''}`}>
              <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0"><Bell size={18} className="text-accent"/></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-800">{n.title}</p>
                  <span className={typeColor[n.type]||'badge-info'}>{n.type}</span>
                </div>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
              </div>
              {!n.is_read&&(
                <button onClick={()=>markRead.mutate(n.id)} className="text-green-500 hover:bg-green-50 p-1.5 rounded-lg"><CheckCheck size={16}/></button>
              )}
            </div>
          ))}
          {notifications.length===0&&(
            <div className="card p-16 text-center"><Bell size={40} className="text-gray-200 mx-auto mb-3"/><p className="text-gray-400">No notifications yet</p></div>
          )}
        </div>
      </main>
    </div>
  )
}
