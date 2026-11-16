<template>
  <div class="min-h-screen bg-paper">
    <AppHeader>
      <template #actions>
        <SensoryToggle />
        <NuxtLink
          to="/studio"
          class="flex min-h-11 items-center rounded-full border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
        >
          回画室
        </NuxtLink>
      </template>
    </AppHeader>

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sage-strong">
            {{ viewMode === 'gallery' ? 'Your gallery' : 'Your archive' }}
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-wide text-ink">
            {{ viewMode === 'gallery' ? '作品画廊' : '作品管理' }}
          </h1>
          <p class="mt-2 max-w-xl text-sm leading-6 text-muted">
            {{
              viewMode === 'gallery'
                ? '每一张故事卡，都是你留给自己的一个小小展览。点开可以看得更近一些。'
                : '管理这台设备上的故事卡。想拿原图时，点一下「下载」。'
            }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
            {{ cards.length }} 件作品
          </span>
          <div
            class="inline-flex rounded-full border border-line bg-surface p-1"
            role="group"
            aria-label="页面模式"
          >
            <button
              type="button"
              class="min-h-9 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
              :class="viewMode === 'gallery' ? 'bg-sage text-white' : 'text-muted hover:text-ink'"
              :aria-pressed="viewMode === 'gallery'"
              @click="setViewMode('gallery')"
            >
              画廊
            </button>
            <button
              type="button"
              class="min-h-9 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
              :class="viewMode === 'manage' ? 'bg-sage text-white' : 'text-muted hover:text-ink'"
              :aria-pressed="viewMode === 'manage'"
              @click="setViewMode('manage')"
            >
              管理
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="mt-10 rounded-card border border-line bg-surface p-10 text-center text-sm text-muted shadow-soft">
        正在打开画廊…
      </div>

      <div v-else-if="error" class="mt-10 rounded-card border border-line bg-surface p-10 text-center shadow-soft">
        <p class="text-sm text-danger">{{ error }}</p>
        <button
          class="mt-4 min-h-11 rounded-full border border-line bg-surface-2 px-5 text-sm font-medium text-ink transition-colors hover:bg-line/50"
          @click="load"
        >
          再试一次
        </button>
      </div>

      <div v-else-if="!cards.length" class="mt-10 rounded-card border border-dashed border-line bg-surface/60 p-12 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft text-sage-strong">
          <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 9h18" />
            <path d="M8 13h8" />
          </svg>
        </div>
        <h2 class="mt-4 font-semibold text-ink">画廊还是空的</h2>
        <p class="mt-2 text-sm text-muted">在画室生成一幅作品，再把故事卡存进来。</p>
        <NuxtLink
          to="/studio"
          class="mt-5 inline-flex min-h-11 items-center rounded-full bg-sage px-5 text-sm font-medium text-white transition-colors hover:bg-sage-strong"
        >
          去画室
        </NuxtLink>
      </div>

      <template v-else>
        <template v-if="viewMode === 'gallery'">
          <section
            v-if="featured"
            class="mt-8 grid gap-5 overflow-hidden rounded-card border border-line bg-surface p-4 shadow-soft lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.8fr)]"
          >
            <button
              type="button"
              class="group overflow-hidden rounded-[14px] bg-surface-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
              :aria-label="`查看最新作品，${styleLabel(featured)}`"
              @click="openPreview(featured)"
            >
              <img
                :src="featured.dataUrl"
                :alt="`${styleLabel(featured)} 风格的故事卡`"
                class="aspect-[10/7] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              >
            </button>

            <div class="flex flex-col justify-center p-2 sm:p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-sage-strong">
                {{ sortOrder === 'newest' ? '最新作品' : '最早作品' }}
              </p>
              <h2 class="mt-2 text-2xl font-semibold tracking-wide text-ink">
                {{ styleLabel(featured) }}
              </h2>
              <time class="mt-1 text-xs text-muted" :datetime="new Date(featured.createdAt).toISOString()">
                {{ formatDateTime(featured.createdAt) }}
              </time>
              <p v-if="featured.caption" class="mt-4 line-clamp-4 text-sm leading-7 text-muted">
                {{ featured.caption }}
              </p>
              <div class="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  class="min-h-10 rounded-full bg-sage px-4 text-sm font-medium text-white transition-colors hover:bg-sage-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
                  @click="openPreview(featured)"
                >
                  查看大图
                </button>
                <button
                  type="button"
                  class="min-h-10 rounded-full border border-line px-4 text-sm text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
                  @click="download(featured)"
                >
                  保存到本地
                </button>
              </div>
            </div>
          </section>

          <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap gap-2" role="group" aria-label="按风格筛选">
              <button
                v-for="style in styleFilters"
                :key="style"
                type="button"
                class="min-h-9 rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
                :class="selectedStyle === style
                  ? 'border-sage bg-sage-soft text-sage-strong'
                  : 'border-line bg-surface text-muted hover:text-ink'"
                :aria-pressed="selectedStyle === style"
                @click="selectedStyle = style"
              >
                {{ style }}
              </button>
            </div>

            <label class="flex items-center gap-2 text-xs text-muted">
              排序
              <select
                v-model="sortOrder"
                class="min-h-9 rounded-full border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
              >
                <option value="newest">最新</option>
                <option value="oldest">最早</option>
              </select>
            </label>
          </div>

          <section v-if="wallCards.length" class="mt-6">
            <div class="flex items-end justify-between gap-3">
              <h2 class="text-lg font-semibold tracking-wide text-ink">更多作品</h2>
              <p class="text-xs text-muted">{{ wallCards.length }} 件</p>
            </div>
            <div class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <article
                v-for="card in wallCards"
                :key="card.id"
                class="overflow-hidden rounded-card border border-line bg-surface shadow-soft"
              >
                <button
                  type="button"
                  class="group block w-full bg-surface-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/40"
                  :aria-label="`查看作品，${styleLabel(card)}`"
                  @click="openPreview(card)"
                >
                  <img
                    :src="card.dataUrl"
                    :alt="`${styleLabel(card)} 风格的故事卡`"
                    class="aspect-[10/7] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  >
                </button>
                <div class="space-y-2 p-4">
                  <div class="flex items-baseline justify-between gap-2">
                    <h3 class="font-semibold text-ink">{{ styleLabel(card) }}</h3>
                    <time class="shrink-0 text-xs text-muted" :datetime="new Date(card.createdAt).toISOString()">
                      {{ formatDate(card.createdAt) }}
                    </time>
                  </div>
                  <p v-if="card.caption" class="line-clamp-2 text-sm leading-6 text-muted">
                    {{ card.caption }}
                  </p>
                </div>
              </article>
            </div>
          </section>

          <p v-else-if="featured" class="mt-8 text-center text-sm text-muted">
            {{ selectedStyle === '全部' ? '这是画廊里唯一的一件作品。' : '这个风格下只有这一件作品。' }}
          </p>
        </template>

        <section v-else class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="card in sortedCards"
            :key="card.id"
            class="overflow-hidden rounded-card border border-line bg-surface shadow-soft"
          >
            <button
              type="button"
              class="block w-full bg-surface-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sage/40"
              :aria-label="`查看故事卡，${formatDate(card.createdAt)}`"
              @click="openPreview(card)"
            >
              <img
                :src="card.dataUrl"
                :alt="`${styleLabel(card)} 风格的故事卡`"
                class="aspect-[10/7] w-full object-cover"
                loading="lazy"
              >
            </button>

            <div class="space-y-3 p-4">
              <div class="flex items-baseline justify-between gap-2">
                <h2 class="font-semibold text-ink">{{ styleLabel(card) }}</h2>
                <time class="shrink-0 text-xs text-muted" :datetime="new Date(card.createdAt).toISOString()">
                  {{ formatDate(card.createdAt) }}
                </time>
              </div>
              <p v-if="card.caption" class="line-clamp-3 text-sm leading-6 text-muted">
                {{ card.caption }}
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="min-h-10 flex-1 rounded-full bg-sage px-4 text-sm font-medium text-white transition-colors hover:bg-sage-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
                  @click="download(card)"
                >
                  下载
                </button>
                <button
                  type="button"
                  class="min-h-10 rounded-full border border-line px-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                  @click="remove(card)"
                >
                  删除
                </button>
              </div>
            </div>
          </article>
        </section>
      </template>
    </main>

    <Teleport to="body">
      <div
        v-if="preview"
        class="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 p-3 backdrop-blur-sm sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="作品预览"
        @click.self="closePreview"
      >
        <div class="max-h-[92dvh] w-full max-w-4xl overflow-auto rounded-[28px] border border-line bg-surface p-3 shadow-2xl">
          <div class="relative">
            <img
              :src="preview.dataUrl"
              :alt="`${styleLabel(preview)} 风格的故事卡`"
              class="w-full rounded-[20px]"
            >
            <button
              v-if="previewList.length > 1"
              type="button"
              class="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-soft transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
              aria-label="上一件作品"
              @click="movePreview(-1)"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              v-if="previewList.length > 1"
              type="button"
              class="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface/90 text-ink shadow-soft transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
              aria-label="下一件作品"
              @click="movePreview(1)"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div class="mt-3 flex flex-wrap items-end justify-between gap-3 px-1">
            <div class="min-w-0">
              <p class="text-sm text-muted">
                {{ formatDateTime(preview.createdAt) }} · {{ styleLabel(preview) }}
              </p>
              <p v-if="preview.caption" class="mt-1 line-clamp-3 text-sm leading-6 text-ink">
                {{ preview.caption }}
              </p>
              <p v-if="previewList.length > 1" class="mt-1 text-xs text-muted">
                {{ previewPosition }} / {{ previewList.length }}
              </p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button
                ref="closeButton"
                class="min-h-10 rounded-full border border-line bg-surface-2 px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
                @click="closePreview"
              >
                关闭
              </button>
              <button
                class="min-h-10 rounded-full bg-sage px-4 text-sm font-medium text-white transition-colors hover:bg-sage-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40"
                @click="download(preview)"
              >
                保存到本地
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import SensoryToggle from '~/components/SensoryToggle.vue'
import {
  deleteStoryCard,
  downloadStoryCard,
  listStoryCards,
  type ArchivedStoryCard,
} from '~/utils/archive'

type ViewMode = 'gallery' | 'manage'
type SortOrder = 'newest' | 'oldest'

const cards = ref<ArchivedStoryCard[]>([])
const loading = ref(true)
const error = ref('')
const preview = ref<ArchivedStoryCard | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const viewMode = ref<ViewMode>('gallery')
const selectedStyle = ref('全部')
const sortOrder = ref<SortOrder>('newest')

const styleFilters = computed(() => {
  const styles = [...new Set(cards.value.map(card => styleLabel(card)))]
  return ['全部', ...styles]
})

const sortedCards = computed(() => {
  const direction = sortOrder.value === 'newest' ? -1 : 1
  return [...cards.value].sort((a, b) => (a.createdAt - b.createdAt) * direction)
})

const filteredCards = computed(() => {
  if (selectedStyle.value === '全部') return sortedCards.value
  return sortedCards.value.filter(card => styleLabel(card) === selectedStyle.value)
})

const featured = computed(() => filteredCards.value[0] ?? null)
const wallCards = computed(() => filteredCards.value.slice(1))

const previewList = computed(() => {
  return viewMode.value === 'manage' ? sortedCards.value : filteredCards.value
})

const previewPosition = computed(() => {
  if (!preview.value) return 0
  return previewList.value.findIndex(card => card.id === preview.value?.id) + 1
})

function styleLabel(card: ArchivedStoryCard) {
  return card.styleTitle?.trim() || '未命名风格'
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp))
}

function formatDateTime(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function setViewMode(mode: ViewMode) {
  viewMode.value = mode
  closePreview()
}

function openPreview(card: ArchivedStoryCard) {
  preview.value = card
}

function closePreview() {
  preview.value = null
}

function movePreview(delta: number) {
  if (!preview.value || previewList.value.length <= 1) return
  const current = previewList.value.findIndex(card => card.id === preview.value?.id)
  if (current < 0) return
  const next = (current + delta + previewList.value.length) % previewList.value.length
  preview.value = previewList.value[next] ?? null
}

function handleKeydown(event: KeyboardEvent) {
  if (!preview.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closePreview()
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    movePreview(-1)
    return
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    movePreview(1)
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    cards.value = await listStoryCards()
  }
  catch (err) {
    console.error('[archive] 读取失败：', err)
    error.value = (err as Error)?.message || '画廊没有打开，请再试一次。'
  }
  finally {
    loading.value = false
  }
}

function download(card: ArchivedStoryCard) {
  // 显式点击：保留用户手势，浏览器不会拦截这次下载。
  downloadStoryCard(card)
}

async function remove(card: ArchivedStoryCard) {
  if (!window.confirm('从本机档案里删除这张故事卡？')) return

  try {
    await deleteStoryCard(card.id)
    cards.value = cards.value.filter(item => item.id !== card.id)
    if (preview.value?.id === card.id) closePreview()
  }
  catch (err) {
    console.error('[archive] 删除失败：', err)
    error.value = '删除没有成功，请再试一次。'
  }
}

watch(styleFilters, (filters) => {
  if (selectedStyle.value !== '全部' && !filters.includes(selectedStyle.value)) {
    selectedStyle.value = '全部'
  }
})

watch([selectedStyle, sortOrder, viewMode], () => {
  if (preview.value) closePreview()
})

watch(preview, async (value) => {
  if (!value) {
    document.body.style.overflow = ''
    return
  }
  document.body.style.overflow = 'hidden'
  await nextTick()
  closeButton.value?.focus()
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  void load()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>
