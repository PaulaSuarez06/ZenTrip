import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditProfileController } from './hooks/useEditProfileController';
import EditProfileLeftPanel from './components/EditProfileLeftPanel';
import EditProfileForm from './components/EditProfileForm';
import SplashScreen from '../shared/SplashScreen';

const heroImg = '/img/background/editProfile/editProfile.jpeg';
const logoImg = '/img/logo/logo-sin-texto-png.png';

export default function EditProfile({ isOnboarding = false }) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const {
    user,
    loading,
    saving,
    success,
    error,
    fieldErrors,
    form,
    activeSection,
    hasSavedOnce,
    setActiveSection,
    handleChange,
    handleSave,
    handleClose,
    setForm,
  } = useEditProfileController(navigate);

  if (loading) {
    return (
      <div className="h-dvh flex items-center justify-center bg-brand-white">
        <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-dvh flex items-center justify-center bg-brand-white">
        <p className="body text-slate-500">Debes iniciar sesión para editar tu perfil.</p>
      </div>
    );
  }

  return (
    <>
      <img src={heroImg} style={{ display: 'none' }} onLoad={() => setImageLoaded(true)} />
      {!imageLoaded && <SplashScreen />}
      {imageLoaded && (
        <div className="md:min-h-screen flex flex-col items-center pt-6 bg-slate-50 px-4 overflow-y-auto">
          <div className="w-full max-w-5xl grid md:grid-cols-2 md:rounded-2xl md:shadow-[0_0_18px_rgba(15,23,42,0.30)] md:overflow-hidden">
            <EditProfileLeftPanel
              heroImg={heroImg}
              logoImg={logoImg}
              usuario={user}
              form={form}
              setForm={setForm}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
            <EditProfileForm
              activeSection={activeSection}
              form={form}
              fieldErrors={fieldErrors}
              error={error}
              success={success}
              saving={saving}
              isOnboarding={isOnboarding}
              hasSavedOnce={hasSavedOnce}
              onChange={handleChange}
              onSave={handleSave}
              onClose={handleClose}
              setForm={setForm}
            />
          </div>
        </div>
      )}
    </>
  );
}
