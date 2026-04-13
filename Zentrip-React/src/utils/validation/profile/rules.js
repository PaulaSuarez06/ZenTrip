export const profileValidationMessages = {
  requiredFirstName: 'El nombre es obligatorio.',
  requiredLastName: 'Los apellidos son obligatorios.',
  requiredUsername: 'El nombre de usuario es obligatorio.',
  invalidPhone: 'El teléfono no tiene un formato válido.',
  invalidProfilePhoto: 'La URL de la foto debe comenzar con http o https.',
};

export function validateProfileForm(form) {
  const errors = {};

  if (!form.firstName?.trim()) {
    errors.firstName = profileValidationMessages.requiredFirstName;
  }

  if (!form.lastName?.trim()) {
    errors.lastName = profileValidationMessages.requiredLastName;
  }

  if (!form.username?.trim()) {
    errors.username = profileValidationMessages.requiredUsername;
  }

  if (form.phone && !/^\+?[\d\s\-().]{7,20}$/.test(form.phone.trim())) {
    errors.phone = profileValidationMessages.invalidPhone;
  }

  if (form.profilePhoto && !/^https?:\/\/.+/.test(form.profilePhoto.trim())) {
    errors.profilePhoto = profileValidationMessages.invalidProfilePhoto;
  }

  return errors;
}
