import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        close: 'Close',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
      },
      
      // Authentication
      auth: {
        signIn: 'Sign In',
        signUp: 'Sign Up',
        signOut: 'Sign Out',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember Me',
        signInWithGoogle: 'Sign in with Google',
        signInWithOTP: 'Sign in with OTP',
        sendOTP: 'Send OTP',
        verifyOTP: 'Verify OTP',
        enterOTP: 'Enter OTP',
        otpSent: 'OTP sent to your email',
        invalidCredentials: 'Invalid credentials',
        accountCreated: 'Account created successfully',
        welcomeMessage: 'Welcome to Newhill Spices!',
      },
      
      // User Roles
      roles: {
        admin: 'Administrator',
        b2b: 'Business Customer',
        b2c: 'Individual Customer',
      },
      
      // B2B Application
      b2bApplication: {
        title: 'B2B Account Application',
        businessInfo: 'Business Information',
        businessName: 'Business Name',
        businessType: 'Business Type',
        gstVatNumber: 'GST/VAT Number',
        taxId: 'Tax ID',
        businessAddress: 'Business Address',
        contactInfo: 'Contact Information',
        contactPerson: 'Contact Person',
        contactPhone: 'Phone Number',
        website: 'Website',
        expectedVolume: 'Expected Monthly Volume',
        submitApplication: 'Submit Application',
        applicationSubmitted: 'Application submitted successfully',
        applicationExists: 'B2B application already exists',
        benefits: {
          title: 'B2B Account Benefits',
          bulkDiscounts: 'Bulk order discounts',
          noWeightLimit: 'No weight limits',
          prioritySupport: 'Priority support',
          taxBenefits: 'Business tax benefits',
          accountManager: 'Dedicated account manager',
        },
      },
      
      // Order Limits
      orderLimits: {
        weightLimitExceeded: 'Order Weight Limit Exceeded',
        b2cLimit: 'Your order weight exceeds the B2C limit of 5 kg',
        upgradePrompt: 'To place larger orders, you need to upgrade to a B2B account',
        applyForB2B: 'Apply for B2B Account',
        cancelOrder: 'Cancel Order',
      },
      
      // Profile
      profile: {
        title: 'Profile',
        personalInfo: 'Personal Information',
        firstName: 'First Name',
        lastName: 'Last Name',
        phone: 'Phone Number',
        address: 'Address',
        city: 'City',
        state: 'State',
        country: 'Country',
        postalCode: 'Postal Code',
        preferences: 'Preferences',
        language: 'Language',
        currency: 'Currency',
        dateOfBirth: 'Date of Birth',
        updateProfile: 'Update Profile',
        profileUpdated: 'Profile updated successfully',
      },
      
      // Admin Dashboard
      admin: {
        dashboard: 'Admin Dashboard',
        users: 'Users',
        orders: 'Orders',
        products: 'Products',
        auditLogs: 'Audit Logs',
        b2bApplications: 'B2B Applications',
        metrics: 'Metrics',
        totalUsers: 'Total Users',
        totalOrders: 'Total Orders',
        totalRevenue: 'Total Revenue',
        pendingApplications: 'Pending Applications',
      },
      
      // Error Messages
      errors: {
        required: 'This field is required',
        invalidEmail: 'Invalid email address',
        passwordTooShort: 'Password must be at least 6 characters',
        passwordsDoNotMatch: 'Passwords do not match',
        invalidOTP: 'Invalid OTP',
        otpExpired: 'OTP has expired',
        userNotFound: 'User not found',
        unauthorized: 'Unauthorized access',
        forbidden: 'Access forbidden',
        notFound: 'Resource not found',
        serverError: 'Internal server error',
      },
    },
  },
  
  es: {
    translation: {
      // Common
      common: {
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        success: 'Éxito',
        cancel: 'Cancelar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        back: 'Atrás',
        next: 'Siguiente',
        previous: 'Anterior',
        submit: 'Enviar',
        close: 'Cerrar',
        confirm: 'Confirmar',
        yes: 'Sí',
        no: 'No',
      },
      
      // Authentication
      auth: {
        signIn: 'Iniciar Sesión',
        signUp: 'Registrarse',
        signOut: 'Cerrar Sesión',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        forgotPassword: '¿Olvidaste tu contraseña?',
        rememberMe: 'Recordarme',
        signInWithGoogle: 'Iniciar sesión con Google',
        signInWithOTP: 'Iniciar sesión con OTP',
        sendOTP: 'Enviar OTP',
        verifyOTP: 'Verificar OTP',
        enterOTP: 'Ingresar OTP',
        otpSent: 'OTP enviado a tu correo',
        invalidCredentials: 'Credenciales inválidas',
        accountCreated: 'Cuenta creada exitosamente',
        welcomeMessage: '¡Bienvenido a Newhill Spices!',
      },
      
      // User Roles
      roles: {
        admin: 'Administrador',
        b2b: 'Cliente Empresarial',
        b2c: 'Cliente Individual',
      },
      
      // B2B Application
      b2bApplication: {
        title: 'Solicitud de Cuenta B2B',
        businessInfo: 'Información de la Empresa',
        businessName: 'Nombre de la Empresa',
        businessType: 'Tipo de Empresa',
        gstVatNumber: 'Número de GST/IVA',
        taxId: 'ID Fiscal',
        businessAddress: 'Dirección de la Empresa',
        contactInfo: 'Información de Contacto',
        contactPerson: 'Persona de Contacto',
        contactPhone: 'Número de Teléfono',
        website: 'Sitio Web',
        expectedVolume: 'Volumen Mensual Esperado',
        submitApplication: 'Enviar Solicitud',
        applicationSubmitted: 'Solicitud enviada exitosamente',
        applicationExists: 'Ya existe una solicitud B2B',
        benefits: {
          title: 'Beneficios de Cuenta B2B',
          bulkDiscounts: 'Descuentos por volumen',
          noWeightLimit: 'Sin límites de peso',
          prioritySupport: 'Soporte prioritario',
          taxBenefits: 'Beneficios fiscales empresariales',
          accountManager: 'Gerente de cuenta dedicado',
        },
      },
      
      // Order Limits
      orderLimits: {
        weightLimitExceeded: 'Límite de Peso de Pedido Excedido',
        b2cLimit: 'El peso de tu pedido excede el límite B2C de 5 kg',
        upgradePrompt: 'Para realizar pedidos más grandes, necesitas actualizar a una cuenta B2B',
        applyForB2B: 'Solicitar Cuenta B2B',
        cancelOrder: 'Cancelar Pedido',
      },
      
      // Profile
      profile: {
        title: 'Perfil',
        personalInfo: 'Información Personal',
        firstName: 'Nombre',
        lastName: 'Apellido',
        phone: 'Número de Teléfono',
        address: 'Dirección',
        city: 'Ciudad',
        state: 'Estado',
        country: 'País',
        postalCode: 'Código Postal',
        preferences: 'Preferencias',
        language: 'Idioma',
        currency: 'Moneda',
        dateOfBirth: 'Fecha de Nacimiento',
        updateProfile: 'Actualizar Perfil',
        profileUpdated: 'Perfil actualizado exitosamente',
      },
      
      // Admin Dashboard
      admin: {
        dashboard: 'Panel de Administración',
        users: 'Usuarios',
        orders: 'Pedidos',
        products: 'Productos',
        auditLogs: 'Registros de Auditoría',
        b2bApplications: 'Solicitudes B2B',
        metrics: 'Métricas',
        totalUsers: 'Total de Usuarios',
        totalOrders: 'Total de Pedidos',
        totalRevenue: 'Ingresos Totales',
        pendingApplications: 'Solicitudes Pendientes',
      },
      
      // Error Messages
      errors: {
        required: 'Este campo es requerido',
        invalidEmail: 'Dirección de correo inválida',
        passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
        passwordsDoNotMatch: 'Las contraseñas no coinciden',
        invalidOTP: 'OTP inválido',
        otpExpired: 'OTP ha expirado',
        userNotFound: 'Usuario no encontrado',
        unauthorized: 'Acceso no autorizado',
        forbidden: 'Acceso prohibido',
        notFound: 'Recurso no encontrado',
        serverError: 'Error interno del servidor',
      },
    },
  },
  
  fr: {
    translation: {
      // Common
      common: {
        loading: 'Chargement...',
        error: 'Une erreur s\'est produite',
        success: 'Succès',
        cancel: 'Annuler',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        submit: 'Soumettre',
        close: 'Fermer',
        confirm: 'Confirmer',
        yes: 'Oui',
        no: 'Non',
      },
      
      // Authentication
      auth: {
        signIn: 'Se Connecter',
        signUp: 'S\'inscrire',
        signOut: 'Se Déconnecter',
        email: 'Email',
        password: 'Mot de Passe',
        confirmPassword: 'Confirmer le Mot de Passe',
        forgotPassword: 'Mot de passe oublié ?',
        rememberMe: 'Se souvenir de moi',
        signInWithGoogle: 'Se connecter avec Google',
        signInWithOTP: 'Se connecter avec OTP',
        sendOTP: 'Envoyer OTP',
        verifyOTP: 'Vérifier OTP',
        enterOTP: 'Entrer OTP',
        otpSent: 'OTP envoyé à votre email',
        invalidCredentials: 'Identifiants invalides',
        accountCreated: 'Compte créé avec succès',
        welcomeMessage: 'Bienvenue chez Newhill Spices !',
      },
      
      // User Roles
      roles: {
        admin: 'Administrateur',
        b2b: 'Client Entreprise',
        b2c: 'Client Individuel',
      },
      
      // B2B Application
      b2bApplication: {
        title: 'Demande de Compte B2B',
        businessInfo: 'Informations de l\'Entreprise',
        businessName: 'Nom de l\'Entreprise',
        businessType: 'Type d\'Entreprise',
        gstVatNumber: 'Numéro de TVA',
        taxId: 'ID Fiscal',
        businessAddress: 'Adresse de l\'Entreprise',
        contactInfo: 'Informations de Contact',
        contactPerson: 'Personne de Contact',
        contactPhone: 'Numéro de Téléphone',
        website: 'Site Web',
        expectedVolume: 'Volume Mensuel Attendu',
        submitApplication: 'Soumettre la Demande',
        applicationSubmitted: 'Demande soumise avec succès',
        applicationExists: 'Une demande B2B existe déjà',
        benefits: {
          title: 'Avantages du Compte B2B',
          bulkDiscounts: 'Remises sur les commandes en volume',
          noWeightLimit: 'Aucune limite de poids',
          prioritySupport: 'Support prioritaire',
          taxBenefits: 'Avantages fiscaux entreprise',
          accountManager: 'Gestionnaire de compte dédié',
        },
      },
      
      // Order Limits
      orderLimits: {
        weightLimitExceeded: 'Limite de Poids de Commande Dépassée',
        b2cLimit: 'Le poids de votre commande dépasse la limite B2C de 5 kg',
        upgradePrompt: 'Pour passer des commandes plus importantes, vous devez passer à un compte B2B',
        applyForB2B: 'Demander un Compte B2B',
        cancelOrder: 'Annuler la Commande',
      },
      
      // Profile
      profile: {
        title: 'Profil',
        personalInfo: 'Informations Personnelles',
        firstName: 'Prénom',
        lastName: 'Nom de Famille',
        phone: 'Numéro de Téléphone',
        address: 'Adresse',
        city: 'Ville',
        state: 'État',
        country: 'Pays',
        postalCode: 'Code Postal',
        preferences: 'Préférences',
        language: 'Langue',
        currency: 'Devise',
        dateOfBirth: 'Date de Naissance',
        updateProfile: 'Mettre à Jour le Profil',
        profileUpdated: 'Profil mis à jour avec succès',
      },
      
      // Admin Dashboard
      admin: {
        dashboard: 'Tableau de Bord Admin',
        users: 'Utilisateurs',
        orders: 'Commandes',
        products: 'Produits',
        auditLogs: 'Journaux d\'Audit',
        b2bApplications: 'Demandes B2B',
        metrics: 'Métriques',
        totalUsers: 'Total Utilisateurs',
        totalOrders: 'Total Commandes',
        totalRevenue: 'Revenus Totaux',
        pendingApplications: 'Demandes en Attente',
      },
      
      // Error Messages
      errors: {
        required: 'Ce champ est requis',
        invalidEmail: 'Adresse email invalide',
        passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
        passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
        invalidOTP: 'OTP invalide',
        otpExpired: 'OTP a expiré',
        userNotFound: 'Utilisateur non trouvé',
        unauthorized: 'Accès non autorisé',
        forbidden: 'Accès interdit',
        notFound: 'Ressource non trouvée',
        serverError: 'Erreur interne du serveur',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
