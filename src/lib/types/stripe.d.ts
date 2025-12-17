import { MaritalStatus } from "@/stores/registrationStore";

declare module "stripe" {
  namespace Stripe {
    namespace Checkout {
      interface SessionCreateParams {
        metadata?: {
          maritalStatus?: MaritalStatus;
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          signature?: string;
          amount?: string;
        };
      }
    }
  }
}

