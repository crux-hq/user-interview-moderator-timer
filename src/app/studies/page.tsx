import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listStudies } from "@/lib/actions";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const studies = await listStudies();

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-8" crux-attr="ex-501843">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight">Studies</h1>
            <p className="mt-1 text-muted-foreground">
              Create interview scripts, add participants, and run timed sessions.
            </p>
          </div>
          <Link
            href="/studies/new"
            className={cn(buttonVariants(), "inline-flex items-center gap-1.5")}
          >
            <Plus className="size-4" />
            Create study
          </Link>
        </div>

        {studies.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No studies yet</CardTitle>
              <CardDescription>
                Start by creating a study with your client name, guides, and
                discussion sections.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/studies/new"
                className={cn(buttonVariants(), "inline-flex")}
              >
                Create your first study
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {studies.map((study) => (
              <Link key={study.id} href={`/studies/${study.id}`}>
                <Card className="transition-colors hover:bg-muted/40">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardDescription>{study.clientName}</CardDescription>
                      <CardTitle className="mt-1 text-xl">
                        {study.studyName}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {study.sessionDurationMinutes} min
                      </Badge>
                      <Badge variant="outline">
                        {study.participantCount} participant
                        {study.participantCount === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
