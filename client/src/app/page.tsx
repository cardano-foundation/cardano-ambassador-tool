"use client";
import { Navigation } from "@/components/ui-components";
import Title from "@/components/atoms/Title";
import Paragraph from "@/components/atoms/Paragraph";
import Input from "@/components/atoms/Input";
import Switch from "@/components/atoms/Switch";
import Dropdown from "@/components/atoms/Dropdown";
import Checkbox from "@/components/atoms/Checkbox";
import Button from "@/components/atoms/Button";
import { useState } from "react";

export default function HomePage() {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [dropdownValue, setDropdownValue] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    notifications: false,
    newsletter: false,
  });

  const dropdownOptions = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Title level="3" className="text-black-500">
            Welcome to Ambassador Tool
          </Title>
          <Title level="2" className="text-sunset-500">
            Welcome to Ambassador Tool
          </Title>
          <Title level="3" className="text-black-200">
            Welcome to Ambassador Tool
          </Title>
          <Title level="4" className="text-sunset-200">
            Welcome to Ambassador Tool
          </Title>

          <div className="bg-background text-card-foreground rounded-lg border border-border shadow-sm p-6 transition-colors">
            <Title level="6" className="text-card-foreground mb-4">
              Input Component States
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Title level="6" className="text-muted-foreground mb-3">
                  Default
                </Title>
                <Input label="Name" placeholder="Type here..." />
              </div>
              <div>
                <Title level="6" className="text-muted-foreground mb-3">
                  Error
                </Title>
                <Input
                  label="Error Input"
                  placeholder="Type here..."
                  error={true}
                  errorMessage="Required field"
                />
              </div>
              <div>
                <Title level="6" className="text-foreground mb-3">
                  Disabled
                </Title>
                <Input
                  label="Disabled Input"
                  placeholder="Cannot edit"
                  disabled={true}
                />
              </div>
              <div>
                <Title level="6" className="text-foreground mb-3">
                  With Value
                </Title>
                <Input label="Filled Input" value="Sample text" readOnly />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 transition-colors">
              <Title level="5" className="text-card-foreground mb-4">
                Sunset Color Scale
              </Title>
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="bg-sunset-50 h-12 rounded flex items-center justify-center text-xs font-medium">
                  50
                </div>
                <div className="bg-sunset-100 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  100
                </div>
                <div className="bg-sunset-200 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  200
                </div>
                <div className="bg-sunset-300 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  300
                </div>
                <div className="bg-sunset-400 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  400
                </div>
                <div className="bg-sunset-500 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  500
                </div>
              </div>
              <Paragraph size="body-3" className="text-muted-foreground">
                Sunset Orange palette - primary brand colors
              </Paragraph>
            </div>

            <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 transition-colors">
              <Title level="5" className="text-card-foreground mb-4">
                Gray Color Scale
              </Title>
              <div className="grid grid-cols-6 gap-2 mb-4">
                <div className="bg-gray-100 h-12 rounded flex items-center justify-center text-xs font-medium text-gray-800">
                  100
                </div>
                <div className="bg-gray-200 h-12 rounded flex items-center justify-center text-xs font-medium text-gray-800">
                  200
                </div>
                <div className="bg-gray-300 h-12 rounded flex items-center justify-center text-xs font-medium text-gray-800">
                  300
                </div>
                <div className="bg-black-50 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  50
                </div>
                <div className="bg-black-400 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  400
                </div>
                <div className="bg-black-500 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  500
                </div>
              </div>
              <Paragraph size="body-3" className="text-muted-foreground">
                Neutral grays - backgrounds and text
              </Paragraph>
            </div>
          </div>

          <div className="bg-background text-card-foreground rounded-lg border border-border shadow-sm p-6 transition-colors">
            <Title level="4" className="text-card-foreground mb-6">
              New Components Testing
            </Title>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <Title level="6" className="text-black-500">
                  Switch Component
                </Title>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={switchChecked}
                      onCheckedChange={setSwitchChecked}
                    />
                    <Paragraph size="body-4" as="span">
                      Interactive Switch
                    </Paragraph>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch checked={true} />
                    <Paragraph size="body-4" as="span">
                      Always On
                    </Paragraph>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch disabled />
                    <Paragraph
                      size="body-4"
                      as="span"
                      className="text-muted-foreground"
                    >
                      Disabled
                    </Paragraph>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Title level="6" className="text-foreground">
                  Checkbox Component
                </Title>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={checkboxChecked}
                      onCheckedChange={setCheckboxChecked}
                    />
                    <Paragraph size="body-4" as="span">
                      Interactive Checkbox
                    </Paragraph>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox checked={true} />
                    <Paragraph size="body-4" as="span">
                      Always Checked
                    </Paragraph>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox indeterminate={true} />
                    <Paragraph size="body-4" as="span">
                      Indeterminate
                    </Paragraph>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox disabled />
                    <Paragraph
                      size="body-4"
                      as="span"
                      className="text-muted-foreground"
                    >
                      Disabled
                    </Paragraph>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Title level="6" className="text-foreground">
                  Button Variants
                </Title>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    className="min-w-[120px] px-2"
                  >
                    Primary
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="min-w-[120px] px-2"
                  >
                    Secondary
                  </Button>
                </div>
              </div>

              <div className="space-y-4 px-4">
                <Title level="6" className="text-foreground">
                  Dropdown Component
                </Title>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dropdown
                    options={dropdownOptions}
                    value={dropdownValue}
                    onValueChange={setDropdownValue}
                    placeholder="Select country..."
                  />
                  <Dropdown
                    options={[
                      { value: "admin", label: "Administrator" },
                      { value: "user", label: "User" },
                      { value: "guest", label: "Guest" },
                    ]}
                    placeholder="Select role..."
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background text-card-foreground rounded-lg border border-border shadow-sm p-6 transition-colors">
            <Title level="4" className="text-card-foreground mb-6">
              Interactive Form Example
            </Title>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-32">
                  <Input
                    label="Code"
                    placeholder="ABC123"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="w-48">
                  <Input label="Phone" placeholder="+1 (555) 123-4567" />
                </div>
              </div>

              <div className="w-1/2">
                <Input
                  label="Email Address"
                  placeholder="john.doe@example.com"
                  type="email"
                />
              </div>

              <div className="w-full">
                <Input
                  label="Full Address"
                  placeholder="Enter your complete address "
                />
              </div>

              <div className="space-y-2">
                <Paragraph
                  size="body-4"
                  as="label"
                  className="text-muted-foreground"
                >
                  Country
                </Paragraph>
                <div className="w-64">
                  <Dropdown
                    options={dropdownOptions}
                    value={formData.country}
                    onValueChange={(value) =>
                      setFormData({ ...formData, country: value })
                    }
                    placeholder="Select your country..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background text-card-foreground rounded-lg border border-border shadow-sm p-6 transition-colors">
            <Title level="4" className="text-card-foreground mb-6">
              Paragraph Component Examples (Figma Specs)
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <Paragraph
                    size="body-4"
                    as="label"
                    className="text-muted-foreground mb-2"
                  >
                    BODY/B-1
                  </Paragraph>
                  <Paragraph size="body-1">
                    AaBbCc - Chivo Medium, 20px/30px - Perfect for important
                    content
                  </Paragraph>
                </div>

                <div className="p-4 border rounded-lg">
                  <Paragraph
                    size="body-4"
                    as="label"
                    className="text-muted-foreground mb-2"
                  >
                    BODY/B-2
                  </Paragraph>
                  <Paragraph size="body-2">
                    AaBbCc - Chivo Regular, 18px/28px - Standard body text
                  </Paragraph>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <Paragraph
                    size="body-4"
                    as="label"
                    className="text-muted-foreground mb-2"
                  >
                    BODY/B-3
                  </Paragraph>
                  <Paragraph size="body-3">
                    AaBbCc - Chivo Regular, 16px/24px - Secondary content
                  </Paragraph>
                </div>

                <div className="p-4 border rounded-lg">
                  <Paragraph
                    size="body-4"
                    as="label"
                    className="text-muted-foreground mb-2"
                  >
                    BODY/B-4
                  </Paragraph>
                  <Paragraph size="body-4">
                    AaBbCc - Chivo Regular, 16px/24px - Small text and labels
                  </Paragraph>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
