<script setup lang="ts">
import About from './About.vue'
import ActivityTimeline from './ActivityTimeline.vue'
import Connection from './Connection.vue'
import ProjectList from './ProjectList.vue'
import Teams from './Teams.vue'
import type { ProfileTab } from '@db/pages/profile/types'

const router = useRoute('user-profile-tab')
const profileTabData = ref<ProfileTab>({
  about: [
    { property: 'Full Name', value: 'John Doe', icon: 'tabler-user' },
    { property: 'Status', value: 'active', icon: 'tabler-check' },
    { property: 'Role', value: 'Developer', icon: 'tabler-crown' },
    { property: 'Country', value: 'USA', icon: 'tabler-flag' },
    { property: 'Language', value: 'English', icon: 'tabler-language' },
  ],
  contacts: [
    { property: 'Contact', value: '(123) 456-7890', icon: 'tabler-phone' },
    { property: 'Skype', value: 'john.doe', icon: 'tabler-brand-skype' },
    { property: 'Email', value: 'john.doe@example.com', icon: 'tabler-mail' },
  ],
  teams: [
    { property: 'Backend Developer', value: '(126 Members)', icon: 'tabler-brand-github', color: 'primary' },
    { property: 'VueJS Developer', value: '(98 Members)', icon: 'tabler-brand-vue', color: 'success' },
  ],
  overview: [
    { property: 'Task Compiled', value: '13.5k', icon: 'tabler-check' },
    { property: 'Connections', value: '897', icon: 'tabler-users' },
    { property: 'Projects Compiled', value: '146', icon: 'tabler-layout-grid' },
  ],
  connections: [],
  teamsTech: [],
})
</script>

<template>
  <VRow v-if="profileTabData">
    <VCol
      md="4"
      cols="12"
    >
      <About :data="profileTabData" />
    </VCol>

    <VCol
      cols="12"
      md="8"
    >
      <VRow>
        <VCol cols="12">
          <ActivityTimeline />
        </VCol>

        <VCol
          cols="12"
          md="6"
        >
          <Connection :connections-data="profileTabData.connections" />
        </VCol>

        <VCol
          cols="12"
          md="6"
        >
          <Teams :teams-data="profileTabData.teamsTech" />
        </VCol>

        <VCol cols="12">
          <ProjectList />
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>
