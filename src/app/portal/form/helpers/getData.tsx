import { api } from "@/api";

// Simulated function to check if user exists
export const getUser = async (): any => {
  return "chole@muvinai.com"; // For demonstration, assume this email has an existing application
}

// Simulated function to fetch existing application data
export const fetchExistingApplication = async (email: string): Promise<any> => {
  // This is a mock implementation. In a real scenario, this would be an API call.

  const result = await api.get('applications', {email})

  console.log('result check for fetchExistingApplication', result)

  return {
    firstName: 'Chole',
    lastName: 'Alfaro',
    email: 'chole@muvinai.com',
    applicationDate: '2024-10-23',
    event: 'Edge Esmeralda 2024',
  };
}

// New function to check for draft
export const checkForDraft = async (): Promise<any> => {
  const email = getUser()
  const result = await api.get('applications', {email})

  console.log('result check for checkForDraft', result)

  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  // return {
  //   firstName: 'Jane',
  //   lastName: 'Smith',
  //   email: 'jane.smith@example.com',
  //   telegram: '@janesmith',
  //   organization: 'Tech Innovators',
  //   role: 'Software Engineer',
  //   // ... other fields as needed
  // };
  return {}
}