/**
 * Application Form Test Selectors
 * 
 * Organized by form sections for better maintainability and clarity.
 * Each section contains all interactive elements (inputs, selects, buttons, etc.)
 * that can be targeted for testing.
 */

export const applicationSelectors = {
  // Main Application Page Elements
  page: {
    container: '[data-testid="application-page-container"]',
    form: '[data-testid="application-form"]',
    loadingSpinner: '[data-testid="application-loading"]'
  },

  // Form Header Section
  header: {
    container: '[data-testid="form-header-container"]',
    cityImage: '[data-testid="form-header-city-image"]',
    cityName: '[data-testid="form-header-city-name"]',
    tagline: '[data-testid="form-header-tagline"]',
    location: '[data-testid="form-header-location"]',
    dates: '[data-testid="form-header-dates"]',
    instructions: '[data-testid="form-header-instructions"]'
  },

  // Existing Application Card (Modal)
  existingApplicationCard: {
    modal: '[data-testid="existing-application-modal"]',
    title: '[data-testid="existing-application-title"]',
    description: '[data-testid="existing-application-description"]',
    applicantName: '[data-testid="existing-application-applicant-name"]',
    email: '[data-testid="existing-application-email"]',
    popupCity: '[data-testid="existing-application-popup-city"]',
    importButton: '[data-testid="existing-application-import-btn"]',
    cancelButton: '[data-testid="existing-application-cancel-btn"]'
  },

  // Personal Information Form Section
  personalInformation: {
    section: '[data-testid="personal-information-section"]',
    title: '[data-testid="personal-information-title"]',
    subtitle: '[data-testid="personal-information-subtitle"]',
    
    // Input Fields
    firstName: '[data-testid="personal-info-first-name-input"]',
    lastName: '[data-testid="personal-info-last-name-input"]',
    email: '[data-testid="personal-info-email-input"]',
    telegram: '[data-testid="personal-info-telegram-input"]',
    residence: '[data-testid="personal-info-residence-input"]',
    referral: '[data-testid="personal-info-referral-input"]',
    ethAddress: '[data-testid="personal-info-eth-address-input"]',
    
    // Select Fields
    gender: '[data-testid="personal-info-gender-select"]',
    genderSpecify: '[data-testid="personal-info-gender-specify-input"]',
    age: '[data-testid="personal-info-age-select"]',
    localResident: '[data-testid="personal-info-local-resident-select"]',
    
    // Multi-select and complex fields
    infoNotShared: '[data-testid="personal-info-not-shared-multiselect"]'
  },

  // Professional Details Form Section
  professionalDetails: {
    section: '[data-testid="professional-details-section"]',
    title: '[data-testid="professional-details-title"]',
    subtitle: '[data-testid="professional-details-subtitle"]',
    
    organization: '[data-testid="professional-details-organization-input"]',
    role: '[data-testid="professional-details-role-input"]',
    socialMedia: '[data-testid="professional-details-social-media-input"]',
    githubProfile: '[data-testid="professional-details-github-input"]',
    areaOfExpertise: '[data-testid="professional-details-expertise-input"]'
  },

  // Participation Form Section
  participation: {
    section: '[data-testid="participation-section"]',
    title: '[data-testid="participation-title"]',
    subtitle: '[data-testid="participation-subtitle"]',
    
    // Duration fields (radio group or checkbox depending on city)
    durationRadioGroup: '[data-testid="participation-duration-radio-group"]',
    durationFullLengthCheckbox: '[data-testid="participation-duration-checkbox"]',
    
    // Builder section
    builderCheckbox: '[data-testid="participation-builder-checkbox"]',
    builderDescription: '[data-testid="participation-builder-description-textarea"]',
    
    // Other checkboxes
    hackathonInterest: '[data-testid="participation-hackathon-checkbox"]',
    investor: '[data-testid="participation-investor-checkbox"]',
    
    // Video and text areas
    videoCard: '[data-testid="participation-video-card"]',
    videoUrl: '[data-testid="participation-video-url-input"]',
    personalGoals: '[data-testid="participation-personal-goals-textarea"]',
    hostSession: '[data-testid="participation-host-session-textarea"]'
  },

  // Children and Plus Ones Form Section
  childrenPlusOnes: {
    section: '[data-testid="children-plus-ones-section"]',
    title: '[data-testid="children-plus-ones-title"]',
    
    // Spouse section
    spouseCheckbox: '[data-testid="children-spouse-checkbox"]',
    spouseInfo: '[data-testid="children-spouse-info-input"]',
    spouseEmail: '[data-testid="children-spouse-email-input"]',
    
    // Kids section
    kidsCheckbox: '[data-testid="children-kids-checkbox"]',
    addKidButton: '[data-testid="children-add-kid-btn"]',
    
    // Kid modal elements
    kidModal: '[data-testid="children-kid-modal"]',
    kidModalNameInput: '[data-testid="children-kid-modal-name-input"]',
    kidModalAgeSelect: '[data-testid="children-kid-modal-age-select"]',
    kidModalAddButton: '[data-testid="children-kid-modal-add-btn"]',
    kidModalCancelButton: '[data-testid="children-kid-modal-cancel-btn"]',
    
    // Kid list items
    kidListItem: '[data-testid^="children-kid-item-"]', // Dynamic ID for each kid
    kidRemoveButton: '[data-testid^="children-kid-remove-btn-"]' // Dynamic ID for remove buttons
  },

  // Scholarship Form Section
  scholarship: {
    section: '[data-testid="scholarship-section"]',
    title: '[data-testid="scholarship-title"]',
    subtitle: '[data-testid="scholarship-subtitle"]',
    
    scholarshipRequestCheckbox: '[data-testid="scholarship-request-checkbox"]',
    paymentCapacity: '[data-testid="scholarship-payment-capacity-select"]',
    videoUrl: '[data-testid="scholarship-video-url-input"]',
    details: '[data-testid="scholarship-details-textarea"]',
    volunteerInfo: '[data-testid="scholarship-volunteer-info"]'
  },

  // Accommodation Form Section
  accommodation: {
    section: '[data-testid="accommodation-section"]',
    title: '[data-testid="accommodation-section-title"]',
    subtitle: '[data-testid="accommodation-section-subtitle"]',
    
    isRenterCheckbox: '[data-testid="accommodation-is-renter-checkbox"]',
    bookingConfirmationUpload: '[data-testid="accommodation-booking-confirmation-upload"]',
    bookingConfirmationButton: '[data-testid="accommodation-booking-confirmation-upload-button"]'
  },

  // Patagonia Residencies Form Section
  patagoniaResidencies: {
    section: '[data-testid="patagonia-residencies-section"]',
    title: '[data-testid="patagonia-residencies-section-title"]',
    subtitle: '[data-testid="patagonia-residencies-section-subtitle"]',
    
    descriptionTextarea: '[data-testid="patagonia-residencies-description-textarea"]',
    findResidenciesLink: '[data-testid="patagonia-residencies-find-link"]',
    submitProposalLink: '[data-testid="patagonia-residencies-submit-link"]'
  },

  // Progress Bar
  progressBar: {
    container: '[data-testid="progress-bar-container"]',
    bar: '[data-testid="progress-bar"]',
    percentage: '[data-testid="progress-percentage"]'
  },

  // Form Actions (Submit/Draft buttons)
  actions: {
    container: '[data-testid="form-actions-container"]',
    saveDraftButton: '[data-testid="form-save-draft-btn"]',
    submitButton: '[data-testid="form-submit-btn"]'
  },

  // Section Separators
  sectionSeparator: '[data-testid="section-separator"]',

  // Common Error Messages
  errorMessages: {
    fieldError: '[data-testid^="field-error-"]', // Dynamic ID for field-specific errors
    formError: '[data-testid="form-error-message"]'
  }
};

// Helper functions for dynamic selectors
export const getDynamicSelectors = {
  kidItem: (kidId: string) => `[data-testid="children-kid-item-${kidId}"]`,
  kidRemoveButton: (kidId: string) => `[data-testid="children-kid-remove-btn-${kidId}"]`,
  fieldError: (fieldName: string) => `[data-testid="field-error-${fieldName}"]`,
  formSection: (sectionName: string) => `[data-testid="${sectionName}-section"]`
};

export default applicationSelectors;
