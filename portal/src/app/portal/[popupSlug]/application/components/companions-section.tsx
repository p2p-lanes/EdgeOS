"use client"

import type { CompanionCreate } from "@edgeos/api-client"
import { AnimatePresence, motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CheckboxForm from "@/components/ui/Form/Checkbox"
import InputForm from "@/components/ui/Form/Input"
import SelectForm from "@/components/ui/Form/Select"
import { LabelMuted } from "@/components/ui/label"
import SectionWrapper from "./SectionWrapper"
import { SectionSeparator } from "./section-separator"

export interface CompanionWithId extends CompanionCreate {
  _id: string
}

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Prefer not to say", label: "Prefer not to say" },
]

const animationProps = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.3, ease: "easeInOut" },
}

interface CompanionsSectionProps {
  allowsSpouse: boolean
  allowsChildren: boolean
  companions: CompanionWithId[]
  onCompanionsChange: (companions: CompanionWithId[]) => void
}

export function CompanionsSection({
  allowsSpouse,
  allowsChildren,
  companions,
  onCompanionsChange,
}: CompanionsSectionProps) {
  const [hasSpouse, setHasSpouse] = useState(
    companions.some((c) => c.category === "spouse"),
  )
  const [hasKids, setHasKids] = useState(
    companions.some((c) => c.category === "kid"),
  )
  const [showKidModal, setShowKidModal] = useState(false)
  const [kidName, setKidName] = useState("")
  const [kidGender, setKidGender] = useState("")

  if (!allowsSpouse && !allowsChildren) return null

  const spouse = companions.find((c) => c.category === "spouse")
  const kids = companions.filter((c) => c.category === "kid")

  const updateCompanion = (id: string, updates: Partial<CompanionCreate>) => {
    onCompanionsChange(
      companions.map((c) => (c._id === id ? { ...c, ...updates } : c)),
    )
  }

  const removeCompanion = (id: string) => {
    onCompanionsChange(companions.filter((c) => c._id !== id))
  }

  const handleToggleSpouse = (checked: boolean) => {
    setHasSpouse(checked)
    if (checked) {
      onCompanionsChange([
        ...companions,
        {
          _id: crypto.randomUUID(),
          name: "",
          category: "spouse",
          email: "",
          gender: "",
        },
      ])
    } else {
      onCompanionsChange(companions.filter((c) => c.category !== "spouse"))
    }
  }

  const handleToggleKids = (checked: boolean) => {
    setHasKids(checked)
    if (!checked) {
      onCompanionsChange(companions.filter((c) => c.category !== "kid"))
    }
  }

  const addKid = () => {
    if (!kidName.trim()) return
    onCompanionsChange([
      ...companions,
      {
        _id: crypto.randomUUID(),
        name: kidName.trim(),
        category: "kid",
        gender: kidGender || undefined,
      },
    ])
    setKidName("")
    setKidGender("")
    setShowKidModal(false)
  }

  return (
    <>
      <SectionWrapper title="Children and +1s">
        <div className="flex flex-col gap-4">
          {allowsSpouse && (
            <div>
              <CheckboxForm
                label="I am bringing a spouse/partner"
                id="brings_spouse"
                checked={hasSpouse}
                onCheckedChange={handleToggleSpouse}
              />
              <AnimatePresence>
                {hasSpouse && spouse && (
                  <motion.div {...animationProps}>
                    <div className="flex flex-col gap-6 mt-6">
                      <InputForm
                        label="Name of spouse/partner"
                        id="spouse_name"
                        value={spouse.name}
                        onChange={(v) =>
                          updateCompanion(spouse._id, { name: v })
                        }
                        isRequired
                        subtitle="We will approve your spouse/partner if we approve you."
                      />
                      <InputForm
                        label="Spouse/partner email"
                        id="spouse_email"
                        type="email"
                        value={spouse.email ?? ""}
                        onChange={(v) =>
                          updateCompanion(spouse._id, { email: v })
                        }
                        isRequired
                        subtitle="Please provide your spouse/partner's email so we can remind them to apply."
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {allowsChildren && (
            <div>
              <CheckboxForm
                label="I'm bringing kids"
                id="brings_kids"
                checked={hasKids}
                onCheckedChange={handleToggleKids}
              />
              <AnimatePresence>
                {hasKids && (
                  <motion.div {...animationProps}>
                    <div className="mt-4">
                      <LabelMuted className="text-sm text-muted-foreground mb-4 block">
                        We will approve your kids if we approve you. Your kids
                        do not need to fill out their own version of this form
                        however.
                      </LabelMuted>

                      {kids.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {kids.map((kid) => (
                            <div
                              key={kid._id}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                              <span className="text-sm">
                                {kid.name}
                                {kid.gender ? ` - ${kid.gender}` : ""}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeCompanion(kid._id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowKidModal(true)}
                        className="flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add Kid
                      </Button>

                      <Dialog
                        open={showKidModal}
                        onOpenChange={setShowKidModal}
                      >
                        <DialogContent className="sm:max-w-[425px] bg-white">
                          <DialogHeader>
                            <DialogTitle>Add Child</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <InputForm
                              label="Child's Name"
                              id="kid_name"
                              value={kidName}
                              onChange={setKidName}
                              isRequired
                              placeholder="Enter child's name"
                            />
                            <SelectForm
                              label="Gender"
                              id="kid_gender"
                              value={kidGender}
                              onChange={setKidGender}
                              options={GENDER_OPTIONS}
                              placeholder="Select gender"
                            />
                          </div>
                          <DialogFooter className="flex flex-col gap-4 md:flex-row">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setKidName("")
                                setKidGender("")
                                setShowKidModal(false)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={addKid}
                              disabled={!kidName.trim()}
                            >
                              Add Child
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </SectionWrapper>
      <SectionSeparator />
    </>
  )
}
