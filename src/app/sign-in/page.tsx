import { AppHeader } from "@/components/app-header";
import { AuthForm } from "@/components/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16" crux-attr="ex-863607">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Access your interview studies and session notes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode="sign-in" />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
