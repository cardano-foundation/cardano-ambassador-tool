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
            <h1 className="text-3xl font-bold text-muted-foreground mb-4">
              Welcome to Ambassador Tool
            </h1>

            <h1 className="text-xl font-bold text-muted-foreground">
              Ambassador Tool, Color Palette
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-semibold text-sunset-50 mb-4">
                Primary Actions
              </h2>
              <div className="space-y-3">
                <PrimaryButton className="w-full">Primary Button</PrimaryButton>
                <SecondaryButton className="w-full">
                  Secondary Button
                </SecondaryButton>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4">Form Example</h2>
              <div className="space-y-3">
                <Input placeholder="Enter your name" />
                <Input placeholder="Enter your email" type="email" />
                <PrimaryButton>Submit</PrimaryButton>
              </div>
            </Card>
          </div>

          <div className="space-y-4 text-foreground"></div>
        </div>
      </main>
    </div>
  );
}
