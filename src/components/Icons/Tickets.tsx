const width = 18
const height = 18

export const TicketPatron = () => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4.66732V6.00065C2.53043 6.00065 3.03914 6.21136 3.41421 6.58644C3.78929 6.96151 4 7.47022 4 8.00065C4 8.53108 3.78929 9.03979 3.41421 9.41487C3.03914 9.78994 2.53043 10.0007 2 10.0007V11.334C2 12.0673 2.6 12.6673 3.33333 12.6673H12.6667C13.0203 12.6673 13.3594 12.5268 13.6095 12.2768C13.8595 12.0267 14 11.6876 14 11.334V10.0007C13.4696 10.0007 12.9609 9.78994 12.5858 9.41487C12.2107 9.03979 12 8.53108 12 8.00065C12 7.47022 12.2107 6.96151 12.5858 6.58644C12.9609 6.21136 13.4696 6.00065 14 6.00065V4.66732C14 4.3137 13.8595 3.97456 13.6095 3.72451C13.3594 3.47446 13.0203 3.33398 12.6667 3.33398H3.33333C2.97971 3.33398 2.64057 3.47446 2.39052 3.72451C2.14048 3.97456 2 4.3137 2 4.66732Z"
      fill="url(#paint0_linear_912_11140)" stroke="url(#paint1_linear_912_11140)" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66602 3.33398V4.66732" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66602 11.334V12.6673" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66602 7.33398V8.66732" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="paint0_linear_912_11140" x1="2" y1="11.0045" x2="13.8075" y2="11.2091" gradientUnits="userSpaceOnUse">
        <stop offset="0.046875" stopColor="#FF8181"/>
        <stop offset="0.979167" stopColor="#DE00F1"/>
      </linearGradient>
      <linearGradient id="paint1_linear_912_11140" x1="2" y1="11.0045" x2="13.8075" y2="11.2091" gradientUnits="userSpaceOnUse">
        <stop offset="0.046875" stopColor="#FF8181"/>
        <stop offset="0.979167" stopColor="#DE00F1"/>
      </linearGradient>
    </defs>
  </svg>
)

export const TicketWeek = ({week}: {week: boolean}) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4.66732V6.00065C2.53043 6.00065 3.03914 6.21136 3.41421 6.58644C3.78929 6.96151 4 7.47022 4 8.00065C4 8.53108 3.78929 9.03979 3.41421 9.41487C3.03914 9.78994 2.53043 10.0007 2 10.0007V11.334C2 12.0673 2.6 12.6673 3.33333 12.6673H12.6667C13.0203 12.6673 13.3594 12.5268 13.6095 12.2768C13.8595 12.0267 14 11.6876 14 11.334V10.0007C13.4696 10.0007 12.9609 9.78994 12.5858 9.41487C12.2107 9.03979 12 8.53108 12 8.00065C12 7.47022 12.2107 6.96151 12.5858 6.58644C12.9609 6.21136 13.4696 6.00065 14 6.00065V4.66732C14 4.3137 13.8595 3.97456 13.6095 3.72451C13.3594 3.47446 13.0203 3.33398 12.6667 3.33398H3.33333C2.97971 3.33398 2.64057 3.47446 2.39052 3.72451C2.14048 3.97456 2 4.3137 2 4.66732Z" 
      fill={week ? "#16B74A" : ''} stroke={week ? "#16B74A" : '#94A3B8'} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66602 3.33398V4.66732" stroke={week ? "white" : '#94A3B8'} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66602 11.334V12.6673" stroke={week ? "white" : '#94A3B8'} strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.66602 7.33398V8.66732" stroke={week ? "white" : '#94A3B8'} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)