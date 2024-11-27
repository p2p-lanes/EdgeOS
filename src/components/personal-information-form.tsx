import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RequiredFieldIndicator } from "@/components/required-field-indicator"
import { FormInputWrapper } from "@/components/form-input-wrapper"

interface PersonalInformationFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string) => void;
}

export function PersonalInformationForm({ formData, errors, handleChange }: PersonalInformationFormProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Personal Information</h2>
        <p className="text-muted-foreground">
          Your basic information helps us identify and contact you.
        </p>
      </div>
      <FormInputWrapper>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputWrapper>
            <Label htmlFor="firstName">
              First name
              <RequiredFieldIndicator />
            </Label>
            <Input 
              id="firstName" 
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </FormInputWrapper>
          <FormInputWrapper>
            <Label htmlFor="lastName">
              Last name
              <RequiredFieldIndicator />
            </Label>
            <Input 
              id="lastName" 
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </FormInputWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <FormInputWrapper>
            <div className="h-full flex flex-col">
              <Label htmlFor="email">
                Email
                <RequiredFieldIndicator />
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Remember which email you&apos;re sharing here, because you will need it to sign in to our ticketing platform, Lemonade!
              </p>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`mt-auto ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </FormInputWrapper>
          <FormInputWrapper>
            <div className="h-full flex flex-col">
              <Label htmlFor="telegram">
                Telegram username
                <RequiredFieldIndicator />
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                The primary form of communication during Edge Esmeralda will be a Telegram group, so create an account if you don&apos;t already have one
              </p>
              <Input 
                id="telegram" 
                value={formData.telegram}
                onChange={(e) => handleChange('telegram', e.target.value)}
                className={`mt-auto ${errors.telegram ? 'border-red-500' : ''}`}
              />
              {errors.telegram && <p className="text-red-500 text-sm mt-1">{errors.telegram}</p>}
            </div>
          </FormInputWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <FormInputWrapper>
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
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </FormInputWrapper>
          <FormInputWrapper>
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
          </FormInputWrapper>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <FormInputWrapper>
            <div className="flex flex-col h-full">
              <Label htmlFor="location">Usual location of residence</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Please format it like [City, State/Region, Country], e.g. &quot;Healdsburg, California, USA&quot;. Feel free to put multiple cities if you live in multiple places.
              </p>
              <Input 
                id="location" 
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="mt-auto"
              />
            </div>
          </FormInputWrapper>
          <FormInputWrapper>
            <div className="flex flex-col h-full">
              <Label htmlFor="eth">ETH address</Label>
              <p className="text-sm text-muted-foreground mb-2">
                For POAPs, NFTs, allowlists.
              </p>
              <Input 
                id="eth" 
                value={formData.ethAddress}
                onChange={(e) => handleChange('ethAddress', e.target.value)}
                className="mt-auto"
              />
            </div>
          </FormInputWrapper>
        </div>
      </FormInputWrapper>
    </div>
  )
}

