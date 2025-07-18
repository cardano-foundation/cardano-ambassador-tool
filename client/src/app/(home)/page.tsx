"use client";
import Title from "@/components/atoms/Title";
import Paragraph from "@/components/atoms/Paragraph";
import Input from "@/components/atoms/Input";
import Switch from "@/components/atoms/Switch";
import Dropdown from "@/components/atoms/Dropdown";
import Checkbox from "@/components/atoms/Checkbox";
import Button from "@/components/atoms/Button";
import TopNav from "@/components/Navigation/TabNav";
import TextArea from "@/components/atoms/TextArea";
import ThemeToggle from "@/components/ThemeToggle";
import Card, { CardHeader, CardContent } from "@/components/atoms/Card";
import { useState } from "react";

interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  onClick?: () => void;
}

export default function HomePage() {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [dropdownValue, setDropdownValue] = useState("");
  const [activeTab, setActiveTab] = useState("topics");

  const topNavTabs: TabItem[] = [
    { id: "topics", label: "Topics" },
    { id: "components", label: "Components" },
    { id: "forms", label: "Forms" },
    { id: "typography", label: "Typography" },
    { id: "ambassadors", label: "Ambassadors" },
  ];

  const handleTabChange = (tabId: string, tab: TabItem) => {
    console.log("Tab changed:", tabId, tab);
    setActiveTab(tabId);
  };

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

  const renderActiveSection = () => {
    switch (activeTab) {
      case "topics":
        return (
          <div className="space-y-8 h-full">
            <div className="text-center space-y-2">
              <Title level="2" className="">
                Welcome to Ambassador Tool
              </Title>
              <Paragraph size="body-2" className="text-muted-foreground">
                Comprehensive component library with universal card system
              </Paragraph>
            </div>

            <Card padding="md">
              <Title level="6" className="text-card-foreground mb-4">
                Theme Color Examples
              </Title>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Title
                  level="4"
                  className="text-black-500 text-sm sm:text-lg lg:text-xl"
                >
                  text-black-500
                </Title>
                <Title
                  level="4"
                  className="text-primary-base text-sm sm:text-lg lg:text-xl"
                >
                  text-primary-base
                </Title>
                <Title
                  level="4"
                  className="text-black-200 text-sm sm:text-lg lg:text-xl"
                >
                  text-black-200
                </Title>
                <Title
                  level="4"
                  className="text-primary-200 text-sm sm:text-lg lg:text-xl"
                >
                  text-primary-200
                </Title>
              </div>
            </Card>

            <section>
              <Title level="4" className="text-card-foreground mb-6">
                Statistics Cards
              </Title>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card padding="sm" className="text-center">
                  <Title level="5" className="text-card-foreground mb-1">
                    1,234
                  </Title>
                  <Paragraph size="body-4" className="text-muted-foreground">
                    Total Users
                  </Paragraph>
                </Card>
                <Card padding="sm" className="text-center">
                  <Title level="5" className="text-card-foreground mb-1">
                    567
                  </Title>
                  <Paragraph size="body-4" className="text-muted-foreground">
                    Active Today
                  </Paragraph>
                </Card>
                <Card padding="sm" className="text-center">
                  <Title level="5" className="text-card-foreground mb-1">
                    89%
                  </Title>
                  <Paragraph size="body-4" className="text-muted-foreground">
                    Success Rate
                  </Paragraph>
                </Card>
                <Card padding="sm" className="text-center">
                  <Title level="5" className="text-card-foreground mb-1">
                    234
                  </Title>
                  <Paragraph size="body-4" className="text-muted-foreground">
                    Pending
                  </Paragraph>
                </Card>
                <Card padding="sm" className="text-center">
                  <Title level="5" className="text-card-foreground mb-1">
                    #12
                  </Title>
                  <Paragraph size="body-4" className="text-muted-foreground">
                    Your Rank
                  </Paragraph>
                </Card>
              </div>
            </section>
          </div>
        );

      case "components":
        return (
          <div className="space-y-8 h-full">
            <Card padding="lg" className="w-full">
              <Paragraph
                size="body-3"
                className="font-semibold text-card-foreground mb-4"
              >
                Input Component States
              </Paragraph>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <Paragraph
                    size="body-4"
                    className="font-medium text-muted-foreground mb-3"
                  >
                    Default
                  </Paragraph>
                  <Input label="Name" placeholder="Type here..." />
                </div>
                <div>
                  <Paragraph
                    size="body-4"
                    className="font-medium text-muted-foreground mb-3"
                  >
                    Error
                  </Paragraph>
                  <Input
                    label="Error Input"
                    placeholder="Type here..."
                    error={true}
                    errorMessage="Required field"
                  />
                </div>
                <div>
                  <Paragraph
                    size="body-4"
                    className="font-medium text-card-foreground mb-3"
                  >
                    Disabled
                  </Paragraph>
                  <Input
                    label="Disabled Input"
                    placeholder="Cannot edit"
                    disabled={true}
                  />
                </div>
                <div>
                  <Paragraph
                    size="body-4"
                    className="font-medium text-card-foreground mb-3"
                  >
                    With Value
                  </Paragraph>
                  <Input label="Filled Input" value="Sample text" readOnly />
                </div>
              </div>
            </Card>

            <Card padding="lg" className="w-full">
              <Title level="4" className="text-card-foreground mb-6">
                Component Testing Suite
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <Paragraph
                    size="body-2"
                    className="font-semibold text-card-foreground mb-4"
                  >
                    Switch Component
                  </Paragraph>
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
                  <Paragraph
                    size="body-2"
                    className="font-semibold text-card-foreground mb-4"
                  >
                    Checkbox Component
                  </Paragraph>
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
                  <Paragraph
                    size="body-2"
                    className="font-semibold text-card-foreground mb-4"
                  >
                    Button Variants
                  </Paragraph>
                  <div className="space-y-3">
                    <Button variant="primary" size="md" className="w-full">
                      Primary
                    </Button>
                    <Button variant="secondary" size="md" className="w-full">
                      Secondary
                    </Button>
                    <Button variant="ghost" size="md" className="w-full">
                      Ghost
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      rounded="full"
                      className="w-full"
                    >
                      Outline
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Paragraph
                    size="body-2"
                    className="font-semibold text-card-foreground mb-4"
                  >
                    Dropdown Component
                  </Paragraph>
                  <div className="space-y-3">
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
            </Card>
          </div>
        );

      case "forms":
        return (
          <Card padding="lg" className="w-full max-w-none">
            <CardHeader
              title="Interactive Form Example"
              subtitle="Test your form components with real interactions"
            />
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Code"
                    placeholder="ABC123"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <Input label="Phone" placeholder="+1 (555) 123-4567" />
                </div>

                <Input
                  label="Email Address"
                  placeholder="john.doe@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />

                <Input
                  label="Full Address"
                  placeholder="Enter your complete address"
                />
                <TextArea
                  label="Description"
                  rows={4}
                  errorMessage="Please enter a valid description."
                />

                <div className="space-y-2">
                  <Paragraph
                    size="body-4"
                    as="label"
                    className="text-muted-foreground"
                  >
                    Country
                  </Paragraph>
                  <Dropdown
                    options={dropdownOptions}
                    value={formData.country}
                    onValueChange={(value) =>
                      setFormData({ ...formData, country: value })
                    }
                    placeholder="Select your country..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={formData.notifications}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notifications: checked })
                    }
                  />
                  <Paragraph size="body-4" as="span">
                    I agree to receive notifications and updates
                  </Paragraph>
                </div>

                <div className="pt-2">
                  <Button variant="primary" className="w-full">
                    Submit Form
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "typography":
        return (
          <Card padding="lg" className="w-full">
            <Title level="4" className="text-content mb-6">
              Typography Specifications
            </Title>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card padding="md">
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
                </Card>

                <Card padding="md">
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
                </Card>
              </div>

              <div className="space-y-4">
                <Card padding="md">
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
                </Card>

                <Card padding="md">
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
                </Card>
              </div>
            </div>
          </Card>
        );

      case "ambassadors":
        return (
          <section>
            <Title level="4" className="text-card-foreground mb-6">
              Ambassador Directory
            </Title>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 justify-items-center">
              {[
                {
                  name: "Augustine Franchelis",
                  country: "Argentina",
                  initials: "AF",
                  gradient: "from-orange-400 to-red-500",
                },
                {
                  name: "Alexandra D.",
                  country: "Romania",
                  initials: "AD",
                  gradient: "from-purple-400 to-pink-500",
                },
                {
                  name: "Andreas Sosilo",
                  country: "Indonesia",
                  initials: "AS",
                  gradient: "from-blue-400 to-cyan-500",
                },
                {
                  name: "Benjamin Baani",
                  country: "Ghana",
                  initials: "BB",
                  gradient: "from-green-400 to-emerald-500",
                },
                {
                  name: "Clara Martinez",
                  country: "Spain",
                  initials: "CM",
                  gradient: "from-rose-400 to-pink-500",
                },
              ].map((ambassador, index) => (
                <Card
                  key={index}
                  padding="md"
                  className="w-full max-w-[240px] h-[280px] text-center flex flex-col"
                >
                  <div className="flex flex-col items-center justify-between h-full py-3">
                    <div className="flex-shrink-0 mb-4">
                      <div
                        className={`w-16 h-16 rounded-full bg-gradient-to-br ${ambassador.gradient} flex items-center justify-center mx-auto`}
                      >
                        <Title
                          level="6"
                          className="text-white text-lg font-bold"
                        >
                          {ambassador.initials}
                        </Title>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center min-h-0">
                      <Title
                        level="6"
                        className="text-card-foreground leading-tight mb-2 text-base line-clamp-2"
                      >
                        {ambassador.name}
                      </Title>
                      <Paragraph
                        size="body-4"
                        className="text-muted-foreground text-sm mb-4"
                      >
                        {ambassador.country}
                      </Paragraph>
                    </div>

                    <div className="flex-shrink-0 w-full mt-auto">
                      <Button
                        variant={
                          index === 2 || index === 4 ? "secondary" : "primary"
                        }
                        size="sm"
                        className="w-full"
                      >
                        {index === 2
                          ? "Pending"
                          : index === 4
                            ? "Following"
                            : "Follow"}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full">
      <div className="bg-background px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Paragraph size="body-4" className="text-muted-foreground">
            Ambassador Tool
          </Paragraph>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
      <div className="bg-background border-b border-border px-6">
        <TopNav
          tabs={topNavTabs}
          activeTabId={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveSection()}
      </main>
    </div>
  );
}
