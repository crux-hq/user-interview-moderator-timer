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
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16" crux-attr="ex-863607">
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
  );
}
