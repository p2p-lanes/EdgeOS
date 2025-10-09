import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SectionWrapper from "./SectionWrapper"
import { SectionProps } from "@/types/Section"
import CheckboxForm from "@/components/ui/Form/Checkbox"
import InputForm from "@/components/ui/Form/Input"
import TextAreaForm from "@/components/ui/Form/TextArea"
import { SectionSeparator } from "./section-separator"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"
import { LabelMuted, LabelRequired } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fieldsChildrenPlusOnes = ["brings_spouse", "brings_kids"]

interface Kid {
  id: string;
  name: string;
  age: string;
}

export function ChildrenPlusOnesForm({ formData, errors, handleChange, fields }: SectionProps) {
  const [hasSpouse, setHasSpouse] = useState(formData.brings_spouse || false);
  const [hasKids, setHasKids] = useState(formData.brings_kids || false);
  const [kids, setKids] = useState<Kid[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [kidName, setKidName] = useState("");
  const [kidAge, setKidAge] = useState("");

  // Age options for the select
  const ageOptions = ["< 1", ...Array.from({ length: 18 }, (_, i) => (i + 1).toString())];

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  // Parse existing kids_info data when component mounts
  useEffect(() => {
    if (formData.kids_info && kids.length === 0) {
      const parsedKids: Kid[] = [];
      // Split by periods and filter out empty strings
      const kidEntries = formData.kids_info.split('.').filter((entry: string) => entry.trim());
      
      kidEntries.forEach((entry: string, index: number) => {
        const trimmedEntry = entry.trim();
        if (trimmedEntry) {
          // Split by last comma to separate name and age
          const lastCommaIndex = trimmedEntry.lastIndexOf(',');
          if (lastCommaIndex > 0) {
            const name = trimmedEntry.substring(0, lastCommaIndex).trim();
            const age = trimmedEntry.substring(lastCommaIndex + 1).trim();
            
            if (name && age) {
              parsedKids.push({
                id: `existing-${index}`,
                name,
                age
              });
            }
          }
        }
      });
      
      if (parsedKids.length > 0) {
        setKids(parsedKids);
      }
    }
  }, [formData.kids_info]); // Only run when kids_info changes from outside

  // Update kids_info when kids array changes
  useEffect(() => {
    const formattedKids = kids.map(kid => `${kid.name}, ${kid.age}.`).join(' ');
    handleChange('kids_info', formattedKids);
  }, [kids]); // Removed handleChange from dependencies to prevent infinite loop

  const addKid = () => {
    if (kidName.trim() && kidAge) {
      const newKid: Kid = {
        id: Date.now().toString(),
        name: kidName.trim(),
        age: kidAge
      };
      setKids([...kids, newKid]);
      setKidName("");
      setKidAge("");
      setShowModal(false);
    }
  };

  const removeKid = (id: string) => {
    setKids(kids.filter(kid => kid.id !== id));
  };

  const resetModal = () => {
    setKidName("");
    setKidAge("");
    setShowModal(false);
  };

  if (!fields || !fields.size || !fieldsChildrenPlusOnes.some(field => fields.has(field))) return null;

  return (
    <>
    <SectionWrapper title="Children and +1s" data-testid="children-plus-ones-section">
      <div className="flex flex-col gap-4">

        {
          fields.has('brings_spouse') && (
            <div>
              <CheckboxForm
                label="I am bringing a spouse/partner"
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
                data-testid="children-spouse-checkbox"
              />
              <AnimatePresence>
                {hasSpouse && (
                  <motion.div {...animationProps}>
                    <div className="flex flex-col gap-6 mt-6">
                      <InputForm
                        label="Name of spouse/partner + duration of their stay"
                        id="spouse_info"
                        value={formData.spouse_info}
                        onChange={(value) => handleChange('spouse_info', value)}
                        error={errors.spouse_info}
                        isRequired={true}
                        subtitle="We will approve your spouse/partner if we approve you. However please have them fill out this form as well so we have their information in our system."
                        data-testid="children-spouse-info-input"
                      />
                      <InputForm
                        label="Spouse/partner email"
                        id="spouse_email"
                        value={formData.spouse_email}
                        onChange={(value) => handleChange('spouse_email', value)}
                        error={errors.spouse_email}
                        isRequired={true}
                        subtitle="Please provide your spouse/partner&apos;s email so we can remind them to apply."
                        data-testid="children-spouse-email-input"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        }
        
        {
          fields.has('brings_kids') && (
            <div>
              <CheckboxForm
                label="I'm bringing kids"
                id="brings_kids"
                checked={hasKids}
                onCheckedChange={(checked) => {
                  setHasKids(checked === true);
                  handleChange('brings_kids', checked === true);
                  if (checked === false) {
                    handleChange('kids_info', '');
                    setKids([]);
                  }
                }}
                data-testid="children-kids-checkbox"
              />
              <AnimatePresence>
                {hasKids && (
                  <motion.div {...animationProps}>
                    <div className="mt-4">
                      <div className="mb-4 flex flex-col gap-2">
                        <LabelMuted className="text-sm text-muted-foreground">
                          We will approve your kids if we approve you. Your kids do not need to fill out their own version of this form however.
                        </LabelMuted>
                       
                      </div>

                      {/* List of added kids */}
                      {kids.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {kids.map((kid) => (
                            <div key={kid.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg" data-testid={`children-kid-item-${kid.id}`}>
                              <span className="text-sm">
                                {kid.name}, {kid.age === "< 1" ? "< 1 year old" : `${kid.age} years old`}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeKid(kid.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                data-testid={`children-kid-remove-btn-${kid.id}`}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Kid Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2"
                        data-testid="children-add-kid-btn"
                      >
                        <Plus size={16} />
                        Add Kid
                      </Button>

                      {/* Modal */}
                      {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="children-kid-modal">
                          <div className="bg-white p-6 rounded-lg w-96 max-w-md mx-4">
                            <h3 className="text-lg font-semibold mb-4">Add Child</h3>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Child&apos;s Name
                                </label>
                                <Input
                                  type="text"
                                  value={kidName}
                                  onChange={(e) => setKidName(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter child&apos;s name"
                                  data-testid="children-kid-modal-name-input"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Age
                                </label>
                                <Select value={kidAge} onValueChange={setKidAge}>
                                  <SelectTrigger className="w-full" data-testid="children-kid-modal-age-select">
                                    <SelectValue placeholder="Select age" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ageOptions.map((age) => (
                                      <SelectItem key={age} value={age}>
                                        {age === "< 1" ? "< 1 year old" : `${age} years old`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                              <Button
                                type="button"
                                onClick={addKid}
                                disabled={!kidName.trim() || !kidAge}
                                className="flex-1"
                                data-testid="children-kid-modal-add-btn"
                              >
                                Add Child
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={resetModal}
                                className="flex-1"
                                data-testid="children-kid-modal-cancel-btn"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {errors.kids_info && (
                        <p className="text-red-500 text-sm mt-2">{errors.kids_info}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        }
      </div>
    </SectionWrapper>
    <SectionSeparator />
    </>
  )
}


