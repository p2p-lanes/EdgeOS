import InputForm, { AddonInputForm } from "@/components/ui/Form/Input";
import RadioGroupForm from "@/components/ui/Form/RadioGroup";
import { GenderOption } from "../../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LabelRequired } from "@/components/ui/label";

interface PersonalInfoFormProps {
  formData: {
    first_name: string;
    last_name: string;
    telegram: string;
    organization: string;
    role: string;
    gender: string;
    email: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleChangeEmail?: () => void;
  errors: Record<string, string>;
}

const genderOptions: GenderOption[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" }
];

const PersonalInfoForm = ({ 
  formData, 
  handleInputChange, 
  handleChangeEmail, 
  errors
}: PersonalInfoFormProps) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">      
      {/* Email con botón para cambiar */}
      <div className="w-full flex items-center justify-between">
        <div className="w-full flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <LabelRequired isRequired={false}>Email</LabelRequired>
          </div>
          <Input
            id="email-verified"
            type="email"
            value={formData.email}
            onChange={() => {}} // No se puede cambiar
            disabled={true}
            className="w-full"
          />
        </div>
        
        {handleChangeEmail && (
          <Button
            type="button"
            variant="link"
            size="default"
            className="mt-[21px]"
            onClick={handleChangeEmail}
          >
            Change email
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputForm
          label="First Name"
          id="first_name"
          value={formData.first_name}
          onChange={(value) => handleInputChange("first_name", value)}
          error={errors.first_name}
          isRequired
          placeholder="Enter your first name"
        />
        
        <InputForm
          label="Last Name"
          id="last_name"
          value={formData.last_name}
          onChange={(value) => handleInputChange("last_name", value)}
          error={errors.last_name}
          isRequired
          placeholder="Enter your last name"
        />
      </div>
      
      <AddonInputForm
        label="Telegram"
        id="telegram"
        addon="@"
        value={formData.telegram}
        onChange={(value) => handleInputChange("telegram", value)}
        error={errors.telegram}
        isRequired
        placeholder="username"
      />
      
      <InputForm
        label="Organization"
        id="organization"
        value={formData.organization}
        onChange={(value) => handleInputChange("organization", value)}
        error={errors.organization}
        isRequired
        placeholder="Your organization name"
      />
      
      <InputForm
        label="Role"
        id="role"
        value={formData.role}
        onChange={(value) => handleInputChange("role", value)}
        error={errors.role}
        isRequired
        placeholder="Your role in the organization"
      />
      
      <RadioGroupForm
        label="Gender"
        subtitle="Select your gender"
        value={formData.gender}
        onChange={(value) => handleInputChange("gender", value)}
        error={errors.gender}
        isRequired
        options={genderOptions}
      />
    </div>
  );
};

export default PersonalInfoForm; 