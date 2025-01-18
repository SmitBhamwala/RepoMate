import { CardWrapper } from "@/components/auth/card-wrapper";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { FormError } from "@/components/form-error";

export default function ErrorCard() {
  return (
    <CardWrapper
      headerLabel=""
      backButtonLabel="Back to Login"
      backButtonHref="/auth/login"
    >
      <div className="w-full flex justify-center items-center">
        <FormError message="Oops! Something went wrong!!" />
      </div>
    </CardWrapper>
  );
}
