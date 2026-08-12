import { AuthForm } from "@/components/auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Email and password — your studies stay private to you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="sign-up" />
        </CardContent>
      </Card>
    </main>
  );
}
