<template>
  <div class="library-view">

    <!-- ── HEADER ── -->
    <div class="library-header">
      <h1 class="page-title">Library</h1>
      <p class="page-sub">Novel summary · Class notes · Topic guides</p>
    </div>

    <!-- ── TABS ── -->
    <div class="lib-tabs">
      <button
        class="lib-tab"
        :class="{ active: activeTab === 'novel' }"
        @click="activeTab = 'novel'"
      >
        📖 Novel
      </button>
      <button
        class="lib-tab"
        :class="{ active: activeTab === 'notes' }"
        @click="activeTab = 'notes'"
      >
        📚 Class Notes
      </button>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         NOVEL TAB
    ══════════════════════════════════════════════════════════════════════ -->
    <div v-if="activeTab === 'novel'" class="tab-content">

      <!-- Book card -->
      <div class="book-hero">
        <div class="book-cover">
          <div class="book-spine"></div>
          <div class="book-front">
            <div class="book-title-text">The Lekki<br>Headmaster</div>
            <div class="book-author-text">Wale Okediran</div>
          </div>
        </div>
        <div class="book-meta">
          <div class="book-name">{{ novel.title }}</div>
          <div class="book-by">by {{ novel.author }}</div>
          <div class="book-tags">
            <span class="tag">{{ novel.genre }}</span>
            <span class="tag">{{ novel.year }}</span>
            <span class="tag">JAMB Set Text</span>
          </div>
        </div>
      </div>

      <!-- Synopsis -->
      <div class="section-card">
        <h3 class="card-title">
          <span class="card-title-icon">📝</span> Synopsis
        </h3>
        <p class="prose">{{ novel.synopsis }}</p>
      </div>

      <!-- Exam Tips -->
      <div class="section-card tips-card">
        <h3 class="card-title">
          <span class="card-title-icon">⚡</span> JAMB Exam Tips
        </h3>
        <ul class="tips-list">
          <li v-for="tip in novel.examTips" :key="tip" class="tip-item">
            <span class="tip-bullet">→</span>
            {{ tip }}
          </li>
        </ul>
      </div>

      <!-- Themes -->
      <div class="section-card">
        <h3 class="card-title">
          <span class="card-title-icon">💡</span> Major Themes
        </h3>
        <div class="accordion-list">
          <div
            v-for="theme in novel.themes"
            :key="theme.title"
            class="accordion-item"
            :class="{ open: openTheme === theme.title }"
            @click="openTheme = openTheme === theme.title ? null : theme.title"
          >
            <div class="accordion-header">
              <span class="accordion-title">{{ theme.title }}</span>
              <PhCaretDown :size="16" weight="bold" class="accordion-caret" />
            </div>
            <Transition name="expand">
              <div v-if="openTheme === theme.title" class="accordion-body">
                {{ theme.body }}
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Characters -->
      <div class="section-card">
        <h3 class="card-title">
          <span class="card-title-icon">👤</span> Characters
        </h3>
        <div class="character-list">
          <div
            v-for="char in novel.characters"
            :key="char.name"
            class="character-card"
            :class="{ open: openChar === char.name }"
            @click="openChar = openChar === char.name ? null : char.name"
          >
            <div class="char-header">
              <div class="char-avatar">{{ char.name[0] }}</div>
              <div class="char-info">
                <div class="char-name">{{ char.name }}</div>
                <div class="char-role">{{ char.role }}</div>
              </div>
              <PhCaretDown :size="14" weight="bold" class="accordion-caret" />
            </div>
            <Transition name="expand">
              <div v-if="openChar === char.name" class="accordion-body">
                {{ char.description }}
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Chapter Summaries -->
      <div class="section-card">
        <h3 class="card-title">
          <span class="card-title-icon">📑</span> Chapter Summaries
        </h3>
        <div class="chapter-list">
          <div
            v-for="ch in novel.chapters"
            :key="ch.number"
            class="chapter-item"
            :class="{ open: openChapter === ch.number }"
            @click="openChapter = openChapter === ch.number ? null : ch.number"
          >
            <div class="chapter-header">
              <div class="chapter-num">Ch {{ ch.number }}</div>
              <div class="chapter-title">{{ ch.title }}</div>
              <PhCaretDown :size="14" weight="bold" class="accordion-caret" />
            </div>
            <Transition name="expand">
              <div v-if="openChapter === ch.number" class="accordion-body">
                {{ ch.summary }}
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Literary Devices -->
      <div class="section-card">
        <h3 class="card-title">
          <span class="card-title-icon">✍️</span> Literary Devices Used
        </h3>
        <div class="device-list">
          <div v-for="d in novel.literaryDevices" :key="d.device" class="device-item">
            <div class="device-name">{{ d.device }}</div>
            <div class="device-example">{{ d.example }}</div>
          </div>
        </div>
      </div>

    </div>

    <!-- ══════════════════════════════════════════════════════════════════════
         CLASS NOTES TAB
    ══════════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeTab === 'notes'" class="tab-content">

      <!-- Subject selector -->
      <div class="subject-pills">
        <button
          v-for="subj in userSubjects"
          :key="subj"
          class="subj-pill"
          :class="{ active: activeSubject === subj }"
          :style="activeSubject === subj ? { background: subjectConfig[subj]?.color, color: 'white' } : {}"
          @click="selectSubject(subj)"
        >
          {{ subjectConfig[subj]?.label || subj }}
        </button>
      </div>

      <!-- No notes for subject -->
      <div v-if="!subjectNotes" class="empty-notes">
        <div class="empty-icon">📭</div>
        <p>No notes available for <strong>{{ subjectConfig[activeSubject]?.label }}</strong> yet.</p>
        <p class="empty-sub">We're working on it!</p>
      </div>

      <!-- Topic list -->
      <template v-else>
        <div class="notes-count">
          {{ Object.keys(subjectNotes).length }} topics available
        </div>

        <div
          v-for="(note, topicSlug) in subjectNotes"
          :key="topicSlug"
          class="note-card"
          :class="{ open: openNote === topicSlug }"
        >
          <!-- Topic header (always visible) -->
          <div class="note-header" @click="toggleNote(topicSlug)">
            <div class="note-title-wrap">
              <div class="note-title">{{ note.title }}</div>
              <div class="note-slug">{{ topicSlug }}</div>
            </div>
            <PhCaretDown :size="16" weight="bold" class="accordion-caret" />
          </div>

          <!-- Topic body (expandable) -->
          <Transition name="expand">
            <div v-if="openNote === topicSlug" class="note-body">

              <!-- Main body text -->
              <div class="note-prose">
                <p
                  v-for="(para, i) in note.body.split('\n\n')"
                  :key="i"
                  class="note-para"
                >{{ para }}</p>
              </div>

              <!-- Key points -->
              <div class="key-points">
                <div class="kp-title">
                  <PhCheckCircle :size="15" weight="fill" class="kp-icon" />
                  Key Points
                </div>
                <ul class="kp-list">
                  <li v-for="pt in note.keyPoints" :key="pt" class="kp-item">
                    {{ pt }}
                  </li>
                </ul>
              </div>

              <!-- Exam tip -->
              <div class="exam-tip-box">
                <div class="tip-label">
                  <PhLightning :size="13" weight="fill" /> JAMB Tip
                </div>
                <div class="tip-text">{{ note.examTip }}</div>
              </div>

              <!-- Practice button -->
              <RouterLink
                :to="`/exam/practice?subject=${activeSubject}&topic=${topicSlug}`"
                class="practice-topic-btn"
              >
                <PhLightning :size="14" weight="fill" />
                Practice {{ note.title }} Questions
              </RouterLink>

            </div>
          </Transition>
        </div>
      </template>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { SUBJECT_CONFIG } from '@/data/questions'
import { NOVEL_DATA, SUBJECT_NOTES } from '@/data/studyNotes'
import {
  PhCaretDown, PhCheckCircle, PhLightning
} from '@phosphor-icons/vue'

const userStore     = useUserStore()
const subjectConfig = SUBJECT_CONFIG

// ── Tabs ─────────────────────────────────────────────────────────────────
const activeTab = ref('novel')

// ── Novel ─────────────────────────────────────────────────────────────────
const novel      = NOVEL_DATA
const openTheme   = ref(null)
const openChar    = ref(null)
const openChapter = ref(null)

// ── Notes ─────────────────────────────────────────────────────────────────

// Show the user's registered subjects; fall back to all available if not set
const userSubjects = computed(() => {
  const subs = userStore.subjects?.length ? userStore.subjects : Object.keys(SUBJECT_NOTES)
  // Always put english first (has the novel)
  return ['english', ...subs.filter(s => s !== 'english')]
    .filter(s => s in SUBJECT_NOTES || s in SUBJECT_CONFIG)
})

const activeSubject = ref(userSubjects.value[0] ?? 'english')
const openNote      = ref(null)

const subjectNotes = computed(() => SUBJECT_NOTES[activeSubject.value] ?? null)

function selectSubject(subj) {
  activeSubject.value = subj
  openNote.value      = null   // collapse any open note
}

function toggleNote(slug) {
  openNote.value = openNote.value === slug ? null : slug
}
</script>

<style scoped>
.library-view {
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 24px;
}

/* ── Header ── */
.library-header {
  padding: 20px 16px 12px;
}
.page-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 4px;
}
.page-sub {
  font-size: 13px;
  color: var(--muted);
}

/* ── Tabs ── */
.lib-tabs {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}
.lib-tab {
  flex: 1;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
}
.lib-tab.active {
  background: var(--navy);
  color: white;
  border-color: var(--navy);
}

/* ── Shared tab content ── */
.tab-content {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Section cards ── */
.section-card {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--shadow);
}
.card-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-title-icon { font-size: 16px; }

/* ── Book hero ── */
.book-hero {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--shadow);
  display: flex;
  gap: 16px;
  align-items: center;
}
.book-cover {
  width: 72px;
  height: 96px;
  border-radius: 4px 8px 8px 4px;
  box-shadow: -3px 3px 12px rgba(0,0,0,0.25);
  display: flex;
  overflow: hidden;
  flex-shrink: 0;
}
.book-spine {
  width: 10px;
  background: #0A123A;
  height: 100%;
}
.book-front {
  flex: 1;
  background: linear-gradient(160deg, #1a2c6b 0%, #0A123A 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 6px;
  gap: 6px;
}
.book-title-text {
  font-size: 9px;
  font-weight: 800;
  color: #00C853;
  text-align: center;
  line-height: 1.3;
  font-family: var(--font-display);
}
.book-author-text {
  font-size: 7px;
  color: rgba(255,255,255,0.6);
  text-align: center;
}
.book-meta { flex: 1; }
.book-name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 3px;
}
.book-by {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 10px;
}
.book-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag {
  background: var(--grey);
  color: var(--muted);
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

/* ── Prose ── */
.prose {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text);
}

/* ── Tips card ── */
.tips-card { background: #F0FFF6; border: 1.5px solid rgba(0,200,83,0.2); }
.tips-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.tip-item {
  display: flex;
  gap: 10px;
  font-size: 13.5px;
  color: var(--text);
  line-height: 1.5;
}
.tip-bullet {
  color: var(--green);
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Accordion ── */
.accordion-list, .chapter-list { display: flex; flex-direction: column; gap: 8px; }
.accordion-item, .chapter-item, .character-card {
  border: 1.5px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
}
.accordion-item.open, .chapter-item.open, .character-card.open {
  border-color: var(--green);
}
.accordion-header, .chapter-header, .char-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
}
.accordion-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
.accordion-caret {
  color: var(--muted);
  transition: transform 0.25s;
  flex-shrink: 0;
}
.accordion-item.open .accordion-caret,
.chapter-item.open .accordion-caret,
.character-card.open .accordion-caret {
  transform: rotate(180deg);
}
.accordion-body {
  padding: 0 14px 14px;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text);
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-top: -1px;
}

/* ── Characters ── */
.character-list { display: flex; flex-direction: column; gap: 8px; }
.char-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--navy);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}
.char-info { flex: 1; }
.char-name { font-size: 14px; font-weight: 700; color: var(--text); }
.char-role { font-size: 12px; color: var(--muted); }

/* ── Chapters ── */
.chapter-num {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--grey);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 800;
  color: var(--muted);
  flex-shrink: 0;
}
.chapter-title { flex: 1; font-size: 14px; font-weight: 600; color: var(--text); }

/* ── Literary devices ── */
.device-list { display: flex; flex-direction: column; gap: 12px; }
.device-item { border-left: 3px solid var(--green); padding-left: 12px; }
.device-name { font-size: 13.5px; font-weight: 700; color: var(--navy); margin-bottom: 3px; }
.device-example { font-size: 13px; color: var(--muted); line-height: 1.5; }

/* ── Subject pills ── */
.subject-pills {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.subject-pills::-webkit-scrollbar { display: none; }
.subj-pill {
  white-space: nowrap;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

/* ── Notes count ── */
.notes-count {
  font-size: 12.5px;
  color: var(--muted);
  font-weight: 500;
  padding-left: 2px;
}

/* ── Note cards ── */
.note-card {
  background: white;
  border-radius: 14px;
  border: 1.5px solid var(--border);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
}
.note-card.open { border-color: var(--green); }

.note-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
}
.note-title-wrap { flex: 1; }
.note-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}
.note-slug {
  font-size: 11.5px;
  color: var(--muted);
}

/* ── Note body ── */
.note-body {
  border-top: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.note-prose { display: flex; flex-direction: column; gap: 10px; }
.note-para {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text);
  white-space: pre-line;
}

/* ── Key points ── */
.key-points {
  background: var(--grey);
  border-radius: 12px;
  padding: 14px;
}
.kp-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.kp-icon { color: var(--green); }
.kp-list { list-style: none; display: flex; flex-direction: column; gap: 7px; }
.kp-item {
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
  padding-left: 14px;
  position: relative;
}
.kp-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--green);
  font-weight: 700;
}

/* ── Exam tip box ── */
.exam-tip-box {
  background: linear-gradient(135deg, #0A123A, #1a2c6b);
  border-radius: 12px;
  padding: 14px;
}
.tip-label {
  font-size: 11px;
  font-weight: 700;
  color: #00C853;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.tip-text {
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  line-height: 1.6;
}

/* ── Practice button ── */
.practice-topic-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--green);
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}
.practice-topic-btn:hover { opacity: 0.9; transform: translateY(-1px); }

/* ── Empty state ── */
.empty-notes {
  text-align: center;
  padding: 48px 16px;
  color: var(--muted);
}
.empty-icon { font-size: 40px; margin-bottom: 12px; }
.empty-notes p { font-size: 14px; margin-bottom: 6px; }
.empty-sub { font-size: 13px; }

/* ── Expand transition ── */
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>
