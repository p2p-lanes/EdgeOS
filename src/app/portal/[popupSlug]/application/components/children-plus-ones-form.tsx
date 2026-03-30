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
  gender: string;
}

export function ChildrenPlusOnesForm({ formData, errors, handleChange, fields }: SectionProps) {
  const [hasSpouse, setHasSpouse] = useState(formData.brings_spouse || false);
  const [hasKids, setHasKids] = useState(formData.brings_kids || false);
  const [kids, setKids] = useState<Kid[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [kidName, setKidName] = useState("");
  const [kidAge, setKidAge] = useState("");
  const [kidGender, setKidGender] = useState("");

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
      const kidEntries = formData.kids_info.split('.').filter((entry: string) => entry.trim());

      kidEntries.forEach((entry: string, index: number) => {
        const trimmedEntry = entry.trim();
        if (trimmedEntry) {
          const parts = trimmedEntry.split(',').map((p: string) => p.trim());
          if (parts.length >= 2) {
            const name = parts[0];
            const age = parts[1];
            const gender = parts[2] || '';
            if (name && age) {
              parsedKids.push({ id: `existing-${index}`, name, age, gender });
            }
          }
        }
      });

      if (parsedKids.length > 0) {
        setKids(parsedKids);
      }
    }
  }, [formData.kids_info]);

  // Update kids_info when kids array changes
  useEffect(() => {
    const formattedKids = kids.map(kid => `${kid.name}, ${kid.age}, ${kid.gender}.`).join(' ');
    handleChange('kids_info', formattedKids);
  }, [kids]);

  const addKid = () => {
    if (kidName.trim() && kidAge && kidGender) {
      const newKid: Kid = {
        id: Date.now().toString(),
        name: kidName.trim(),
        age: kidAge,
        gender: kidGender,
      };
      setKids([...kids, newKid]);
      setKidName("");
      setKidAge("");
      setKidGender("");
      setShowModal(false);
    }
  };

  const removeKid = (id: string) => {
    setKids(kids.filter(kid => kid.id !== id));
  };

  const resetModal = () => {
    setKidName("");
    setKidAge("");
    setKidGender("");
    setShowModal(false);
  };

  if (!fields || !fields.size || !fieldsChildrenPlusOnes.some(field => fields.has(field))) return null;

  return (
    <>
    <SectionWrapper title="Children and +1s">
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
                      />
                      <InputForm
                        label="Spouse/partner email"
                        id="spouse_email"
                        value={formData.spouse_email}
                        onChange={(value) => handleChange('spouse_email', value)}
                        error={errors.spouse_email}
                        isRequired={true}
                        subtitle="Please provide your spouse/partner&apos;s email so we can remind them to apply."
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
                label="I’m bringing kids"
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
                            <div key={kid.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <span className="text-sm">
                                {kid.name}, {kid.age === "< 1" ? "< 1 year old" : `${kid.age} years old`}{kid.gender ? `, ${kid.gender}` : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeKid(kid.id)}
                                className="text-red-500 hover:text-red-700 p-1"
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
                      >
                        <Plus size={16} />
                        Add Kid
                      </Button>

                      {/* Modal */}
                      {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Age
                                </label>
                                <Select value={kidAge} onValueChange={setKidAge}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select age" />
                                  </SelectTrigger>
                                  <SelectContent position="popper" className="max-h-[200px] overflow-y-auto">
                                    {ageOptions.map((age) => (
                                      <SelectItem key={age} value={age}>
                                        {age === "< 1" ? "< 1 year old" : `${age} years old`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Gender
                                </label>
                                <Select value={kidGender} onValueChange={setKidGender}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="prefer not say">Prefer not to say</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                              <Button
                                type="button"
                                onClick={addKid}
                                disabled={!kidName.trim() || !kidAge || !kidGender}
                                className="flex-1"
                              >
                                Add Child
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={resetModal}
                                className="flex-1"
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


