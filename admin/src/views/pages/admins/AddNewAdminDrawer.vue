<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'

import type { VForm } from 'vuetify/components/VForm'

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'adminData', value: any): void
}

interface Props {
  isDrawerOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isFormValid = ref(false)
const refForm = ref<VForm>()
const username = ref('')
const password = ref('')
const avatarUrl = ref('')
const avatarFile = ref<File[]>()
const isUploading = ref(false)

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
    avatarFile.value = undefined
    avatarUrl.value = ''
  })
}

const onFileChange = async (files: File[]) => {
  if (!files.length) return
  
  const file = files[0]
  const formData = new FormData()
  formData.append('file', file)

  isUploading.value = true
  try {
    const res = await $api('/admin/upload', {
      method: 'POST',
      body: formData,
    })
    avatarUrl.value = res.url
  } catch (e) {
    console.error('Upload failed:', e)
  } finally {
    isUploading.value = false
  }
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('adminData', {
        username: username.value,
        password: password.value,
        avatarUrl: avatarUrl.value,
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
        avatarFile.value = undefined
        avatarUrl.value = ''
      })
    }
  })
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer
    data-allow-mismatch
    temporary
    :width="400"
    location="end"
    class="scrollable-content"
    :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate"
  >
    <!-- 👉 Title -->
    <AppDrawerHeaderSection
      title="新增管理员"
      @cancel="closeNavigationDrawer"
    />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm
            ref="refForm"
            v-model="isFormValid"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- 👉 Username -->
              <VCol cols="12">
                <AppTextField
                  v-model="username"
                  :rules="[requiredValidator]"
                  label="用户名"
                  placeholder="请输入用户名"
                />
              </VCol>

              <!-- 👉 Password -->
              <VCol cols="12">
                <AppTextField
                  v-model="password"
                  :rules="[requiredValidator]"
                  label="密码"
                  placeholder="············"
                  type="password"
                />
              </VCol>

              <!-- 👉 Avatar Upload -->
              <VCol cols="12">
                <VFileInput
                  v-model="avatarFile"
                  label="上传头像"
                  prepend-icon="tabler-camera"
                  accept="image/*"
                  :loading="isUploading"
                  @update:model-value="onFileChange"
                />
                <VImg
                  v-if="avatarUrl"
                  :src="avatarUrl"
                  width="100"
                  height="100"
                  class="mt-2 rounded"
                  cover
                />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn
                  type="submit"
                  class="me-3"
                >
                  提交
                </VBtn>
                <VBtn
                  type="reset"
                  variant="tonal"
                  color="error"
                  @click="closeNavigationDrawer"
                >
                  取消
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>
