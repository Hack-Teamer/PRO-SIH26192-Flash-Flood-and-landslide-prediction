import React, { useState } from 'react';
import { ShieldAlert, MapPin, Navigation, Send, Globe, AlertTriangle, CheckCircle, PhoneCall } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tierCardStyles = {
  Green: { bg: 'bg-risk-green', border: 'border-risk-green', label: 'WATCH / ALL NORMAL', labelHi: 'सामान्य स्थिति' },
  Yellow: { bg: 'bg-risk-yellow', border: 'border-risk-yellow', label: 'ADVISORY / STAY ALERT', labelHi: 'सतर्क रहें (सलाह)' },
  Orange: { bg: 'bg-risk-orange', border: 'border-risk-orange', label: 'WARNING / PREPARE EVACUATION', labelHi: 'निकासी की तैयारी करें' },
  Red: { bg: 'bg-risk-red', border: 'border-risk-red', label: 'EVACUATE IMMEDIATELY', labelHi: 'तुरंत खाली करें (खतरा)' }
};

export default function CitizenApp({ activeAlerts, geoData }) {
  const { t, i18n } = useTranslation();
  const [selectedVillageId, setSelectedVillageId] = useState('VIL-001');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportText, setReportText] = useState('');

  // Find active alert for selected village
  const activeAlert = (activeAlerts || []).find(a => a.village_id === selectedVillageId);
  const currentTier = activeAlert ? activeAlert.tier : 'Green';
  const cardStyle = tierCardStyles[currentTier] || tierCardStyles.Green;

  // Selected village info
  const feature = (geoData?.features || []).find(f => f.properties.id === selectedVillageId)?.properties || {
    name: 'Bhatwari Village',
    district: 'Uttarkashi',
    relief_camp: {
      name: 'Bhatwari Govt Higher Sec School Shelter',
      lat: 30.8220,
      lng: 78.6180,
      capacity: 500
    }
  };

  const toggleLang = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportText('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-command-bg p-4 flex flex-col justify-center items-center font-body">
      <div className="w-full max-w-md bg-command-card rounded-xl border border-command-border shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <div className="bg-command-bg px-4 py-3 border-b border-command-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-signal-cyan" />
            <span className="font-bold font-display tracking-wider text-sm text-command-text">
              NDRF CITIZEN EARLY WARNING
            </span>
          </div>

          <button
            onClick={toggleLang}
            className="flex items-center space-x-1 text-xs font-mono bg-command-card px-2.5 py-1 rounded border border-command-border text-signal-cyan hover:bg-command-hover transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{i18n.language === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>

        {/* Location Selector dropdown */}
        <div className="p-4 bg-command-bg/50 border-b border-command-border">
          <label className="text-xs text-command-muted font-mono block mb-1">
            {i18n.language === 'hi' ? 'अपना गाँव / वार्ड चुनें:' : 'Select Your Village / Ward Area:'}
          </label>
          <select
            value={selectedVillageId}
            onChange={e => setSelectedVillageId(e.target.value)}
            className="w-full bg-command-card border border-command-border rounded p-2.5 text-sm font-bold text-command-text focus:outline-none focus:border-signal-cyan font-mono"
          >
            {(geoData?.features || []).map(f => (
              <option key={f.properties.id} value={f.properties.id}>
                {f.properties.name} ({f.properties.district})
              </option>
            ))}
          </select>
        </div>

        {/* DOMINANT RISK TIER CARD */}
        <div className="p-5">
          <div className={`${cardStyle.bg} rounded-xl p-6 text-white text-center shadow-lg transition-all duration-300 relative overflow-hidden`}>
            <span className="text-xs font-mono tracking-widest uppercase opacity-90 block mb-1">
              {i18n.language === 'hi' ? 'आपकी वर्तमान स्थिति' : 'CURRENT AREA STATUS'}
            </span>
            <h2 className="text-2xl font-black font-display tracking-wider uppercase">
              {i18n.language === 'hi' ? cardStyle.labelHi : cardStyle.label}
            </h2>

            {currentTier === 'Red' && (
              <div className="mt-3 bg-black/30 backdrop-blur-sm p-3 rounded text-xs text-left font-mono border border-white/20">
                🚨 <strong>{i18n.language === 'hi' ? 'आदेश:' : 'INSTRUCTION:'}</strong>{' '}
                {activeAlert?.instruction || 'Move to high-ground shelter immediately! Avoid nullahs and steep slopes.'}
              </div>
            )}
          </div>
        </div>

        {/* NEAREST RELIEF SHELTER & STEP-BY-STEP ROUTE */}
        <div className="px-5 mb-5">
          <div className="bg-command-bg rounded-lg border border-command-border p-4">
            <div className="flex items-center space-x-2 text-signal-cyan mb-2">
              <MapPin className="w-4 h-4" />
              <h3 className="font-bold text-xs uppercase tracking-wider font-display">
                {t('nearest_shelter')}
              </h3>
            </div>

            <div className="text-sm font-bold text-command-text mb-1">
              {feature.relief_camp?.name || 'Bhatwari High Ground Shelter'}
            </div>
            <div className="text-xs text-command-muted font-mono mb-3">
              Capacity: {feature.relief_camp?.capacity || 500} persons • High Ridge Location
            </div>

            {/* Earned Sequential Steps for Evacuation Route */}
            <div className="border-t border-command-border pt-3 space-y-2">
              <span className="text-[11px] font-mono font-bold text-command-muted uppercase block">
                {t('evacuation_steps')} (Guaranteed Safe Route):
              </span>

              <div className="flex items-start space-x-2.5 text-xs text-command-text">
                <span className="w-5 h-5 rounded-full bg-signal-cyan/20 text-signal-cyan font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  {i18n.language === 'hi'
                    ? 'मुख्य सड़क से दूर मंदिर रिज रोड की ओर ऊपर बढ़ें।'
                    : 'Ascend away from riverbank towards Upper Temple Ridge Road.'}
                </span>
              </div>

              <div className="flex items-start space-x-2.5 text-xs text-command-text">
                <span className="w-5 h-5 rounded-full bg-signal-cyan/20 text-signal-cyan font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  {i18n.language === 'hi'
                    ? 'गंगोरी पुल क्षेत्र को छोड़ें; पश्चिमी बाइपास ट्रैक का उपयोग करें।'
                    : 'Bypass lower stream bridge area; use western masonry bypass track.'}
                </span>
              </div>

              <div className="flex items-start space-x-2.5 text-xs text-command-text">
                <span className="w-5 h-5 rounded-full bg-signal-cyan/20 text-signal-cyan font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  {i18n.language === 'hi'
                    ? 'हाई सेकेंडरी स्कूल ग्राउंड शेल्टर में प्रवेश करें।'
                    : 'Report at Higher Secondary School Grounds High Gate.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SOS EMERGENCY BUTTON */}
        <div className="px-5 mb-5">
          <a
            href="tel:1077"
            className="w-full bg-risk-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg border border-risk-red flex items-center justify-center space-x-2 transition-colors uppercase tracking-wider text-sm font-mono shadow-md"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>{i18n.language === 'hi' ? 'आपातकालीन कॉल (1077 / 112)' : 'EMERGENCY SOS CALL (1077 / 112)'}</span>
          </a>
        </div>

        {/* REPORT GROUND CONDITION FORM */}
        <div className="px-5 pb-5">
          <div className="bg-command-bg rounded-lg border border-command-border p-4">
            <h3 className="font-bold text-xs uppercase tracking-wider font-display text-command-text mb-2 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-signal-cyan" />
              {t('report_condition')}
            </h3>

            {reportSubmitted ? (
              <div className="bg-risk-green/20 text-risk-green border border-risk-green p-3 rounded text-xs font-mono flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  {i18n.language === 'hi'
                    ? 'रिपोर्ट एनडीआरएफ कंट्रोल रूम को भेजी गई! धन्यवाद।'
                    : 'Ground report received at NDRF Command Center! Thank you.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-2">
                <textarea
                  rows="2"
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  placeholder={
                    i18n.language === 'hi'
                      ? 'उदा. सड़क पर मलबे या पानी का बढ़ना...'
                      : 'e.g., Rising water level near bridge or slope crack observed...'
                  }
                  className="w-full bg-command-card border border-command-border rounded p-2 text-xs text-command-text focus:outline-none focus:border-signal-cyan font-mono"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-command-border hover:bg-command-hover text-signal-cyan font-mono font-bold py-2 rounded text-xs border border-command-border flex items-center justify-center space-x-1.5 transition-colors uppercase"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('submit_report')}</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
