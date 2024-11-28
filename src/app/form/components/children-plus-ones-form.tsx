import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RequiredFieldIndicator } from "@/app/form/components/required-field-indicator"
import { FormInputWrapper } from "@/app/form/components/form-input-wrapper"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface ChildrenPlusOnesFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | boolean) => void;
}

export function ChildrenPlusOnesForm({ formData, errors, handleChange }: ChildrenPlusOnesFormProps) {
  const [hasSpouse, setHasSpouse] = useState(formData.hasSpouse || false);
  const [hasKids, setHasKids] = useState(formData.hasKids || false);

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Children and +1s</h2>
        <p className="text-sm text-muted-foreground">
          Learn more about our ticketing pricing and philosophy{" "}
          <Link href="#" className="text-primary hover:underline">
            here
          </Link>
          .
        </p>
      </div>
      <FormInputWrapper>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputWrapper>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="spouse"
                checked={hasSpouse}
                onCheckedChange={(checked) => {
                  setHasSpouse(checked === true);
                  handleChange('hasSpouse', checked === true);
                  if (checked === false) {
                    handleChange('spouseName', '');
                    handleChange('spouseEmail', '');
                  }
                }}
              />
              <Label htmlFor="spouse">I am bringing a spouse/partner</Label>
            </div>
            <AnimatePresence>
              {hasSpouse && (
                <motion.div {...animationProps}>
                  <FormInputWrapper>
                    <FormInputWrapper>
                      <Label htmlFor="spouse-name">
                        Name of spouse/partner + duration of their stay
                        <RequiredFieldIndicator />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        We will approve your spouse/partner if we approve you. However please have them fill out this form as well so we have their information in our system.
                      </p>
                      <Input 
                        id="spouse-name"
                        value={formData.spouseName}
                        onChange={(e) => handleChange('spouseName', e.target.value)}
                        className={errors.spouseName ? 'border-red-500' : ''}
                      />
                      {errors.spouseName && <p className="text-red-500 text-sm">{errors.spouseName}</p>}
                    </FormInputWrapper>
                    <FormInputWrapper>
                      <Label htmlFor="spouse-email">
                        Spouse/partner email
                        <RequiredFieldIndicator />
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Please provide your spouse/partner&apos;s email so we can remind them to apply.
                      </p>
                      <Input 
                        id="spouse-email" 
                        type="email"
                        value={formData.spouseEmail}
                        onChange={(e) => handleChange('spouseEmail', e.target.value)}
                        className={errors.spouseEmail ? 'border-red-500' : ''}
                      />
                      {errors.spouseEmail && <p className="text-red-500 text-sm">{errors.spouseEmail}</p>}
                    </FormInputWrapper>
                  </FormInputWrapper>
                </motion.div>
              )}
            </AnimatePresence>
          </FormInputWrapper>
          
          <FormInputWrapper>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="kids"
                checked={hasKids}
                onCheckedChange={(checked) => {
                  setHasKids(checked === true);
                  handleChange('hasKids', checked === true);
                  if (checked === false) {
                    handleChange('kidsInfo', '');
                  }
                }}
              />
              <Label htmlFor="kids">I am bringing kids</Label>
            </div>
            <AnimatePresence>
              {hasKids && (
                <motion.div {...animationProps}>
                  <FormInputWrapper>
                    <Label htmlFor="kids-info">
                      If so, what are their ages? And how long will they stay?
                      <RequiredFieldIndicator />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      We will approve your kids if we approve you. Your kids do not need to fill out their own version of this form however.
                    </p>
                    <Textarea 
                      id="kids-info" 
                      className={`min-h-[100px] ${errors.kidsInfo ? 'border-red-500' : ''}`}
                      value={formData.kidsInfo}
                      onChange={(e) => handleChange('kidsInfo', e.target.value)}
                    />
                    {errors.kidsInfo && <p className="text-red-500 text-sm">{errors.kidsInfo}</p>}
                  </FormInputWrapper>
                </motion.div>
              )}
            </AnimatePresence>
          </FormInputWrapper>
        </div>
      </FormInputWrapper>
    </div>
  )
}

