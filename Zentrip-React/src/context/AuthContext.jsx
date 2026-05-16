import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, reload, signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { getUserProfile } from '../services/profileService';
import { clearSessionExpiry } from '../components/auth/login/services/loginFirebaseService';

const AuthContext = createContext(null);

function mapProfile(data) {
  const firstName = data?.firstName || '';
  const lastName = data?.lastName || '';
  const phone = data?.phone || '';
  const country = data?.country || '';
  const language = data?.language || 'Español';
  const currency = data?.currency || 'EUR €';
  const profilePhoto = data?.profilePhoto || '';

  const normalizeTripGroupType = (value) => {
    const normalized = String(value || '').toLowerCase().trim();
    if (normalized === 'solo') return 'solo';
    if (normalized === 'group') return 'group';
    return 'both';
  };

  const tripGroupType = normalizeTripGroupType(data?.tripGroupType);

  return {
    firstName,
    lastName,
    username: data?.username || '',
    bio: data?.bio || '',
    phone,
    country,
    language,
    currency,
    profilePhoto,
    avatarColor: data?.avatarColor || '',
    tripGroupType,
    petFriendly: data?.petFriendly || false,
    isProfileComplete: Boolean(data?.isProfileComplete),
    displayName: `${firstName} ${lastName}`.trim(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const doLogout = useCallback(async () => {
    clearSessionExpiry();
    await signOut(auth);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async (firebaseUser = user) => {
    if (!firebaseUser?.uid) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const data = await getUserProfile(firebaseUser.uid);
      setProfile(mapProfile(data));
    } catch {
      setProfile(mapProfile(null));
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const syncAuthState = async () => {
        if (!firebaseUser) {
          if (isMounted) {
            setUser(null);
            setAuthLoading(false);
          }
          return;
        }

        try {
          await reload(firebaseUser);
        } catch {
          // Si falla la recarga por red, mantener el usuario actual para no bloquear la sesión.
        }

        if (isMounted) {
          setUser(auth.currentUser || firebaseUser);
          setAuthLoading(false);
        }
      };

      syncAuthState();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    refreshProfile(user);
  }, [authLoading, user?.uid]);

  const value = useMemo(
    () => ({
      user,
      profile,
      authLoading,
      profileLoading,
      loading: authLoading || profileLoading,
      setProfile,
      refreshProfile,
      logout: doLogout,
    }),
    [user, profile, authLoading, profileLoading, refreshProfile, doLogout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
