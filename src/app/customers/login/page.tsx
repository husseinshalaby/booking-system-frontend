import { LoginForm } from "@/components/login-form"
import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { UserType } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Adam - Customer Login",
  description: "Log in to your customer account to book services and manage orders.",
}

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
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
        <LoginForm userType={UserType.CUSTOMERS} />
      </div>
    </div>
  )
}