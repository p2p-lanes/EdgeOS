import icon from "../../public/icon.png"

// TODO: Once tenant branding is implemented, derive name / images / metadata
// from the TenantPublic object (tenant.name, tenant.image_url, tenant.icon_url).
export const config = {
  metadata: {
    title: "Edge Portal",
    description:
      "Welcome to the Edge Portal. Log in or sign up to access Edge City events.",
    icon: icon.src,
    openGraph: {
      title: "Edge Portal",
      description:
        "Welcome to the Edge Portal. Log in or sign up to access Edge City events.",
      images: [
        {
          url: "https://simplefi.s3.us-east-2.amazonaws.com/edgecity.png",
          alt: "Edge Portal",
          width: 1200,
          height: 630,
        },
      ],
    },
  },
  name: "Edge Portal",
}
