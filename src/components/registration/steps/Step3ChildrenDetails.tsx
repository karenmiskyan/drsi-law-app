"use client";

import { useState, useEffect, useRef } from "react";
import { useRegistrationFormStore, ChildInfo } from "@/stores/registrationFormStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Baby, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Step3ChildrenDetails() {
  const {
    numberOfChildren,
    children,
    setNumberOfChildren,
    addChild,
    updateChild,
    removeChild,
    nextStep,
    previousStep,
  } = useRegistrationFormStore();

  const [childCount, setChildCount] = useState(numberOfChildren.toString());
  const isUpdatingRef = useRef(false);

  // 🔧 FIX: Sync local childCount with store (browser back, etc.)
  useEffect(() => {
    if (numberOfChildren.toString() !== childCount) {
      console.log(`📝 Step 3: Syncing child count from store: ${numberOfChildren}`);
      setChildCount(numberOfChildren.toString());
    }
  }, [numberOfChildren]);

  // Handle child count changes
  const handleChildCountChange = (value: string) => {
    setChildCount(value);
    const count = parseInt(value) || 0;
    
    // Prevent updates during ongoing updates
    if (isUpdatingRef.current) return;
    
    isUpdatingRef.current = true;
    
    // Update the count in store
    setNumberOfChildren(count);
    
    // Sync children array
    setTimeout(() => {
      const currentLength = children.length;
      
      if (currentLength < count) {
        // Add missing children
        const toAdd = count - currentLength;
        for (let i = 0; i < toAdd; i++) {
          addChild();
        }
      } else if (currentLength > count) {
        // Remove extra children
        const toRemove = currentLength - count;
        for (let i = 0; i < toRemove; i++) {
          const lastChild = children[currentLength - 1 - i];
          if (lastChild) {
            removeChild(lastChild.id);
          }
        }
      }
      
      isUpdatingRef.current = false;
    }, 0);
  };

  const handleContinue = () => {
    // Validate that all children have required fields
    if (numberOfChildren > 0) {
      const allValid = children.every(
        (child) =>
          child.fullName &&
          child.dateOfBirth.day &&
          child.dateOfBirth.month &&
          child.dateOfBirth.year &&
          child.gender &&
          child.birthPlace
      );

      if (!allValid) {
        alert("Please complete all required fields for each child");
        return;
      }
    }

    nextStep();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-[#B02828] to-[#8B1F1F] text-white">
        <CardTitle className="text-2xl">Children Details</CardTitle>
        <CardDescription className="text-gray-100">
          Information about unmarried children under 21
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Number of Children */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Number of Children
            </h3>

            <div className="space-y-2">
              <Label htmlFor="childCount">
                How many unmarried children under 21 do you have?
              </Label>
              <Input
                id="childCount"
                type="number"
                min="0"
                max="10"
                value={childCount}
                onChange={(e) => handleChildCountChange(e.target.value)}
                className="w-32"
              />
              <p className="text-sm text-gray-500">
                Enter 0 if you have no children under 21 or all your children are married/over 21
              </p>
            </div>
          </div>

          {/* No Children */}
          {numberOfChildren === 0 && (
            <Alert>
              <AlertDescription>
                You have indicated that you have no unmarried children under 21. Click "Continue"
                to proceed to the next step.
              </AlertDescription>
            </Alert>
          )}

          {/* Children Forms */}
          {numberOfChildren > 0 && (
            <div className="space-y-6">
              {children.map((child, index) => (
                <ChildForm
                  key={child.id}
                  child={child}
                  index={index}
                  updateChild={updateChild}
                  removeChild={removeChild}
                  totalChildren={numberOfChildren}
                />
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              onClick={previousStep}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            <Button
              type="button"
              onClick={handleContinue}
              size="lg"
              className="bg-[#B02828] hover:bg-[#8B1F1F] text-white px-8"
            >
              Continue
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Individual Child Form Component
interface ChildFormProps {
  child: ChildInfo;
  index: number;
  updateChild: (id: string, data: Partial<ChildInfo>) => void;
  removeChild: (id: string) => void;
  totalChildren: number;
}

function ChildForm({ child, index, updateChild, removeChild, totalChildren }: ChildFormProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-[#B02828]" />
          <h4 className="font-semibold text-gray-900">Child {index + 1}</h4>
        </div>
        {totalChildren > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeChild(child.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Child Full Name */}
      <div className="space-y-2">
        <Label>
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={child.fullName}
          onChange={(e) => updateChild(child.id, { fullName: e.target.value })}
          placeholder="Enter child's full legal name"
        />
      </div>

      {/* Child Date of Birth */}
      <div className="space-y-2">
        <Label>
          Date of Birth <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            type="number"
            min="1"
            max="31"
            placeholder="Day"
            value={child.dateOfBirth.day}
            onChange={(e) =>
              updateChild(child.id, {
                dateOfBirth: { ...child.dateOfBirth, day: e.target.value },
              })
            }
          />
          <Input
            type="number"
            min="1"
            max="12"
            placeholder="Month"
            value={child.dateOfBirth.month}
            onChange={(e) =>
              updateChild(child.id, {
                dateOfBirth: { ...child.dateOfBirth, month: e.target.value },
              })
            }
          />
          <Input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            placeholder="Year"
            value={child.dateOfBirth.year}
            onChange={(e) =>
              updateChild(child.id, {
                dateOfBirth: { ...child.dateOfBirth, year: e.target.value },
              })
            }
          />
        </div>
      </div>

      {/* Child Gender */}
      <div className="space-y-2">
        <Label>
          Gender <span className="text-red-500">*</span>
        </Label>
        <Select
          value={child.gender}
          onValueChange={(value: "male" | "female") => updateChild(child.id, { gender: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Birth Place */}
      <div className="space-y-2">
        <Label>
          Birth Place (City, Country) <span className="text-red-500">*</span>
        </Label>
        <Input
          value={child.birthPlace}
          onChange={(e) => updateChild(child.id, { birthPlace: e.target.value })}
          placeholder="e.g. Tel Aviv, Israel"
        />
      </div>

      {/* US Citizen or LPR Toggle */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
        <div className="space-y-0.5">
          <Label className="text-base">Is this child a US Citizen or Legal Permanent Resident?</Label>
          <p className="text-sm text-gray-500">
            Children who are US Citizens or LPRs do not need to apply for a Green Card
          </p>
        </div>
        <Switch
          checked={child.isUSCitizenOrLPR}
          onCheckedChange={(checked) => updateChild(child.id, { isUSCitizenOrLPR: checked })}
        />
      </div>

      {child.isUSCitizenOrLPR && (
        <Alert>
          <AlertDescription className="text-blue-600">
            This child will be marked as not requiring DV Lottery application documents.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}


