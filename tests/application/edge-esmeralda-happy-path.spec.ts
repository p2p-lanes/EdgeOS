import { test, expect } from '@playwright/test';
import { applicationSelectors, getDynamicSelectors } from '../selectors/applicationSelectors';
import { authenticateAsApplicationUser } from '../utils/auth';

test.describe('Edge Esmeralda Application Form - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate the user before each test
    await authenticateAsApplicationUser(page);
    
    // Navigate to the Edge Esmeralda application form
    await page.goto('/portal/edge-esmeralda/application');
    
    // Wait for the form to load
    await expect(page.locator(applicationSelectors.page.container)).toBeVisible();
    await expect(page.locator(applicationSelectors.page.form)).toBeVisible();
  });

  test('should complete and submit the full application form successfully', async ({ page }) => {
    // Wait for form to be ready
    await expect(page.locator(applicationSelectors.page.form)).toBeVisible();

    // Fill Personal Information Section
    await fillPersonalInformation(page);
    
    // Fill Professional Details Section
    await fillProfessionalDetails(page);
    
    // Fill Participation Section
    await fillParticipationSection(page);
    
    // Fill Children and Plus Ones Section
    await fillChildrenPlusOnesSection(page);
    
    // Fill Scholarship Section
    await fillScholarshipSection(page);
    
    // Submit the form
    await submitForm(page);
    
    // Verify successful submission (adjust based on your success page/behavior)
    await expect(page.locator(applicationSelectors.actions.submitButton)).not.toBeVisible();
  });

  async function fillPersonalInformation(page: any) {
    // First Name
    await page.fill(applicationSelectors.personalInformation.firstName, 'John');
    
    // Last Name
    await page.fill(applicationSelectors.personalInformation.lastName, 'Doe');
    
    // Telegram
    await page.fill(applicationSelectors.personalInformation.telegram, '@johndoe');
    
    // Residence
    await page.fill(applicationSelectors.personalInformation.residence, 'New York, USA');
    
    // ETH Address
    await page.fill(applicationSelectors.personalInformation.ethAddress, '0x1234567890123456789012345678901234567890');
    
    // Referral
    await page.fill(applicationSelectors.personalInformation.referral, 'Friend recommendation');
    
    // Gender
    await page.selectOption(applicationSelectors.personalInformation.gender, 'Male');
    
    // Age
    await page.selectOption(applicationSelectors.personalInformation.age, '25-30');
    
    // Local Resident
    await page.selectOption(applicationSelectors.personalInformation.localResident, 'No');
    
    // Info Not Shared (Multi-select)
    await page.click(applicationSelectors.personalInformation.infoNotShared);
    await page.click('[data-testid="personal-info-not-shared-multiselect-option-First name"]');
    await page.click('[data-testid="personal-info-not-shared-multiselect-option-Email address"]');
  }

  async function fillProfessionalDetails(page: any) {
    // Organization
    await page.fill(applicationSelectors.professionalDetails.organization, 'Tech Corp');
    
    // Role
    await page.fill(applicationSelectors.professionalDetails.role, 'Software Engineer');
    
    // Social Media
    await page.fill(applicationSelectors.professionalDetails.socialMedia, '@johndoe_twitter');
    
    // GitHub Profile
    await page.fill(applicationSelectors.professionalDetails.githubProfile, 'github.com/johndoe');
    
    // Area of Expertise
    await page.fill(applicationSelectors.professionalDetails.areaOfExpertise, 'Full-stack development, Blockchain');
  }

  async function fillParticipationSection(page: any) {
    // Duration - Select full length participation
    await page.check(applicationSelectors.participation.durationFullLengthCheckbox);
    
    // Builder checkbox
    await page.check(applicationSelectors.participation.builderCheckbox);
    
    // Builder description
    await page.fill(applicationSelectors.participation.builderDescription, 'I plan to build a decentralized voting system for community governance.');
    
    // Hackathon interest
    await page.check(applicationSelectors.participation.hackathonInterest);
    
    // Investor checkbox
    await page.check(applicationSelectors.participation.investor);
    
    // Video URL
    await page.fill(applicationSelectors.participation.videoUrl, 'https://youtube.com/watch?v=example');
    
    // Personal Goals
    await page.fill(applicationSelectors.participation.personalGoals, 'I want to learn about decentralized governance and contribute to the community.');
    
    // Host Session
    await page.fill(applicationSelectors.participation.hostSession, 'I would like to host a session about smart contract security.');
  }

  async function fillChildrenPlusOnesSection(page: any) {
    // Spouse checkbox
    await page.check(applicationSelectors.childrenPlusOnes.spouseCheckbox);
    
    // Spouse info
    await page.fill(applicationSelectors.childrenPlusOnes.spouseInfo, 'Jane Doe');
    
    // Spouse email
    await page.fill(applicationSelectors.childrenPlusOnes.spouseEmail, 'jane.doe@example.com');
    
    // Kids checkbox
    await page.check(applicationSelectors.childrenPlusOnes.kidsCheckbox);
    
    // Add a kid
    await page.click(applicationSelectors.childrenPlusOnes.addKidButton);
    
    // Fill kid modal
    await page.fill(applicationSelectors.childrenPlusOnes.kidModalNameInput, 'Little John');
    await page.selectOption(applicationSelectors.childrenPlusOnes.kidModalAgeSelect, '5-10');
    await page.click(applicationSelectors.childrenPlusOnes.kidModalAddButton);
  }

  async function fillScholarshipSection(page: any) {
    // Scholarship request checkbox
    await page.check(applicationSelectors.scholarship.scholarshipRequestCheckbox);
    
    // Payment capacity
    await page.selectOption(applicationSelectors.scholarship.paymentCapacity, '1000-2000 USD');
    
    // Scholarship video URL
    await page.fill(applicationSelectors.scholarship.videoUrl, 'https://youtube.com/watch?v=scholarship-video');
    
    // Scholarship details
    await page.fill(applicationSelectors.scholarship.details, 'I am a student and would greatly benefit from financial assistance to attend this event.');
  }

  async function submitForm(page: any) {
    // Wait for form to be ready for submission
    await page.waitForSelector(applicationSelectors.actions.submitButton);
    
    // Click submit button
    await page.click(applicationSelectors.actions.submitButton);
    
    // Wait for submission to complete (adjust timeout as needed)
    await page.waitForTimeout(3000);
  }
});
