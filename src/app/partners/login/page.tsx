import { LoginForm } from "@/components/login-form"
import Link from "next/link"
import Image from "next/image"
import { UserType } from "@/lib/constants"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <Image
            src="/logo.jpeg" 
            alt="Adam Logo" 
            width={32}
            height={32}
            className="size-8 rounded-md object-cover"
          />
          Adam
        </Link>
        <LoginForm userType={UserType.PARTNERS} />
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By signing in, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}