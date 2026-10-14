import { redirect } from "next/navigation";

/** image 디버그 → /?debug=image */
export default function ImageDebugPage() {
    redirect("/?debug=image");
}
