export default [
  {
    title: '首页',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: '会员管理',
    to: { name: 'users' },
    icon: { icon: 'tabler-users' },
  },
  {
    title: '管理员管理',
    to: { name: 'admins' },
    icon: { icon: 'tabler-user' },
  },
  {
    title: '设置',
    to: { name: 'account-settings-tab', params: { tab: 'account' } },
    icon: { icon: 'tabler-settings' },
  },
]
