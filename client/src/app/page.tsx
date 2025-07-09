import {
  Navigation,
  Card,
  PrimaryButton,
  SecondaryButton,
  Input,
} from "@/components/ui-components";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Welcome to Ambassador Tool
            </h1>
            <p className="text-muted-foreground text-lg">
              Testing color palette with Tailwind CSS 4 and theme switching
              capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Primary Actions
              </h2>
              <div className="space-y-3">
                <PrimaryButton className="w-full">Primary Button</PrimaryButton>
                <SecondaryButton className="w-full">
                  Secondary Button
                </SecondaryButton>
                <button className="w-full px-4 py-2 bg-accent hover:bg-sunset-300 text-white rounded-md transition-colors">
                  Accent Button
                </button>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Form Example
              </h2>
              <div className="space-y-3">
                <Input placeholder="Enter your name" />
                <Input placeholder="Enter your email" type="email" />
                <textarea
                  placeholder="Your message"
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-1 focus:ring-ring"
                  rows={3}
                />
                <PrimaryButton className="w-full">Submit</PrimaryButton>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Notifications
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-sunset-50 border border-sunset-200 text-sunset-500 rounded-md">
                  <p className="font-medium">Success!</p>
                  <p className="text-sm">Your action was completed.</p>
                </div>
                <div className="p-3 bg-muted border border-border text-muted-foreground rounded-md">
                  <p className="font-medium">Info</p>
                  <p className="text-sm">Some information.</p>
                </div>
                <div className="p-3 bg-gray-100 border border-gray-300 text-gray-800 rounded-md">
                  <p className="font-medium">Warning</p>
                  <p className="text-sm">Please check this carefully.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Sunset Color Scale
              </h2>
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
              <p className="text-muted-foreground text-sm">
                Sunset Orange palette - primary brand colors
              </p>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-card-foreground mb-4">
                Gray Color Scale
              </h2>
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
                <div className="bg-gray-600 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  600
                </div>
                <div className="bg-gray-800 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  800
                </div>
                <div className="bg-gray-900 h-12 rounded flex items-center justify-center text-xs font-medium text-white">
                  900
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Neutral grays - backgrounds and text
              </p>
            </Card>
          </div>

          <Card>
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Interactive Elements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Navigation Links
                </h3>
                <nav className="space-y-1">
                  <a
                    href="#"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    Dashboard
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 text-foreground bg-muted rounded-md"
                  >
                    Current Page
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    Settings
                  </a>
                  <a
                    href="#"
                    className="block px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    Profile
                  </a>
                </nav>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Form Controls
                </h3>
                <div className="space-y-2">
                  <select className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:ring-1 focus:ring-ring">
                    <option>Select option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary border-input rounded focus:ring-ring"
                    />
                    <label className="text-foreground">Checkbox option</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="radio"
                      className="w-4 h-4 text-primary border-input focus:ring-ring"
                    />
                    <label className="text-foreground">Radio option</label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-2">
                  Status Indicators
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-sunset-500 rounded-full"></div>
                    <span className="text-foreground">Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-muted-foreground">Inactive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-foreground">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
