import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "system_title": "NDRF / MHA Early Warning System",
      "command_center": "Command Center",
      "citizen_app": "Citizen Alert App",
      "your_location": "Your Location Status",
      "risk_watch": "WATCH / NORMAL",
      "risk_advisory": "ADVISORY / ELEVATED",
      "risk_warning": "WARNING / HIGH RISK",
      "risk_evacuate": "EVACUATE IMMEDIATELY",
      "nearest_shelter": "Nearest Relief Shelter",
      "evacuation_steps": "Evacuation Procedure Steps",
      "report_condition": "Report Ground Condition",
      "submit_report": "Submit Field Observation",
      "sensor_health": "IoT Sensor Network Mesh",
      "manual_dispatch": "Issue Manual Alert",
      "language": "Language"
    }
  },
  hi: {
    translation: {
      "system_title": "एनडीआरएफ / गृह मंत्रालय चेतावनी प्रणाली",
      "command_center": "कमांड सेंटर",
      "citizen_app": "नागरिक अलर्ट ऐप",
      "your_location": "आपकी स्थिति",
      "risk_watch": "सामान्य निगरानी",
      "risk_advisory": "सलाह / सतर्क रहें",
      "risk_warning": "चेतावनी / उच्च जोखिम",
      "risk_evacuate": "तुरंत खाली करें (निकासी)",
      "nearest_shelter": "निकटतम राहत शिविर",
      "evacuation_steps": "निकासी के चरण",
      "report_condition": "स्थानीय स्थिति की रिपोर्ट करें",
      "submit_report": "रिपोर्ट भेजें",
      "sensor_health": "आईओटी सेंसर नेटवर्क",
      "manual_dispatch": "मैनुअल अलर्ट जारी करें",
      "language": "भाषा"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
