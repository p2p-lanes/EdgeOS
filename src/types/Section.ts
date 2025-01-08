export interface SectionProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | string[] | boolean) => void;
  fields: Set<string> | null;
}