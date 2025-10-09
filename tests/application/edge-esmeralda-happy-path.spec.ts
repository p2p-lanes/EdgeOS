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

  // Helper function to safely fill an input field with scroll and visibility check
  async function safeFillInput(page: any, selector: string, value: string) {
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.fill(value);
  }

  // Helper function to safely check a checkbox with scroll and visibility check
  async function safeCheck(page: any, selector: string) {
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.check();
  }

  // Helper function to safely click an element with scroll and visibility check
  async function safeClick(page: any, selector: string) {
    const locator = page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    await locator.click();
  }

  // Helper function to select an option in a RadioGroup
  async function selectRadioOption(page: any, radioGroupSelector: string, optionValue: string) {
    // Scroll to radio group and make it visible
    const radioGroupLocator = page.locator(radioGroupSelector);
    await radioGroupLocator.scrollIntoViewIfNeeded();
    await radioGroupLocator.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click the specific radio button by its value (use role="radio" to avoid hidden inputs)
    const radioButton = page.locator(`${radioGroupSelector} [role="radio"][value="${optionValue}"]`);
    await radioButton.scrollIntoViewIfNeeded();
    await radioButton.click();
  }

  // Helper function to select an option in a custom Radix UI Select component
  async function selectCustomOption(page: any, triggerSelector: string, optionText: string) {
    // Scroll to trigger and make it visible
    const triggerLocator = page.locator(triggerSelector);
    await triggerLocator.scrollIntoViewIfNeeded();
    await triggerLocator.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click the trigger button to open the dropdown
    await triggerLocator.click();
    
    // Wait for the content to be visible
    await page.waitForTimeout(300);
    
    // Click the option by its text
    await page.click(`[role="option"]:has-text("${optionText}")`);
    
    // Wait for the dropdown to close
    await page.waitForTimeout(200);
  }

  test('should complete and submit the full application form successfully', async ({ page }) => {
    // Increase timeout for this test due to form complexity and scroll operations
    test.setTimeout(50000);
    
    // Wait for form to be ready
    await expect(page.locator(applicationSelectors.page.form)).toBeVisible();

    // Fill Personal Information Section
    await fillPersonalInformation(page);
    
    // Fill Professional Details Section
    await fillProfessionalDetails(page);
    
    // Fill Participation Section
    await fillParticipationSection(page);
    
    // Fill Children and Plus Ones Section
    // await fillChildrenPlusOnesSection(page);
    
    // Fill Scholarship Section
    // await fillScholarshipSection(page);
    
    // Submit the form
    await submitForm(page);
    
    // Verify successful submission (adjust based on your success page/behavior)
    await expect(page.locator(applicationSelectors.actions.submitButton)).not.toBeVisible();
  });

  async function fillPersonalInformation(page: any) {
    // First Name
    await safeFillInput(page, applicationSelectors.personalInformation.firstName, 'John');
    
    // Last Name
    await safeFillInput(page, applicationSelectors.personalInformation.lastName, 'Doe');
    
    // Telegram
    await safeFillInput(page, applicationSelectors.personalInformation.telegram, '@johndoe');
    
    // Residence
    await safeFillInput(page, applicationSelectors.personalInformation.residence, 'New York, USA');
    
    // ETH Address
    await safeFillInput(page, applicationSelectors.personalInformation.ethAddress, '0x1234567890123456789012345678901234567890');
    
    // Referral
    await safeFillInput(page, applicationSelectors.personalInformation.referral, 'Friend recommendation');
    
    // Gender - Using custom select helper
    await selectCustomOption(page, applicationSelectors.personalInformation.gender, 'Male');
    
    // Age - Using custom select helper
    await selectCustomOption(page, applicationSelectors.personalInformation.age, '25-34');
    
    // Local Resident - Using custom select helper
    await selectCustomOption(page, applicationSelectors.personalInformation.localResident, 'No');
    
    // Info Not Shared (Multi-select)
    await safeClick(page, applicationSelectors.personalInformation.infoNotShared);
  }

  async function fillProfessionalDetails(page: any) {
    // Organization
    await safeFillInput(page, applicationSelectors.professionalDetails.organization, 'Tech Corp');
    
    // Role
    await safeFillInput(page, applicationSelectors.professionalDetails.role, 'Software Engineer');
    
    // Social Media
    await safeFillInput(page, applicationSelectors.professionalDetails.socialMedia, 'https://twitter.com/johndoe');
    
    // NOTE: github_profile and area_of_expertise are not enabled for edge-esmeralda
    // These fields are not part of the form configuration for this city
  }

  async function fillParticipationSection(page: any) {
    // Duration - For Edge Esmeralda, this is a RadioGroup, not a checkbox
    // Select "full length" option from the radio group
    await selectRadioOption(page, applicationSelectors.participation.durationRadioGroup, 'full length');
    
    // Builder checkbox
    await safeCheck(page, applicationSelectors.participation.builderCheckbox);
    
    // Builder description - This appears conditionally when builder is checked
    await safeFillInput(page, applicationSelectors.participation.builderDescription, 'I plan to build a decentralized voting system for community governance.');
    
    // Hackathon interest
    await safeCheck(page, applicationSelectors.participation.hackathonInterest);
    
    // Investor checkbox
    await safeCheck(page, applicationSelectors.participation.investor);
    
    // Video URL - This is inside CardVideo component
    await safeFillInput(page, applicationSelectors.participation.videoUrl, 'https://youtube.com/watch?v=example');
    
    // Personal Goals
    await safeFillInput(page, applicationSelectors.participation.personalGoals, 'I want to learn about decentralized governance and contribute to the community.');
    
    // Host Session
    await safeFillInput(page, applicationSelectors.participation.hostSession, 'I would like to host a session about smart contract security.');
  }

  async function fillChildrenPlusOnesSection(page: any) {
    // Spouse checkbox
    await safeCheck(page, applicationSelectors.childrenPlusOnes.spouseCheckbox);
    
    // Spouse info
    await safeFillInput(page, applicationSelectors.childrenPlusOnes.spouseInfo, 'Jane Doe');
    
    // Spouse email
    await safeFillInput(page, applicationSelectors.childrenPlusOnes.spouseEmail, 'jane.doe@example.com');
    
    // Kids checkbox
    await safeCheck(page, applicationSelectors.childrenPlusOnes.kidsCheckbox);
    
    // Add a kid
    await safeClick(page, applicationSelectors.childrenPlusOnes.addKidButton);
    
    // Fill kid modal
    await safeFillInput(page, applicationSelectors.childrenPlusOnes.kidModalNameInput, 'Little John');
    await selectCustomOption(page, applicationSelectors.childrenPlusOnes.kidModalAgeSelect, '5-10');
    await safeClick(page, applicationSelectors.childrenPlusOnes.kidModalAddButton);
  }

  async function fillScholarshipSection(page: any) {
    // Scholarship request checkbox
    await safeCheck(page, applicationSelectors.scholarship.scholarshipRequestCheckbox);
    
    // NOTE: payment_capacity is not enabled for edge-esmeralda
    // This field is only available for certain cities
    
    // Scholarship video URL - Required field when scholarship is checked
    await safeFillInput(page, applicationSelectors.scholarship.videoUrl, 'https://youtube.com/watch?v=scholarship-video');
    
    // Scholarship details - Optional text field
    await safeFillInput(page, applicationSelectors.scholarship.details, 'I am a student and would greatly benefit from financial assistance to attend this event.');
  }

  async function submitForm(page: any) {
    // Wait for form to be ready for submission and scroll to submit button
    await safeClick(page, applicationSelectors.actions.submitButton);
    
    // Wait for submission to complete (adjust timeout as needed)
    await page.waitForTimeout(3000);
  }
});
