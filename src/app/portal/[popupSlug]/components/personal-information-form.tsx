import { Input } from "@/components/ui/input"
import { Label, LabelMuted } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormInputWrapper } from "./form-input-wrapper";
import { RequiredFieldIndicator } from "./required-field-indicator";
import SectionWrapper from "./SectionWrapper";
import { Checkbox } from "@/components/ui/checkbox";
import { AddonInput } from "@/components/ui/addon-input";
import { MultiSelect } from "@/components/ui/MultiSelect";

interface PersonalInformationFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | string[] | boolean) => void;
}

const shareableInfo = [
  { value: "First name", label: "First name" },
  { value: "Last name", label: "Last name" },
  { value: "Email address", label: "Email address" },
  { value: "Telegram username", label: "Telegram username" },
  { value: "Check-in date", label: "Check-in date" },
  { value: "Check-out date", label: "Check-out date" },
  { value: "Whether or not I'm bringing kids", label: "Whether or not I'm bringing kids" },
]

export function PersonalInformationForm({ formData, errors, handleChange }: PersonalInformationFormProps) {

  const handleChangeShareableInfo = (selected: string[]) => {
    handleChange('info_not_shared', selected)
  }

  return (
    <SectionWrapper>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Personal Information</h2>
        <p className="text-muted-foreground">
          Your basic information helps us identify and contact you.
        </p>
      </div>
      <FormInputWrapper>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputWrapper>
            <div className="space-y-1">
              <Label htmlFor="first_name">
                First name
                <RequiredFieldIndicator />
              </Label>
              <Input 
                id="first_name" 
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
            </div>
          </FormInputWrapper>
          <FormInputWrapper>
            <div className="space-y-1">
              <Label htmlFor="last_name">
                Last name
                <RequiredFieldIndicator />
              </Label>
              <Input 
                id="last_name" 
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
            </div>
          </FormInputWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <FormInputWrapper>
            <div className="my-2 space-y-1">
              <Label htmlFor="gender">
                Gender
                <RequiredFieldIndicator />
              </Label>
              <Select 
                onValueChange={(value) => handleChange('gender', value)}
                value={formData.gender}
              >
                <SelectTrigger id="gender" className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </FormInputWrapper>
          <FormInputWrapper>
            <div className="my-2 space-y-1">
              <Label htmlFor="age">
                Age
                <RequiredFieldIndicator />
              </Label>
              <Select 
                onValueChange={(value) => handleChange('age', value)}
                value={formData.age}
              >
                <SelectTrigger id="age" className={errors.age ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="18-24">18-24</SelectItem>
                  <SelectItem value="25-34">25-34</SelectItem>
                  <SelectItem value="35-44">35-44</SelectItem>
                  <SelectItem value="45-54">45-54</SelectItem>
                  <SelectItem value="55+">55+</SelectItem>
                </SelectContent>
              </Select>
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>
          </FormInputWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <FormInputWrapper>
            <div className="h-full flex flex-col my-1 mb-2">
              <Label htmlFor="telegram">
                Telegram username
                <RequiredFieldIndicator />
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                The primary form of communication during Edge Esmeralda will be a Telegram group, so create an account if you don&apos;t already have one
              </p>
              <AddonInput
                id="telegram"
                addon="@"
                placeholder="username"
                defaultValue={formData.telegram}
                onChange={(e) => handleChange('telegram', e.target.value)}
                className={errors.telegram ? 'border-red-500' : ''}
              />
              {errors.telegram && <p className="text-red-500 text-sm mt-1">{errors.telegram}</p>}
            </div>
          </FormInputWrapper>
          <FormInputWrapper>
            <div className="flex flex-col h-full my-1 mb-2">
              <Label htmlFor="residence">Usual location of residence</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Please format it like [City, State/Region, Country]. Feel free to put multiple cities if you live in multiple places.
              </p>
              <Input 
                id="residence" 
                value={formData.residence ?? ''}
                onChange={(e) => handleChange('residence', e.target.value)}
                className="mt-auto"
                placeholder='Healdsburg, California, USA'
              />
            </div>
          </FormInputWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <FormInputWrapper>
            <div className="flex flex-col h-full">
              <Label htmlFor="eth_address">ETH address</Label>
              <p className="text-sm text-muted-foreground mb-2">
                For POAPs, NFTs, allowlists.
              </p>
              <Input
                id="eth_address" 
                value={formData.eth_address ?? ''}
                onChange={(e) => handleChange('eth_address', e.target.value)}
                className="mt-auto"
              />
            </div>
          </FormInputWrapper>
          <FormInputWrapper>
            <div className="flex flex-col h-full">
            <Label htmlFor="referral">Did anyone refer you?</Label>
            <p className="text-sm text-muted-foreground mb-2">
              List everyone who encouraged you to apply
            </p>
            <Input
              id="referral"
              value={formData.referral ?? ''}
              onChange={(e) => handleChange('referral', e.target.value)}
              className="mt-auto"
            />
            </div>
          </FormInputWrapper>
        </div>

        <FormInputWrapper>
          <div className="space-y-6 my-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="local_resident"
                  checked={formData.local_resident || false}
                  onCheckedChange={(checked: boolean) => handleChange('local_resident', checked === true)}
                />
                <LabelMuted htmlFor="local_resident">Are you a Sonoma County local?</LabelMuted>
              </div>
          </div>
        </FormInputWrapper>

        <FormInputWrapper>
          <Label>
            Info I&apos;m <strong>NOT</strong> willing to share with other attendees
            <p className="text-sm text-muted-foreground mb-2">
              We will make a directory to make it easier for attendees to coordinate
            </p>
          </Label>
          <div className="space-y-2 ">
            <MultiSelect options={shareableInfo} onChange={handleChangeShareableInfo} defaultValue={formData.info_not_shared}/>
          </div>
        </FormInputWrapper>
      </FormInputWrapper>
    </SectionWrapper>
  )
}

