import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import EventSurvey from './EventSurvey.jsx';
import SurveyStats from './SurveyStats.jsx';
import useSurveyModalStore from '../store/surveyModalStore.js';
import useStore from '../store/useStore.js';
import { toast } from '../store/toastStore.js';

const SurveyModalPortal = () => {
  const [mounted, setMounted] = useState(false);
  const { 
    showSurvey, 
    surveyEvent, 
    closeSurvey,
    showSurveyStats, 
    statsEvent, 
    closeSurveyStats 
  } = useSurveyModalStore();
  
  const { submitSurveyResponse } = useStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSurveySubmit = async (surveyData) => {
    try {
      const { error } = await submitSurveyResponse(surveyData);
      
      if (error) {
        console.error('Error submitting survey:', error);
        toast.error('Error', 'No se pudo enviar la encuesta. Inténtalo de nuevo.');
        return;
      }
      
      toast.success('¡Encuesta enviada!', 'Gracias por compartir tu experiencia');
      closeSurvey();
      
    } catch (err) {
      console.error('Exception submitting survey:', err);
      toast.error('Error', 'No se pudo enviar la encuesta. Inténtalo de nuevo.');
    }
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Survey Modal */}
      <EventSurvey
        event={surveyEvent}
        isOpen={showSurvey}
        onClose={closeSurvey}
        onSubmit={handleSurveySubmit}
      />

      {/* Survey Stats Modal */}
      <SurveyStats
        event={statsEvent}
        isOpen={showSurveyStats}
        onClose={closeSurveyStats}
      />
    </>,
    document.body
  );
};

export default SurveyModalPortal; 