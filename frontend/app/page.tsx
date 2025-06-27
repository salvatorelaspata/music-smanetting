import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MusicNoteIcon, ScanIcon, EditIcon, ChartIcon, HistoryIcon } from "@/components/icons/MusicIcons";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted flex justify-center">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Scan and Analyze Sheet Music with AI
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Transform printed music into digital notation. Edit, analyze, and annotate your sheet music with our powerful tools.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="/scan">Start Scanning</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Features
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need to digitize and work with your sheet music.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <FeatureCard
              icon={<ScanIcon className="h-10 w-10" />}
              title="Scan Music"
              description="Upload photos or use your camera to scan sheet music with high accuracy."
            />
            <FeatureCard
              icon={<MusicNoteIcon className="h-10 w-10" />}
              title="Notation Recognition"
              description="Advanced AI detects notes, rests, time signatures, and other musical elements."
            />
            <FeatureCard
              icon={<EditIcon className="h-10 w-10" />}
              title="Interactive Editor"
              description="Make corrections and annotations to ensure perfect notation."
            />
            <FeatureCard
              icon={<ChartIcon className="h-10 w-10" />}
              title="Music Analysis"
              description="Get insights on key, tempo, and structure of your music pieces."
            />
            <FeatureCard
              icon={<HistoryIcon className="h-10 w-10" />}
              title="History Tracking"
              description="Access your previously scanned and edited sheet music anytime."
            />
            <FeatureCard
              icon={<MusicNoteIcon className="h-10 w-10" />}
              title="Export Options"
              description="Download your music as PDFs, MusicXML, or other formats."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-muted w-full">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Simple steps to digitize your sheet music in minutes.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-8">
            <StepCard
              number="1"
              title="Scan"
              description="Upload an image or take a photo of your sheet music."
            />
            <StepCard
              number="2"
              title="Edit"
              description="Review and make any necessary corrections to the detected notation."
            />
            <StepCard
              number="3"
              title="Analyze"
              description="Get insights and export your digitized sheet music."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Transform your sheet music into digital format today.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="/scan">Start Scanning Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="flex flex-col items-center text-center p-2 transition-all hover:shadow-lg">
      <CardContent className="flex flex-col items-center pt-6">
        <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center bg-primary/10 justify-center rounded-full bold text-2xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}