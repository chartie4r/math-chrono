import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuizView from '../views/QuizView.vue'
import ResultView from '../views/ResultView.vue'
import ResultsHistoryView from '../views/ResultsHistoryView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/quiz', component: QuizView },
  { path: '/result', component: ResultView },
  { path: '/results', component: ResultsHistoryView },
  { path: '/settings', component: SettingsView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
