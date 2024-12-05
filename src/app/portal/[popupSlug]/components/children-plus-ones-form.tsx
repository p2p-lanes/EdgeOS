import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { FormInputWrapper } from "./form-input-wrapper"
import { RequiredFieldIndicator } from "./required-field-indicator"
import SectionWrapper from "./SectionWrapper"

interface ChildrenPlusOnesFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | boolean) => void;
}

export function ChildrenPlusOnesForm({ formData, errors, handleChange }: ChildrenPlusOnesFormProps) {
  const [hasSpouse, setHasSpouse] = useState(formData.brings_spouse || false);
  const [hasKids, setHasKids] = useState(formData.brings_kids || false);

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <SectionWrapper>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Children and +1s</h2>
        <p className="text-sm text-muted-foreground">
          
          .
        </p>
      </div>
      <FormInputWrapper>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputWrapper>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="brings_spouse"
                checked={hasSpouse}
                onCheckedChange={(checked) => {
                  setHasSpouse(checked === true);
                  handleChange('brings_spouse', checked === true);
                  if (checked === false) {
                    handleChange('spouse_info', '');
                    handleChange('spouse_email', '');
                  }
                }}
              />
              <Label htmlFor="brings_spouse">I am bringing a spouse/partner</Label>
            </div>
            <AnimatePresence>
              {hasSpouse && (
                <motion.div {...animationProps}>
                  <FormInputWrapper>
                    <FormInputWrapper>
                      <Label htmlFor="spouse_info">
                        Name of spouse/partner + duration of their stay
                        <RequiredFieldIndicator />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        We will approve your spouse/partner if we approve you. However please have them fill out this form as well so we have their information in our system.
                      </p>
                      <Input 
                        id="spouse_info"
                        value={formData.spouse_info}
                        onChange={(e) => handleChange('spouse_info', e.target.value)}
                        className={errors.spouse_info ? 'border-red-500' : ''}
                      />
                      {errors.spouse_info && <p className="text-red-500 text-sm">{errors.spouse_info}</p>}
                    </FormInputWrapper>
                    <FormInputWrapper>
                      <Label htmlFor="spouse_email">
                        Spouse/partner email
                        <RequiredFieldIndicator />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Please provide your spouse/partner&apos;s email so we can remind them to apply.
                      </p>
                      <Input 
                        id="spouse_email" 
                        type="email"
                        value={formData.spouse_email}
                        onChange={(e) => handleChange('spouse_email', e.target.value)}
                        className={errors.spouse_email ? 'border-red-500' : ''}
                      />
                      {errors.spouse_email && <p className="text-red-500 text-sm">{errors.spouse_email}</p>}
                    </FormInputWrapper>
                  </FormInputWrapper>
                </motion.div>
              )}
            </AnimatePresence>
          </FormInputWrapper>
          
          <FormInputWrapper>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="brings_kids"
                checked={hasKids}
                onCheckedChange={(checked) => {
                  setHasKids(checked === true);
                  handleChange('brings_kids', checked === true);
                  if (checked === false) {
                    handleChange('kids_info', '');
                  }
                }}
              />
              <Label htmlFor="brings_kids">I am bringing kids</Label>
            </div>
            <AnimatePresence>
              {hasKids && (
                <motion.div {...animationProps}>
                  <FormInputWrapper>
                    <Label htmlFor="kids_info">
                      If so, what are their ages? And how long will they stay?
                      <RequiredFieldIndicator />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      We will approve your kids if we approve you. Your kids do not need to fill out their own version of this form however.
                    </p>
                    <Textarea 
                      id="kids_info" 
                      className={`min-h-[100px] ${errors.kids_info ? 'border-red-500' : ''}`}
                      value={formData.kids_info}
                      onChange={(e) => handleChange('kids_info', e.target.value)}
                    />
                    {errors.kids_info && <p className="text-red-500 text-sm">{errors.kids_info}</p>}
                  </FormInputWrapper>
                </motion.div>
              )}
            </AnimatePresence>
          </FormInputWrapper>
        </div>
      </FormInputWrapper>
    </SectionWrapper>
  )
}

