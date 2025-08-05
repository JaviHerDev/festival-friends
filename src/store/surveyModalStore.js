import { create } from 'zustand';

const useSurveyModalStore = create((set, get) => ({
  // Survey modal state
  showSurvey: false,
  surveyEvent: null,
  
  // Survey stats modal state
  showSurveyStats: false,
  statsEvent: null,
  
  // Actions
  openSurvey: (event) => set({ 
    showSurvey: true, 
    surveyEvent: event,
    showSurveyStats: false,
    statsEvent: null
  }),
  
  closeSurvey: () => set({ 
    showSurvey: false, 
    surveyEvent: null 
  }),
  
  openSurveyStats: (event) => set({ 
    showSurveyStats: true, 
    statsEvent: event,
    showSurvey: false,
    surveyEvent: null
  }),
  
  closeSurveyStats: () => set({ 
    showSurveyStats: false, 
    statsEvent: null 
  }),
  
  // Reset all modals
  resetModals: () => set({
    showSurvey: false,
    surveyEvent: null,
    showSurveyStats: false,
    statsEvent: null
  })
}));

export default useSurveyModalStore; 