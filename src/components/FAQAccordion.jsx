'use client';

import { useState } from 'react';

const FAQAccordion = () => {
  const [openItems, setOpenItems] = useState(new Set());

  const faqData = [
    {
      id: 1,
      question: "¿Qué es Festival&Friends?",
      answer: "Festival&Friends es la red social definitiva para amantes de la música. Conecta con tus amigos, descubre festivales épicos, gestiona tus asistencias y vive la experiencia musical como nunca antes."
    },
    {
      id: 2,
      question: "¿Cómo puedo unirme a la comunidad?",
      answer: "Es muy fácil. Simplemente crea una cuenta gratuita con tu email, completa tu perfil con tus gustos musicales y comienza a conectar con otros festivaleros. ¡La comunidad te está esperando!"
    },
    {
      id: 3,
      question: "¿Qué son las encuestas y cómo funcionan?",
      answer: "Las encuestas te permiten votar por diferentes aspectos de los festivales. Cuando se cierran, los ganadores reciben insignias especiales. Es una forma divertida de participar y ganar reconocimiento en la comunidad."
    },
    {
      id: 4,
      question: "¿Cómo funcionan las insignias?",
      answer: "Las insignias son logros que puedes ganar participando en encuestas, asistiendo a festivales o contribuyendo a la comunidad. Cada insignia tiene su propia rareza y te ayuda a destacar entre los festivaleros."
    },
    {
      id: 5,
      question: "¿Puedo gestionar mis asistencias a festivales?",
      answer: "¡Por supuesto! Puedes marcar tu asistencia a festivales, ver quién más va a ir, coordinar encuentros con amigos y mantener un historial completo de tus experiencias musicales."
    },
    {
      id: 6,
      question: "¿Cómo funciona el apartado de amigos?",
      answer: "En el apartado de amigos puedes ver todos los miembros de la comunidad, explorar perfiles, conectar con otros festivaleros y descubrir personas con gustos musicales similares. También puedes ver estadísticas de la comunidad y encontrar nuevos amigos para tus próximos festivales."
    },
    {
      id: 7,
      question: "¿Cómo funciona el árbol de conexiones?",
      answer: "El árbol de conexiones te permite visualizar cómo estás conectado con otros festivaleros. Ve las relaciones entre amigos, descubre conexiones inesperadas y encuentra personas con gustos musicales similares. Es una forma única de explorar la red social de la música."
    },
    {
      id: 8,
      question: "¿Puedo personalizar mi perfil?",
      answer: "Sí, puedes personalizar completamente tu perfil con tu foto, bio, géneros musicales favoritos, festivales que has asistido y mucho más. ¡Haz que tu perfil refleje tu pasión por la música!"
    }
  ];

  const handleToggle = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  // Dividir los datos en dos columnas
  const leftColumn = faqData.slice(0, Math.ceil(faqData.length / 2));
  const rightColumn = faqData.slice(Math.ceil(faqData.length / 2));

  const FAQItem = ({ item }) => {
    const isOpen = openItems.has(item.id);
    
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
        <button
          onClick={() => handleToggle(item.id)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/20 transition-colors duration-200"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white pr-4">
            {item.question}
          </h3>
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
        
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-4">
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Columna izquierda */}
      <div className="space-y-4">
        {leftColumn.map((item) => (
          <FAQItem key={item.id} item={item} />
        ))}
      </div>
      
      {/* Columna derecha */}
      <div className="space-y-4">
        {rightColumn.map((item) => (
          <FAQItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default FAQAccordion; 